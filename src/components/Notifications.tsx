import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, limit, onSnapshot, query, where } from 'firebase/firestore';
import { Bell, CheckCheck, CircleDollarSign, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { Deal, DealStatus } from '../types';
import { cn, formatCompactNumber } from '../lib/utils';
import { isAdmin, isSeller } from '../lib/rbac';

type NotificationItem = {
  id: string;
  dealId: string;
  title: string;
  desc: string;
  createdAt: string;
  type: 'offer' | 'status';
};

const statusLabels: Record<DealStatus, { vi: string; en: string }> = {
  draft: { vi: 'Bản nháp', en: 'Draft' },
  submitted: { vi: 'Đã gửi', en: 'Submitted' },
  under_review: { vi: 'Đang xem xét', en: 'Under review' },
  approved: { vi: 'Đã phê duyệt', en: 'Approved' },
  published: { vi: 'Xuất bản', en: 'Published' },
  negotiation: { vi: 'Đàm phán', en: 'Negotiation' },
  closed: { vi: 'Đóng cửa', en: 'Closed' },
};

function readJsonMap(key: string) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

export default function Notifications() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const vi = language === 'vi';
  const seenOffersKey = user ? `nexus_seen_offers_${user.uid}` : '';
  const seenStatusesKey = user ? `nexus_seen_statuses_${user.uid}` : '';

  useEffect(() => {
    if (!user || (!isSeller(profile) && !isAdmin(profile))) {
      setItems([]);
      return;
    }

    const dealsQuery = isAdmin(profile)
      ? query(collection(db, 'deals'), limit(50))
      : query(collection(db, 'deals'), where('sellerId', '==', user.uid), limit(50));

    const unsubscribe = onSnapshot(dealsQuery, async snapshot => {
      const ownedDeals = snapshot.docs.map(item => ({ id: item.id, ...item.data() } as Deal));
      const seenOffers = readJsonMap(seenOffersKey);
      const seenStatuses = readJsonMap(seenStatusesKey);
      const nextStatuses = { ...seenStatuses };
      const notifications: NotificationItem[] = [];

      for (const deal of ownedDeals) {
        const previousStatus = seenStatuses[deal.id];
        if (previousStatus && previousStatus !== deal.status) {
          notifications.push({
            id: `status-${deal.id}-${deal.status}`,
            dealId: deal.id,
            type: 'status',
            title: vi ? 'Trạng thái thương vụ đã đổi' : 'Deal status changed',
            desc: vi
              ? `${deal.title}: ${statusLabels[deal.status]?.vi || deal.status}`
              : `${deal.title}: ${statusLabels[deal.status]?.en || deal.status}`,
            createdAt: deal.updatedAt || new Date().toISOString(),
          });
        }
        nextStatuses[deal.id] = deal.status;

        try {
          const offersSnap = await getDocs(query(collection(db, `deals/${deal.id}/offers`), limit(20)));
          offersSnap.docs.forEach(offerDoc => {
            const offer = offerDoc.data();
            const offerKey = `${deal.id}:${offerDoc.id}`;
            if (!seenOffers[offerKey]) {
              notifications.push({
                id: `offer-${offerKey}`,
                dealId: deal.id,
                type: 'offer',
                title: vi ? 'Có offer mới' : 'New offer received',
                desc: vi
                  ? `${deal.title}: ${formatCompactNumber(Number(offer.amount) || 0, language)}`
                  : `${deal.title}: ${formatCompactNumber(Number(offer.amount) || 0, language)}`,
                createdAt: offer.createdAt || new Date().toISOString(),
              });
            }
          });
        } catch (error) {
          console.error('Offer notification fetch failed:', error);
        }
      }

      localStorage.setItem(seenStatusesKey, JSON.stringify(nextStatuses));
      setItems(notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12));
    }, error => {
      console.error('Notification listener failed:', error);
    });

    return () => unsubscribe();
  }, [language, profile, seenOffersKey, seenStatusesKey, user]);

  const unreadCount = items.length;

  const markRead = () => {
    if (!user) return;
    const seenOffers = readJsonMap(seenOffersKey);
    items.forEach(item => {
      if (item.type === 'offer') {
        seenOffers[item.id.replace('offer-', '')] = new Date().toISOString();
      }
    });
    localStorage.setItem(seenOffersKey, JSON.stringify(seenOffers));
    setItems([]);
    setOpen(false);
  };

  const emptyCopy = useMemo(() => vi ? 'Chưa có thông báo mới' : 'No new notifications', [vi]);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="relative rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-blue-600"
        title={vi ? 'Thông báo' : 'Notifications'}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="text-sm font-bold text-slate-900">{vi ? 'Thông báo' : 'Notifications'}</div>
            <button
              type="button"
              onClick={markRead}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {vi ? 'Đã đọc' : 'Mark read'}
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm font-medium text-slate-400">{emptyCopy}</div>
            ) : (
              items.map(item => (
                <Link
                  key={item.id}
                  to={`/deals/${item.dealId}`}
                  onClick={() => setOpen(false)}
                  className="flex gap-3 border-b border-slate-50 px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-50"
                >
                  <div className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                    item.type === 'offer' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700',
                  )}>
                    {item.type === 'offer' ? <CircleDollarSign className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-slate-900">{item.title}</div>
                    <div className="mt-0.5 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">{item.desc}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
