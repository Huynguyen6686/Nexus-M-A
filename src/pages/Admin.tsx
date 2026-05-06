import React, { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, limit, query, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import {
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  XCircle,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Deal, DealStatus, KYCStatus, UserProfile, UserRole } from '../types';
import { cn, formatCompactNumber } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

const dealStatuses: DealStatus[] = ['submitted', 'under_review', 'approved', 'published', 'negotiation', 'closed'];
const roles: UserRole[] = ['buyer', 'seller', 'advisor', 'admin'];

const statusKeys: Record<DealStatus, string> = {
  draft: 'statusDraft',
  submitted: 'statusSubmitted',
  under_review: 'statusUnderReview',
  approved: 'statusApproved',
  published: 'statusPublished',
  negotiation: 'statusNegotiation',
  closed: 'statusClosed',
};

const roleKeys: Record<UserRole, string> = {
  buyer: 'roleBuyer',
  seller: 'roleSeller',
  advisor: 'roleAdvisor',
  admin: 'roleAdmin',
};

const kycKeys: Record<KYCStatus, string> = {
  unverified: 'kycUnverified',
  pending: 'kycPending',
  verified: 'kycVerified',
  rejected: 'kycRejected',
};

export default function Admin() {
  const { language, t, tSector } = useLanguage();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'deals' | 'users' | 'kyc'>('deals');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmDeleteDealId, setConfirmDeleteDealId] = useState<string | null>(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState<{ uid: string; nextRole: UserRole } | null>(null);
  const [confirmDealStatusChange, setConfirmDealStatusChange] = useState<{ dealId: string; nextStatus: DealStatus } | null>(null);

  const pendingDeals = useMemo(
    () => deals.filter(deal => ['submitted', 'under_review', 'approved'].includes(deal.status)),
    [deals],
  );

  const kycQueue = useMemo(
    () => users.filter(user => user.kycStatus !== 'verified'),
    [users],
  );

  const usersById = useMemo(() => {
    return users.reduce<Record<string, UserProfile>>((acc, user) => {
      acc[user.uid] = user;
      return acc;
    }, {});
  }, [users]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [dealsSnap, usersSnap] = await Promise.all([
          getDocs(query(collection(db, 'deals'), limit(100))),
          getDocs(query(collection(db, 'users'), limit(100))),
        ]);

        const fetchedDeals = dealsSnap.docs
          .map(item => ({ id: item.id, ...item.data() } as Deal))
          .sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));

        const fetchedUsers = usersSnap.docs
          .map(item => ({ uid: item.id, ...item.data() } as UserProfile))
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        setDeals(fetchedDeals);
        setUsers(fetchedUsers);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setLoadError(message);
        console.error('Admin data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const updateDealStatus = async (dealId: string, status: DealStatus) => {
    setUpdating(`deal-${dealId}`);
    try {
      const updatedAt = new Date().toISOString();
      await updateDoc(doc(db, 'deals', dealId), { status, updatedAt });
      setDeals(prev => prev.map(deal => deal.id === dealId ? { ...deal, status, updatedAt } : deal));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `deals/${dealId}`);
    } finally {
      setUpdating(null);
    }
  };

  const updateUser = async (uid: string, patch: Partial<Pick<UserProfile, 'kycStatus' | 'userType'>>) => {
    setUpdating(`user-${uid}`);
    try {
      const updatedAt = new Date().toISOString();
      await updateDoc(doc(db, 'users', uid), { ...patch, updatedAt });
      setUsers(prev => prev.map(user => user.uid === uid ? { ...user, ...patch, updatedAt } : user));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    } finally {
      setUpdating(null);
    }
  };

  const deleteDeal = async (dealId: string) => {
    setUpdating(`delete-deal-${dealId}`);
    try {
      await deleteDoc(doc(db, 'deals', dealId));
      setDeals(prev => prev.filter(deal => deal.id !== dealId));
      setConfirmDeleteDealId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `deals/${dealId}`);
    } finally {
      setUpdating(null);
    }
  };

  const statusClass = (status: string) => cn(
    'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider',
    status === 'published' || status === 'verified' ? 'border-green-100 bg-green-50 text-green-700' :
    status === 'rejected' ? 'border-rose-100 bg-rose-50 text-rose-700' :
    status === 'approved' ? 'border-blue-100 bg-blue-50 text-blue-700' :
    'border-slate-200 bg-slate-50 text-slate-600',
  );

  const dealStatusLabel = (status: DealStatus) => t(statusKeys[status]);
  const roleLabel = (role: UserRole) => t(roleKeys[role]);
  const kycLabel = (status: KYCStatus) => t(kycKeys[status]);
  const roleChangeUser = confirmRoleChange ? users.find(user => user.uid === confirmRoleChange.uid) : null;
  const statusChangeDeal = confirmDealStatusChange ? deals.find(deal => deal.id === confirmDealStatusChange.dealId) : null;
  const forwardDealStatuses = (status: DealStatus) => {
    const currentIndex = dealStatuses.indexOf(status);
    return currentIndex >= 0 ? dealStatuses.slice(currentIndex + 1) : dealStatuses;
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold tracking-wider text-blue-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('adminControlCenter')}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('adminTitle')}</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">{t('adminDesc')}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('pendingReview'), value: pendingDeals.length, icon: Clock },
            { label: t('userCount'), value: users.length, icon: Users },
            { label: t('kycQueue'), value: kycQueue.length, icon: BadgeCheck },
          ].map(item => (
            <div key={item.label} className="min-w-[120px] rounded-xl border border-slate-200 bg-white p-4">
              <item.icon className="mb-2 h-4 w-4 text-blue-600" />
              <div className="text-xl font-bold text-slate-900">{item.value}</div>
              <div className="text-[10px] font-bold text-slate-400">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 border-b border-slate-200">
        {[
          { id: 'deals', label: t('reviewDealsTab') },
          { id: 'users', label: t('manageUsersTab') },
          { id: 'kyc', label: t('verifyKycTab') },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'deals' | 'users' | 'kyc')}
            className={cn(
              'relative px-1 pb-4 text-xs font-bold tracking-widest transition-colors',
              activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700',
            )}
          >
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-900">
          {t('adminLoadError')}
          <div className="mt-2 break-words text-xs text-amber-700">{loadError}</div>
        </div>
      )}

      {activeTab === 'deals' && (
        <div className="space-y-4">
          {!loadError && deals.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <Briefcase className="mx-auto mb-4 h-10 w-10 text-slate-300" />
              <h3 className="font-bold text-slate-800">{t('noDealsTitle')}</h3>
              <p className="mt-1 text-sm text-slate-500">{t('noDealsDesc')}</p>
            </div>
          )}
          {deals.map(deal => (
            <div key={deal.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-3">
                    <h2 className="max-w-xl truncate text-lg font-bold text-slate-900">{deal.title}</h2>
                    <span className={statusClass(deal.status)}>{dealStatusLabel(deal.status)}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                    <span>{tSector(deal.industry)}</span>
                    <span>{deal.location}</span>
                    <span>{formatCompactNumber(deal.mandaInfo.valuation, language)}</span>
                    <span>{t('sellerLabel')}: {usersById[deal.sellerId]?.displayName || `${deal.sellerId.slice(0, 8)}...`}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {forwardDealStatuses(deal.status).map(status => (
                    <button
                      key={status}
                      onClick={() => setConfirmDealStatusChange({ dealId: deal.id, nextStatus: status })}
                      disabled={updating === `deal-${deal.id}` || deal.status === status}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-[10px] font-bold transition-all',
                        deal.status === status ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50',
                      )}
                    >
                      {dealStatusLabel(status)}
                    </button>
                  ))}
                  {forwardDealStatuses(deal.status).length === 0 && (
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-400">
                      Không còn bước tiếp theo
                    </span>
                  )}
                  {confirmDeleteDealId === deal.id ? (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 p-1 pl-3">
                      <span className="text-[10px] font-bold text-rose-700">{t('confirmDeleteShort')}</span>
                      <button
                        onClick={() => deleteDeal(deal.id)}
                        disabled={updating === `delete-deal-${deal.id}`}
                        className="rounded-lg bg-rose-600 px-3 py-2 text-[10px] font-bold text-white hover:bg-rose-700 disabled:opacity-60"
                      >
                        {updating === `delete-deal-${deal.id}` ? t('deleting') : t('delete')}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteDealId(null)}
                        className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteDealId(deal.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-rose-100 bg-white px-3 py-2 text-[10px] font-bold text-rose-600 transition-all hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('delete')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {!loadError && users.length === 0 && (
            <div className="p-12 text-center">
              <Users className="mx-auto mb-4 h-10 w-10 text-slate-300" />
              <h3 className="font-bold text-slate-800">{t('noUsersTitle')}</h3>
              <p className="mt-1 text-sm text-slate-500">{t('noUsersDesc')}</p>
            </div>
          )}
          {users.map(user => (
            <div key={user.uid} className="grid gap-4 border-b border-slate-100 p-5 last:border-b-0 lg:grid-cols-[1.5fr_1fr_1fr] lg:items-center">
              <div className="min-w-0">
                <div className="truncate font-bold text-slate-900">{user.displayName}</div>
                <div className="truncate text-xs font-medium text-slate-500">{user.email}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                {roles.map(role => (
                  <button
                    key={role}
                    onClick={() => setConfirmRoleChange({ uid: user.uid, nextRole: role })}
                    disabled={updating === `user-${user.uid}` || user.userType === role}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-[10px] font-bold',
                      user.userType === role ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50',
                    )}
                  >
                    {roleLabel(role)}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className={statusClass(user.kycStatus)}>{kycLabel(user.kycStatus)}</span>
                <span className="text-xs font-medium text-slate-400">{user.country}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'kyc' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {kycQueue.map(user => (
            <div key={user.uid} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate font-bold text-slate-900">{user.displayName}</div>
                  <div className="truncate text-xs text-slate-500">{user.email}</div>
                </div>
                <span className={statusClass(user.kycStatus)}>{kycLabel(user.kycStatus)}</span>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="font-bold text-slate-400">{t('roleLabel')}</div>
                  <div className="mt-1 text-slate-900">{roleLabel(user.userType)}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="font-bold text-slate-400">{t('countryLabel')}</div>
                  <div className="mt-1 text-slate-900">{user.country}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateUser(user.uid, { kycStatus: 'verified' })}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-xs font-bold text-white hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t('verify')}
                </button>
                <button
                  onClick={() => updateUser(user.uid, { kycStatus: 'rejected' })}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-xs font-bold text-white hover:bg-rose-700"
                >
                  <XCircle className="h-4 w-4" />
                  {t('reject')}
                </button>
                <button
                  onClick={() => updateUser(user.uid, { kycStatus: 'pending' })}
                  className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  title={t('moveToPending')}
                >
                  <UserCog className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'kyc' && kycQueue.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Briefcase className="mx-auto mb-4 h-10 w-10 text-slate-300" />
          <h3 className="font-bold text-slate-800">{t('noKycTitle')}</h3>
        </div>
      )}

      {confirmRoleChange && roleChangeUser && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20"
          >
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <UserCog className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900">Xác nhận đổi vai trò</h3>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  Bạn có chắc muốn đổi vai trò của <strong className="text-slate-900">{roleChangeUser.displayName}</strong> từ <strong>{roleLabel(roleChangeUser.userType)}</strong> sang <strong>{roleLabel(confirmRoleChange.nextRole)}</strong> không?
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-xs font-medium text-slate-500">
              Thay đổi này ảnh hưởng tới quyền đăng thương vụ, gửi offer, duyệt KYC và quyền truy cập trang admin.
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmRoleChange(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  const pending = confirmRoleChange;
                  setConfirmRoleChange(null);
                  await updateUser(pending.uid, { userType: pending.nextRole });
                }}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-black"
              >
                Xác nhận đổi
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {confirmDealStatusChange && statusChangeDeal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20"
          >
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900">Xác nhận đổi trạng thái</h3>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  Bạn có chắc muốn đổi trạng thái thương vụ <strong className="text-slate-900">{statusChangeDeal.title}</strong> từ <strong>{dealStatusLabel(statusChangeDeal.status)}</strong> sang <strong>{dealStatusLabel(confirmDealStatusChange.nextStatus)}</strong> không?
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-xs font-medium text-slate-500">
              Thay đổi này ảnh hưởng tới việc thương vụ có xuất hiện trên marketplace, được đàm phán hay bị đóng.
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmDealStatusChange(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  const pending = confirmDealStatusChange;
                  setConfirmDealStatusChange(null);
                  await updateDealStatus(pending.dealId, pending.nextStatus);
                }}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-black"
              >
                Xác nhận đổi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
