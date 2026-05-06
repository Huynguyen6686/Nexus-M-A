import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import {
  Activity,
  AlertOctagon,
  ArrowUpRight,
  BarChart3,
  Bookmark,
  Building2,
  CheckCircle2,
  DollarSign,
  Eye,
  GitBranch,
  Megaphone,
  PieChart,
  Sparkles,
  Target,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Deal, Offer, UserProfile } from '../types';
import { cn, formatCompactNumber, formatCurrency } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import {
  canAccessAdmin,
  canCreateDeal,
  canManageDeal,
  isAdmin as hasAdminRole,
  isBuyerLike as hasBuyerLikeRole,
  isSeller as hasSellerRole,
} from '../lib/rbac';

type DealWatch = {
  id: string;
  dealId: string;
  title?: string;
  industry?: string;
  valuation?: number;
  status?: Deal['status'];
  createdAt?: string;
  updatedAt?: string;
};

type ChartRow = {
  key: string;
  label: string;
  value: number;
  amount?: number;
};

const statusKeys = {
  draft: 'statusDraft',
  submitted: 'statusSubmitted',
  under_review: 'statusUnderReview',
  approved: 'statusApproved',
  published: 'statusPublished',
  negotiation: 'statusNegotiation',
  closed: 'statusClosed',
} as const;

const statusOrder: Deal['status'][] = ['submitted', 'under_review', 'approved', 'published', 'negotiation', 'closed'];

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function asDate(value?: string) {
  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

function shortDate(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN');
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { t, tSector, language } = useLanguage();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [savedDeals, setSavedDeals] = useState<DealWatch[]>([]);
  const [followedDeals, setFollowedDeals] = useState<DealWatch[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const lang = language;
  const isAdmin = hasAdminRole(profile);
  const isSeller = hasSellerRole(profile);
  const isBuyerLike = hasBuyerLikeRole(profile);

  useEffect(() => {
    if (!user) return;

    const fetchUserWatchList = async (collectionName: 'savedDeals' | 'followedDeals') => {
      try {
        const snap = await getDocs(query(collection(db, `users/${user.uid}/${collectionName}`), limit(100)));
        return snap.docs.map(item => ({ id: item.id, ...item.data() } as DealWatch));
      } catch (error) {
        console.warn(`${collectionName} skipped:`, error);
        return [];
      }
    };

    const fetchDealById = async (dealId: string) => {
      try {
        const snap = await getDoc(doc(db, 'deals', dealId));
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Deal) : null;
      } catch (error) {
        console.warn('Deal analytics item skipped:', dealId, error);
        return null;
      }
    };

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const nextSaved = await fetchUserWatchList('savedDeals');
        const nextFollowed = await fetchUserWatchList('followedDeals');
        let nextDeals: Deal[] = [];
        let nextOffers: Offer[] = [];

        if (isAdmin || isSeller) {
          const dealsQ = isAdmin
            ? query(collection(db, 'deals'), orderBy('createdAt', 'desc'), limit(80))
            : query(collection(db, 'deals'), where('sellerId', '==', user.uid), orderBy('createdAt', 'desc'), limit(80));

          const dealsSnap = await getDocs(dealsQ);
          nextDeals = dealsSnap.docs.map(item => ({ id: item.id, ...item.data() } as Deal));

          const offerReads = await Promise.all(
            nextDeals.map(async deal => {
              try {
                const offersSnap = await getDocs(collection(db, `deals/${deal.id}/offers`));
                return offersSnap.docs.map(item => ({ id: item.id, ...item.data() } as Offer));
              } catch (error) {
                console.warn('Deal offer analytics skipped:', deal.id, error);
                return [];
              }
            })
          );
          nextOffers = offerReads.flat();
        } else {
          try {
            const buyerOffersQ = query(collectionGroup(db, 'offers'), where('buyerId', '==', user.uid), limit(100));
            const buyerOffersSnap = await getDocs(buyerOffersQ);
            nextOffers = buyerOffersSnap.docs.map(item => ({ id: item.id, ...item.data() } as Offer));
          } catch (error) {
            console.warn('Buyer offer analytics skipped:', error);
          }

          const dealIds = Array.from(new Set([
            ...nextOffers.map(offer => offer.dealId),
            ...nextSaved.map(item => item.dealId),
            ...nextFollowed.map(item => item.dealId),
          ].filter(Boolean)));

          const dealReads = await Promise.all(dealIds.map(fetchDealById));
          nextDeals = dealReads.filter((deal): deal is Deal => deal !== null);
        }

        setDeals(nextDeals);
        setOffers(nextOffers);
        setSavedDeals(nextSaved);
        setFollowedDeals(nextFollowed);

        if (isAdmin) {
          try {
            const usersSnap = await getDocs(query(collection(db, 'users'), limit(500)));
            setUserCount(usersSnap.docs.map(item => item.data() as UserProfile).length);
          } catch (error) {
            console.warn('User analytics skipped:', error);
          }
        } else {
          setUserCount(1);
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, profile?.userType, isAdmin, isSeller]);

  const handleDelete = async (dealId: string) => {
    if (!profile || !user) return;
    const deal = deals.find(item => item.id === dealId);
    if (!canManageDeal(profile, user.uid, deal)) return;

    setDeletingId(dealId);
    try {
      await deleteDoc(doc(db, 'deals', dealId));
      setDeals(prev => prev.filter(item => item.id !== dealId));
      setConfirmDeleteId(null);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `deals/${dealId}`);
      } catch (e: any) {
        alert(`Không xóa được thương vụ.\n\n${e.message}`);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const dealStatusLabel = (status: Deal['status']) => t(statusKeys[status] || String(status));

  const analytics = useMemo(() => {
    const totalValuation = deals.reduce((sum, deal) => sum + (Number(deal.mandaInfo.valuation) || 0), 0);
    const publishedCount = deals.filter(deal => deal.status === 'published').length;
    const pendingCount = deals.filter(deal => ['submitted', 'under_review', 'approved'].includes(deal.status)).length;
    const acceptedOfferCount = offers.filter(offer => offer.status === 'accepted').length;
    const totalOfferValue = offers.reduce((sum, offer) => sum + (Number(offer.amount) || 0), 0);
    const answeredOffers = offers.filter(offer => offer.status !== 'pending').length;

    const statusRows: ChartRow[] = statusOrder
      .map(status => ({
        key: status,
        label: dealStatusLabel(status),
        value: deals.filter(deal => deal.status === status).length,
      }))
      .filter(row => row.value > 0);

    const industryMap = new Map<string, ChartRow>();
    deals.forEach(deal => {
      const current = industryMap.get(deal.industry) || {
        key: deal.industry,
        label: tSector(deal.industry),
        value: 0,
        amount: 0,
      };
      current.value += 1;
      current.amount = (current.amount || 0) + (Number(deal.mandaInfo.valuation) || 0);
      industryMap.set(deal.industry, current);
    });

    const industryRows = Array.from(industryMap.values())
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 5);

    const funnel = isBuyerLike
      ? [
          { label: 'Đã lưu', value: savedDeals.length, helper: 'Danh sách quan tâm' },
          { label: 'Theo dõi', value: followedDeals.length, helper: 'Nhận cập nhật trạng thái' },
          { label: 'Đã gửi offer', value: offers.length, helper: 'Có lịch sử offer' },
          { label: 'Được phản hồi', value: answeredOffers, helper: `${percent(answeredOffers, offers.length)}% offer` },
          { label: 'Thành công', value: acceptedOfferCount, helper: `${percent(acceptedOfferCount, offers.length)}% offer` },
        ]
      : [
          { label: 'Tin đăng', value: deals.length, helper: 'Tổng thương vụ' },
          { label: 'Đang niêm yết', value: publishedCount, helper: `${percent(publishedCount, deals.length)}% danh mục` },
          { label: 'Nhận offer', value: offers.length, helper: 'Từ nhà đầu tư' },
          { label: 'Được phản hồi', value: answeredOffers, helper: `${percent(answeredOffers, offers.length)}% offer` },
          { label: 'Đã chốt', value: deals.filter(deal => deal.status === 'closed').length, helper: `${acceptedOfferCount} offer đã nhận` },
        ];

    const recentActivity = [
      ...offers.map(offer => ({
        id: `offer-${offer.id}`,
        title: offer.type === 'counter' ? 'Counter-offer mới' : 'Offer mới',
        desc: `${formatCompactNumber(offer.amount, lang)} · ${offer.status}`,
        date: offer.updatedAt || offer.createdAt,
        color: offer.status === 'accepted' ? 'bg-green-500' : 'bg-blue-500',
      })),
      ...deals.map(deal => ({
        id: `deal-${deal.id}`,
        title: deal.title,
        desc: dealStatusLabel(deal.status),
        date: deal.updatedAt || deal.createdAt,
        color: deal.status === 'published' ? 'bg-green-500' : 'bg-slate-300',
      })),
      ...savedDeals.map(item => ({
        id: `saved-${item.dealId}`,
        title: item.title || 'Thương vụ đã lưu',
        desc: 'Đã lưu vào danh mục',
        date: item.updatedAt || item.createdAt,
        color: 'bg-amber-500',
      })),
    ].sort((a, b) => asDate(b.date) - asDate(a.date)).slice(0, 6);

    return {
      totalValuation,
      publishedCount,
      pendingCount,
      acceptedOfferCount,
      totalOfferValue,
      answeredOffers,
      statusRows,
      industryRows,
      funnel,
      recentActivity,
    };
  }, [deals, offers, savedDeals, followedDeals, isBuyerLike, lang, tSector]);

  const kpis = isAdmin
    ? [
        { label: 'Tổng thương vụ', value: `${deals.length}`, icon: Building2, trend: `${analytics.pendingCount} chờ duyệt` },
        { label: 'Người dùng', value: `${userCount}`, icon: Users, trend: 'Từ Firestore' },
        { label: 'Tổng giá trị', value: formatCompactNumber(analytics.totalValuation, lang), icon: DollarSign, trend: `${analytics.publishedCount} đang xuất bản` },
        { label: 'Offer', value: `${offers.length}`, icon: CheckCircle2, trend: `${analytics.acceptedOfferCount} đã chấp nhận` },
      ]
    : isBuyerLike
      ? [
          { label: 'Đã lưu', value: `${savedDeals.length}`, icon: Bookmark, trend: `${followedDeals.length} đang theo dõi` },
          { label: 'Giá trị offer', value: formatCompactNumber(analytics.totalOfferValue, lang), icon: DollarSign, trend: `${offers.length} offer` },
          { label: 'Thương vụ liên quan', value: `${deals.length}`, icon: Building2, trend: `${analytics.publishedCount} đang niêm yết` },
          { label: 'Tỷ lệ phản hồi', value: `${percent(analytics.answeredOffers, offers.length)}%`, icon: CheckCircle2, trend: 'Theo offer' },
        ]
      : [
          { label: 'Thương vụ của tôi', value: `${deals.length}`, icon: Building2, trend: `${analytics.publishedCount} đang niêm yết` },
          { label: 'Offer nhận được', value: `${offers.length}`, icon: Users, trend: `${analytics.acceptedOfferCount} đã chấp nhận` },
          { label: 'Tổng giá trị', value: formatCompactNumber(analytics.totalValuation, lang), icon: DollarSign, trend: 'Danh mục thật' },
          { label: 'Đang xử lý', value: `${analytics.pendingCount}`, icon: CheckCircle2, trend: 'Review/KYC/duyệt' },
        ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const maxStatus = Math.max(...analytics.statusRows.map(row => row.value), 1);
  const maxIndustry = Math.max(...analytics.industryRows.map(row => row.amount || row.value), 1);
  const maxFunnel = Math.max(...analytics.funnel.map(row => row.value), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-slate-900">{t('professionalWorkspace')}</h1>
          <p className="text-sm font-medium text-slate-500">{t('portfolioOverview')} {profile?.displayName}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canCreateDeal(profile) && (
            <Link to="/deals/new" className="professional-btn shadow-lg shadow-blue-600/20">
              {t('createProposal')}
            </Link>
          )}
          {canAccessAdmin(profile) && (
            <Link to="/admin" className="professional-btn bg-slate-900 shadow-lg shadow-slate-900/10 hover:bg-black">
              {t('adminNav')}
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="glass-card min-w-0 overflow-hidden rounded-xl bg-white p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <kpi.icon className="h-5 w-5" />
              </div>
              <span className="truncate rounded-full border border-green-100 bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-600">
                {kpi.trend}
              </span>
            </div>
            <div className="truncate text-2xl font-bold text-slate-900">{kpi.value}</div>
            <div className="metric-label mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="glass-card rounded-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">Conversion funnel</h2>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isBuyerLike ? 'Buyer/advisor' : isAdmin ? 'Admin' : 'Seller'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              {analytics.funnel.map((stage, index) => (
                <div key={stage.label} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-500">{index + 1}</span>
                    <span className="text-[10px] font-bold text-blue-600">{percent(stage.value, maxFunnel)}%</span>
                  </div>
                  <div className="truncate text-2xl font-bold text-slate-900">{stage.value}</div>
                  <div className="mt-1 break-words text-xs font-bold text-slate-700">{stage.label}</div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(6, percent(stage.value, maxFunnel))}%` }} />
                  </div>
                  <div className="mt-2 text-[10px] font-semibold leading-relaxed text-slate-400">{stage.helper}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl bg-white p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isBuyerLike ? 'Danh mục quan tâm' : t('portfolioLifecycle')}
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  {isBuyerLike ? 'Gồm thương vụ đã lưu, đang theo dõi và đã gửi offer.' : 'Chỉ hiển thị thương vụ thuộc quyền xem của tài khoản hiện tại.'}
                </p>
              </div>
              <Link to="/" className="text-xs font-semibold text-blue-600 hover:underline">{t('marketplace')} →</Link>
            </div>

            <div className="space-y-3">
              {deals.length > 0 ? deals.map(deal => {
                const manageable = canManageDeal(profile, user?.uid, deal);
                return (
                  <div key={deal.id} className="glass-card flex items-center justify-between overflow-hidden rounded-xl bg-white p-4 transition-all hover:border-blue-400">
                    <button type="button" onClick={() => navigate(`/deals/${deal.id}`)} className="flex min-w-0 flex-1 gap-4 text-left">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 font-bold text-slate-600">
                        {deal.title.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2 font-semibold text-slate-900">
                          <span className="truncate">{deal.title}</span>
                          <span className={cn(
                            'shrink-0 rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                            deal.status === 'published' ? 'border-green-100 bg-green-50 text-green-600' : 'border-slate-200 bg-slate-100 text-slate-600'
                          )}>
                            {dealStatusLabel(deal.status)}
                          </span>
                        </div>
                        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                          <span>{shortDate(deal.updatedAt)}</span>
                          <span className="truncate">{tSector(deal.industry)}</span>
                          <span className="truncate">{formatCompactNumber(deal.mandaInfo.valuation, lang)}</span>
                        </div>
                      </div>
                    </button>

                    <div className="ml-4 flex shrink-0 items-center gap-2">
                      <div className="hidden max-w-[120px] text-right sm:block">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('askingPrice')}</div>
                        <div className="truncate text-lg font-bold text-slate-900" title={formatCurrency(deal.mandaInfo.valuation, lang)}>
                          {formatCompactNumber(deal.mandaInfo.valuation, lang)}
                        </div>
                      </div>
                      {manageable && (
                        <AnimatePresence mode="wait">
                          {confirmDeleteId === deal.id ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="flex items-center gap-1 rounded-xl border border-rose-100 bg-rose-50 p-0.5 pr-2"
                            >
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-white hover:text-rose-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(deal.id)}
                                disabled={deletingId === deal.id}
                                className="flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-rose-700 disabled:opacity-50"
                              >
                                {deletingId === deal.id ? <Trash2 className="h-3 w-3 animate-spin" /> : <AlertOctagon className="h-3 w-3" />}
                                {t('confirm')}
                              </button>
                            </motion.div>
                          ) : (
                            <motion.button
                              key="trash"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              type="button"
                              onClick={() => setConfirmDeleteId(deal.id)}
                              className="rounded-xl border border-transparent p-2.5 text-slate-300 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
                              title={t('delete')}
                            >
                              <Trash2 className="h-5 w-5" />
                            </motion.button>
                          )}
                        </AnimatePresence>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate(`/deals/${deal.id}`)}
                        className="rounded-xl border border-transparent p-2.5 text-slate-300 transition-all hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="rounded-xl border-2 border-dashed bg-slate-50/50 p-12 text-center">
                  <Building2 className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                  <h3 className="font-bold text-slate-800">{t('workspaceEmpty')}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t('workspaceEmptyDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Phân bổ trạng thái</h3>
            </div>
            <div className="space-y-4">
              {analytics.statusRows.length > 0 ? analytics.statusRows.map(row => (
                <div key={row.key}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold">
                    <span className="truncate text-slate-600">{row.label}</span>
                    <span className="text-slate-900">{row.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(8, percent(row.value, maxStatus))}%` }} />
                  </div>
                </div>
              )) : (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-xs font-medium text-slate-500">Chưa có dữ liệu trạng thái.</p>
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Ngành nổi bật</h3>
            </div>
            <div className="space-y-4">
              {analytics.industryRows.length > 0 ? analytics.industryRows.map(row => (
                <div key={row.key}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold">
                    <span className="truncate text-slate-600">{row.label}</span>
                    <span className="text-slate-900">{formatCompactNumber(row.amount || 0, lang)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.max(8, percent(row.amount || row.value, maxIndustry))}%` }} />
                  </div>
                </div>
              )) : (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-xs font-medium text-slate-500">Chưa có dữ liệu ngành.</p>
              )}
            </div>
          </div>

          {isBuyerLike && (
            <div className="glass-card rounded-2xl bg-white p-5">
              <div className="mb-5 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Saved/followed deals</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Bookmark className="mb-3 h-4 w-4 text-amber-500" />
                  <div className="text-2xl font-bold text-slate-900">{savedDeals.length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đã lưu</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Eye className="mb-3 h-4 w-4 text-blue-600" />
                  <div className="text-2xl font-bold text-slate-900">{followedDeals.length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Theo dõi</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[...followedDeals, ...savedDeals].slice(0, 4).map(item => (
                  <Link key={`${item.id}-${item.dealId}`} to={`/deals/${item.dealId}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-200 hover:text-blue-600">
                    <span className="truncate">{item.title || item.dealId}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="ai-glow space-y-4 rounded-xl bg-white p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-blue-600">{t('aiIntelligence')}</span>
            </div>
            <p className="text-xs font-medium leading-relaxed text-slate-600">{t('aiMatchingDesc')}</p>
            <button className="w-full rounded-lg bg-blue-600 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-blue-200/50 transition-all hover:bg-blue-700">
              {t('generateMatchingReport')}
            </button>
          </div>

          {canCreateDeal(profile) && (
            <div className="glass-card space-y-4 rounded-xl bg-white p-5">
              <h3 className="metric-label mb-4">{t('marketingAssets')}</h3>
              <button
                type="button"
                className="group flex w-full items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-left"
                onClick={() => navigate('/marketing')}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Megaphone className="h-4 w-4 text-blue-600" />
                  </span>
                  <span className="text-[11px] font-bold text-slate-900">{t('bannerGenerator')}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-blue-600" />
              </button>
              <p className="text-[10px] font-medium leading-relaxed text-slate-400">{t('marketingAssetsDesc')}</p>
            </div>
          )}

          <div className="glass-card rounded-xl bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <h3 className="metric-label">Hoạt động gần đây</h3>
            </div>
            <div className="space-y-4">
              {analytics.recentActivity.length > 0 ? analytics.recentActivity.map(activity => (
                <div key={activity.id} className="flex gap-3">
                  <div className={cn('h-8 w-1 rounded-full', activity.color)} />
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-bold text-slate-900">{activity.title}</div>
                    <div className="truncate text-[10px] font-medium text-slate-500">
                      {activity.desc}{activity.date ? ` · ${shortDate(activity.date)}` : ''}
                    </div>
                  </div>
                </div>
              )) : (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-xs font-medium text-slate-500">Chưa có hoạt động mới.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
