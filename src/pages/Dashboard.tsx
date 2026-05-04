import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, collectionGroup, query, where, getDocs, getDoc, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { Deal, Offer, UserProfile } from '../types';
import { Building2, TrendingUp, Users, DollarSign, ArrowUpRight, Clock, CheckCircle2, Sparkles, Megaphone, Trash2, X, AlertOctagon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { formatCompactNumber, formatCurrency, cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import { handleFirestoreError, OperationType } from '../lib/firebase';

const statusKeys = {
  draft: 'statusDraft',
  submitted: 'statusSubmitted',
  under_review: 'statusUnderReview',
  approved: 'statusApproved',
  published: 'statusPublished',
  negotiation: 'statusNegotiation',
  closed: 'statusClosed',
} as const;

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { t, tSector, language } = useLanguage();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (dealId: string) => {
    console.log('Finalizing delete for deal:', dealId);
    
    setDeletingId(dealId);
    try {
      await deleteDoc(doc(db, 'deals', dealId));
      console.log('Deal deleted successfully');
      setDeals(prev => prev.filter(d => d.id !== dealId));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Delete error details:', error);
      try {
        handleFirestoreError(error, OperationType.DELETE, `deals/${dealId}`);
      } catch (e: any) {
        alert(`${t('deleteError')}\n\nTechnical info: ${e.message}`);
      }
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const isAdmin = profile?.userType === 'admin';
        const isSeller = profile?.userType === 'seller';
        let nextDeals: Deal[] = [];
        let nextOffers: Offer[] = [];

        if (isAdmin || isSeller) {
          const dealsQ = isAdmin
            ? query(collection(db, 'deals'), orderBy('createdAt', 'desc'), limit(50))
            : query(collection(db, 'deals'), where('sellerId', '==', user.uid), orderBy('createdAt', 'desc'), limit(20));
            
          const dealsSnap = await getDocs(dealsQ);
          nextDeals = dealsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal));

          const offerReads = await Promise.all(
            nextDeals.map(async (deal) => {
              try {
                const offersSnap = await getDocs(collection(db, `deals/${deal.id}/offers`));
                return offersSnap.docs.map(offerDoc => ({ id: offerDoc.id, ...offerDoc.data() } as Offer));
              } catch (error) {
                console.warn('Deal offer analytics skipped:', deal.id, error);
                return [];
              }
            })
          );
          nextOffers = offerReads.flat();
        } else {
          // For buyer / advisor
          try {
            const buyerOffersQ = query(collectionGroup(db, 'offers'), where('buyerId', '==', user.uid), limit(50));
            const buyerOffersSnap = await getDocs(buyerOffersQ);
            nextOffers = buyerOffersSnap.docs.map(offerDoc => ({ id: offerDoc.id, ...offerDoc.data() } as Offer));
          } catch (error) {
            console.warn('Buyer offer analytics skipped:', error);
          }
          
          const dealIds = Array.from(new Set(nextOffers.map(o => o.dealId).filter(Boolean)));
          if (dealIds.length > 0) {
            const dealReads = await Promise.all(
              dealIds.map(async (dealId) => {
                try {
                  const docSnap = await getDoc(doc(db, 'deals', dealId));
                  if (docSnap.exists()) {
                    return { id: docSnap.id, ...docSnap.data() } as Deal;
                  }
                } catch (e) {
                  console.error('Failed to fetch deal', dealId, e);
                }
                return null;
              })
            );
            nextDeals = dealReads.filter((d): d is Deal => d !== null);
          }
        }

        setDeals(nextDeals);
        setOffers(nextOffers);

        if (isAdmin) {
          try {
            const usersSnap = await getDocs(query(collection(db, 'users'), limit(200)));
            setUserCount(usersSnap.docs.map(d => d.data() as UserProfile).length);
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
  }, [user, profile?.userType]);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  const lang = language;
  const dealStatusLabel = (status: Deal['status']) => t(statusKeys[status] || String(status));
  const projectPrefix = t('projectLabel');
  const totalValuation = deals.reduce((sum, deal) => sum + (Number(deal.mandaInfo.valuation) || 0), 0);
  const publishedCount = deals.filter(deal => deal.status === 'published').length;
  const pendingCount = deals.filter(deal => ['submitted', 'under_review', 'approved'].includes(deal.status)).length;
  const acceptedOfferCount = offers.filter(offer => offer.status === 'accepted').length;
  const totalOfferValue = offers.reduce((sum, offer) => sum + (Number(offer.amount) || 0), 0);
  const isBuyerLike = profile?.userType === 'buyer' || profile?.userType === 'advisor';
  const kpis = profile?.userType === 'admin'
    ? [
        { label: 'Tổng thương vụ', value: `${deals.length}`, icon: Building2, trend: `${pendingCount} chờ duyệt` },
        { label: 'Người dùng', value: `${userCount}`, icon: Users, trend: 'Từ Firestore' },
        { label: 'Tổng giá trị', value: formatCompactNumber(totalValuation, lang), icon: DollarSign, trend: `${publishedCount} đang xuất bản` },
        { label: 'Offer', value: `${offers.length}`, icon: CheckCircle2, trend: `${acceptedOfferCount} đã chấp nhận` },
      ]
    : isBuyerLike
      ? [
          { label: 'Offer đã gửi', value: `${offers.length}`, icon: Building2, trend: `${acceptedOfferCount} thành công` },
          { label: 'Giá trị offer', value: formatCompactNumber(totalOfferValue, lang), icon: DollarSign, trend: 'Từ lịch sử offer' },
          { label: 'Thương vụ mở', value: `${deals.length}`, icon: Users, trend: `${publishedCount} đang xuất bản` },
          { label: 'Tỷ lệ phản hồi', value: offers.length ? `${Math.round(((offers.length - offers.filter(o => o.status === 'pending').length) / offers.length) * 100)}%` : '0%', icon: CheckCircle2, trend: 'Theo trạng thái offer' },
        ]
      : [
          { label: 'Thương vụ của tôi', value: `${deals.length}`, icon: Building2, trend: `${publishedCount} đang xuất bản` },
          { label: 'Offer nhận được', value: `${offers.length}`, icon: Users, trend: `${acceptedOfferCount} đã chấp nhận` },
          { label: 'Tổng giá trị', value: formatCompactNumber(totalValuation, lang), icon: DollarSign, trend: t('stable') },
          { label: 'Đang xử lý', value: `${pendingCount}`, icon: CheckCircle2, trend: 'Review/KYC/duyệt' },
        ];

  const displayDeals = profile?.userType === 'admin' ? deals.filter(d => d.sellerId === user?.uid) : deals;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{t('professionalWorkspace')}</h1>
          <p className="text-sm text-slate-500 font-medium">{t('portfolioOverview')} {profile?.displayName}</p>
        </div>
        <div className="flex gap-3">
          {(profile?.userType === 'seller' || profile?.userType === 'admin') && (
            <Link
              to="/deals/new"
              className="professional-btn shadow-lg shadow-blue-600/20"
            >
              {t('createProposal')}
            </Link>
          )}
          {profile?.userType === 'admin' && (
            <Link
              to="/admin"
              className="professional-btn bg-slate-900 shadow-lg shadow-slate-900/10 hover:bg-black"
            >
              {t('adminNav')}
            </Link>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass-card min-w-0 p-5 rounded-xl bg-white overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <kpi.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-wider">{kpi.trend}</span>
            </div>
            <div className="truncate text-2xl font-bold text-slate-900">{kpi.value}</div>
            <div className="metric-label mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deal Management Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">{t('portfolioLifecycle')}</h2>
            <Link to="/" className="text-xs text-blue-600 font-semibold hover:underline">{t('marketplace')} →</Link>
          </div>

          <div className="space-y-3">
            {displayDeals.length > 0 ? (
              displayDeals.map(deal => (
                <div 
                  key={deal.id} 
                  className="glass-card p-4 rounded-xl flex items-center justify-between hover:border-blue-400 transition-all bg-white overflow-hidden"
                >
                  <div 
                    className="flex min-w-0 gap-4 cursor-pointer flex-1"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">
                      {deal.title.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 flex min-w-0 items-center gap-2">
                        <span className="truncate">{deal.title}</span>
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider flex-shrink-0",
                          deal.status === 'published' ? "bg-green-50 text-green-600 border-green-100" : "bg-slate-100 text-slate-600 border-slate-200"
                        )}>
                          {dealStatusLabel(deal.status)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3 truncate">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t('updated')}: {new Date(deal.updatedAt).toLocaleDateString()}</span>
                        <span className="min-w-0 flex items-center gap-1"><TrendingUp className="w-3 h-3 shrink-0" /> <span className="truncate">{t('revenue')}: {formatCompactNumber(deal.financials.revenue[deal.financials.revenue.length - 1], lang)}</span></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="shrink-0 text-right flex items-center gap-6 ml-4">
                    <div className="hidden max-w-[120px] sm:block">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">{t('askingPrice')}</div>
                      <div className="truncate text-lg font-bold text-slate-900 font-mono" title={formatCurrency(deal.mandaInfo.valuation, lang)}>{formatCompactNumber(deal.mandaInfo.valuation, lang)}</div>
                    </div>
                    <div className="flex items-center gap-1 group/actions">
                      <AnimatePresence mode="wait">
                        {confirmDeleteId === deal.id ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-1 bg-rose-50 border border-rose-100 p-0.5 rounded-xl pr-2"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setConfirmDeleteId(null);
                              }}
                              className="p-2 text-rose-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDelete(deal.id);
                              }}
                              disabled={deletingId === deal.id}
                              className="px-3 py-1.5 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2"
                            >
                              {deletingId === deal.id ? (
                                <Trash2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <AlertOctagon className="w-3 h-3" />
                              )}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setConfirmDeleteId(deal.id);
                            }}
                            className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 relative z-10"
                            title={t('delete')}
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          navigate(`/deals/${deal.id}`);
                        }}
                        className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-12 text-center rounded-xl bg-slate-50/50 border-dashed border-2">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-slate-800">{t('workspaceEmpty')}</h3>
                <p className="text-sm text-slate-500 mt-1">{t('workspaceEmptyDesc')}</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Matching & Activity */}
        <div className="space-y-6">
          <div className="ai-glow p-5 rounded-xl bg-white space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">{t('aiIntelligence')}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {t('aiMatchingDesc')}
            </p>
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-200/50">
              {t('generateMatchingReport')}
            </button>
          </div>

          <div className="glass-card p-5 rounded-xl bg-white space-y-4">
            <h3 className="metric-label mb-4">{t('marketingAssets')}</h3>
            <div 
              className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between group cursor-pointer" 
              onClick={() => navigate('/marketing')}
            >
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                   <Megaphone className="w-4 h-4 text-blue-600" />
                 </div>
                 <div className="text-[11px] font-bold text-slate-900">{t('bannerGenerator')}</div>
               </div>
               <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              {t('marketingAssetsDesc')}
            </p>
          </div>

          <div className="glass-card p-5 rounded-xl bg-white">
            <h3 className="metric-label mb-4">{t('recentActivity')}</h3>
            <div className="space-y-4">
              {[
                { title: t('ndaSigned'), desc: `${projectPrefix} SolarFlare • 2${t('hourShort')} ${t('ago')}`, color: 'bg-blue-500' },
                { title: t('vdrRequested'), desc: `${projectPrefix} GreenTier • 5${t('hourShort')} ${t('ago')}`, color: 'bg-slate-300' },
                { title: t('offerReceived'), desc: `SaaS Acquisition • ${t('yesterday')}`, color: 'bg-slate-300' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-3">
                  <div className={cn("w-1 h-8 rounded-full", activity.color)}></div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-900 truncate">{activity.title}</div>
                    <div className="text-[10px] text-slate-500 truncate font-medium">{activity.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
