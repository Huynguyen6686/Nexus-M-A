import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, getDocs, addDoc, onSnapshot, orderBy, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Deal, DealDocument, DocumentCategory, Message, Offer, UserProfile } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  Building2, MapPin, TrendingUp, DollarSign, Calendar, Target,
  ShieldCheck, FileText, Lock, ArrowLeft, Download, 
  ExternalLink, ChevronRight, MessageCircle, Send, Sparkles, CheckCircle2, Upload, Bookmark, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCompactNumber, formatCurrency, cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import { canCounterOffer, canManageDeal, canSubmitOffer, canUnlockVdr, canUploadVdr } from '../lib/rbac';

const dealStatusKeys: Record<Deal['status'], string> = {
  draft: 'statusDraft',
  submitted: 'statusSubmitted',
  under_review: 'statusUnderReview',
  approved: 'statusApproved',
  published: 'statusPublished',
  negotiation: 'statusNegotiation',
  closed: 'statusClosed',
};

const documentCategories: Array<{ id: DocumentCategory; label: string }> = [
  { id: 'financial', label: 'Tài chính' },
  { id: 'legal', label: 'Pháp lý' },
  { id: 'hr', label: 'Nhân sự' },
  { id: 'contracts', label: 'Hợp đồng' },
  { id: 'tech', label: 'Công nghệ' },
];

export default function DealDetail() {
  const { t, tSector, language } = useLanguage();
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [docs, setDocs] = useState<DealDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [ndaSigned, setNdaSigned] = useState(false);
  const [showNdaConfirm, setShowNdaConfirm] = useState(false);
  const [vdrLoading, setVdrLoading] = useState(false);
  const [vdrError, setVdrError] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('financial');
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [offerLoading, setOfferLoading] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerEquity, setOfferEquity] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [counterOfferId, setCounterOfferId] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterEquity, setCounterEquity] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'matching'>('overview');
  const [savedDeal, setSavedDeal] = useState(false);
  const [followedDeal, setFollowedDeal] = useState(false);
  const [watchLoading, setWatchLoading] = useState<'savedDeals' | 'followedDeals' | null>(null);

  useEffect(() => {
    const fetchDeal = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'deals', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fetchedDeal = { id: docSnap.id, ...docSnap.data() } as Deal;
          setDeal(fetchedDeal);
          try {
            const sellerSnap = await getDoc(doc(db, 'users', fetchedDeal.sellerId));
            if (sellerSnap.exists()) {
              setSeller({ uid: sellerSnap.id, ...sellerSnap.data() } as UserProfile);
            }
          } catch (sellerError) {
            console.warn('Unable to load seller profile:', sellerError);
          }
          
          try {
            const docsQ = query(collection(db, `deals/${id}/documents`));
            const docsSnap = await getDocs(docsQ);
            setDocs(docsSnap.docs.map(d => ({ id: d.id, ...d.data() } as DealDocument)));
          } catch (docsError) {
            console.warn('VDR documents are locked:', docsError);
            setDocs([]);
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching deal:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [id, navigate]);

  useEffect(() => {
    if (!id || !user) return;

    const offersQ = query(collection(db, `deals/${id}/offers`), orderBy('createdAt', 'desc'));
    const unsubscribeOffers = onSnapshot(offersQ, (snap) => {
      const nextOffers = snap.docs.map(d => ({ id: d.id, ...d.data() } as Offer));
      setOffers(nextOffers);
    }, (error) => handleFirestoreError(error, OperationType.READ, `deals/${id}/offers`));

    const messagesQ = query(collection(db, `deals/${id}/messages`), orderBy('createdAt', 'asc'));
    const unsubscribeMessages = onSnapshot(messagesQ, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    }, (error) => handleFirestoreError(error, OperationType.READ, `deals/${id}/messages`));

    return () => {
      unsubscribeOffers();
      unsubscribeMessages();
    };
  }, [id, user]);

  useEffect(() => {
    if (!id || !user) {
      setSavedDeal(false);
      setFollowedDeal(false);
      return;
    }

    const loadWatchState = async () => {
      try {
        const [savedSnap, followedSnap] = await Promise.all([
          getDoc(doc(db, `users/${user.uid}/savedDeals`, id)),
          getDoc(doc(db, `users/${user.uid}/followedDeals`, id)),
        ]);
        setSavedDeal(savedSnap.exists());
        setFollowedDeal(followedSnap.exists());
      } catch (error) {
        console.warn('Deal watch state skipped:', error);
      }
    };

    loadWatchState();
  }, [id, user]);

  const handleSendOffer = async () => {
    if (!user || !deal || !canSubmitOffer(profile, deal)) return;
    const amount = Number(offerAmount) || deal.mandaInfo.valuation;
    const equity = Math.min(100, Math.max(0, Number(offerEquity) || deal.mandaInfo.equityOffered));
    setOfferLoading(true);
    try {
      const now = new Date().toISOString();
      const offerData: Partial<Offer> = {
        dealId: deal.id,
        buyerId: user.uid,
        sellerId: deal.sellerId,
        createdBy: user.uid,
        type: 'offer',
        amount,
        equity,
        note: offerNote.trim(),
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };
      await addDoc(collection(db, `deals/${deal.id}/offers`), offerData);
      setOfferAmount('');
      setOfferEquity('');
      setOfferNote('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `deals/${deal.id}/offers`);
    } finally {
      setOfferLoading(false);
    }
  };

  const handleToggleWatch = async (collectionName: 'savedDeals' | 'followedDeals') => {
    if (!user || !deal) return;
    const currentValue = collectionName === 'savedDeals' ? savedDeal : followedDeal;
    const ref = doc(db, `users/${user.uid}/${collectionName}`, deal.id);

    setWatchLoading(collectionName);
    try {
      if (currentValue) {
        await deleteDoc(ref);
        if (collectionName === 'savedDeals') setSavedDeal(false);
        if (collectionName === 'followedDeals') setFollowedDeal(false);
      } else {
        const now = new Date().toISOString();
        await setDoc(ref, {
          userId: user.uid,
          dealId: deal.id,
          title: deal.title,
          industry: deal.industry,
          valuation: deal.mandaInfo.valuation,
          status: deal.status,
          createdAt: now,
          updatedAt: now,
        });
        if (collectionName === 'savedDeals') setSavedDeal(true);
        if (collectionName === 'followedDeals') setFollowedDeal(true);
      }
    } catch (error) {
      handleFirestoreError(error, currentValue ? OperationType.DELETE : OperationType.WRITE, `users/${user.uid}/${collectionName}/${deal.id}`);
    } finally {
      setWatchLoading(null);
    }
  };

  const handleCounterOffer = async (offer: Offer) => {
    if (!user || !deal || !canCounterOffer(profile, user.uid, deal)) return;
    const amount = Number(counterAmount) || offer.amount;
    const equity = Math.min(100, Math.max(0, Number(counterEquity) || offer.equity));
    const now = new Date().toISOString();
    try {
      await addDoc(collection(db, `deals/${deal.id}/offers`), {
        dealId: deal.id,
        buyerId: offer.buyerId,
        sellerId: deal.sellerId,
        createdBy: user.uid,
        type: 'counter',
        parentOfferId: offer.id,
        amount,
        equity,
        note: counterNote.trim(),
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      });
      await updateDoc(doc(db, `deals/${deal.id}/offers`, offer.id), {
        status: 'countered',
        updatedAt: now,
      });
      setCounterOfferId(null);
      setCounterAmount('');
      setCounterEquity('');
      setCounterNote('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `deals/${deal.id}/offers`);
    }
  };

  const handleOfferStatus = async (offer: Offer, status: Offer['status']) => {
    if (!deal || !user || !profile) return;
    const canUpdateOffer = profile.userType === 'admin' || offer.buyerId === user.uid || deal.sellerId === user.uid;
    if (!canUpdateOffer) return;
    try {
      await updateDoc(doc(db, `deals/${deal.id}/offers`, offer.id), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `deals/${deal.id}/offers/${offer.id}`);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !deal || !messageText.trim()) return;
    const participants = Array.from(new Set([user.uid, deal.sellerId, ...offers.map(o => o.buyerId)]));
    try {
      await addDoc(collection(db, `deals/${deal.id}/messages`), {
        dealId: deal.id,
        senderId: user.uid,
        senderName: profile?.displayName || user.email || 'Người dùng',
        participantIds: participants,
        content: messageText.trim().slice(0, 2000),
        type: 'text',
        createdAt: new Date().toISOString(),
      });
      setMessageText('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `deals/${deal.id}/messages`);
    }
  };

  const handleUnlockVdr = async () => {
    if (!user || !deal || !profile) return;
    const sellerOrAdmin = canManageDeal(profile, user.uid, deal);

    setVdrError('');
    if (!canUnlockVdr(profile, user.uid, deal)) {
      setVdrError('Bạn cần hoàn tất KYC trước khi mở VDR.');
      return;
    }

    if (!sellerOrAdmin && !showNdaConfirm) {
      setShowNdaConfirm(true);
      return;
    }

    setVdrLoading(true);
    try {
      await addDoc(collection(db, `deals/${deal.id}/vdrAccessLogs`), {
        dealId: deal.id,
        userId: user.uid,
        userEmail: user.email || '',
        userName: profile.displayName || user.displayName || '',
        userType: profile.userType,
        ndaAccepted: !sellerOrAdmin,
        createdAt: new Date().toISOString(),
      });
      setNdaSigned(true);
      setShowNdaConfirm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `deals/${deal.id}/vdrAccessLogs`);
    } finally {
      setVdrLoading(false);
    }
  };

  const handleAddDocumentLink = async () => {
    if (!user || !deal || !canUploadVdr(profile, user.uid, deal)) return;

    setUploadError('');
    const cleanName = documentName.trim();
    const cleanUrl = documentUrl.trim();

    if (!cleanName || !cleanUrl) {
      setUploadError('Vui lòng nhập tên tài liệu và đường dẫn.');
      return;
    }

    try {
      const parsedUrl = new URL(cleanUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        setUploadError('Link tài liệu phải bắt đầu bằng http hoặc https.');
        return;
      }
    } catch {
      setUploadError('Link tài liệu không hợp lệ.');
      return;
    }

    setUploadingDoc(true);
    try {
      const now = new Date().toISOString();
      const newDoc = {
        dealId: deal.id,
        category: uploadCategory,
        name: cleanName.slice(0, 120),
        url: cleanUrl,
        size: 0,
        type: 'external-link',
        ownerId: user.uid,
        permissions: ['seller', 'admin', 'verified_investor'],
        createdAt: now,
      };
      const docRef = await addDoc(collection(db, `deals/${deal.id}/documents`), newDoc);
      setDocs(prev => [{ id: docRef.id, ...newDoc } as DealDocument, ...prev]);
      setDocumentName('');
      setDocumentUrl('');
    } catch (error) {
      console.error('Add document link failed:', error);
      setUploadError('Không lưu được link tài liệu. Vui lòng thử lại.');
    } finally {
      setUploadingDoc(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!deal) return null;

  const lang = language;
  const latestRevenue = deal.financials.revenue[deal.financials.revenue.length - 1] || 0;
  const growthRate = Math.min(100, Math.max(0, Number(deal.financials.growthRate) || 0));
  const equityOffered = Math.min(100, Math.max(0, Number(deal.mandaInfo.equityOffered) || 0));
  const ebitdaMargin = Math.min(100, Math.max(0, latestRevenue > 0 ? (deal.financials.ebitda / latestRevenue * 100) : 0)).toFixed(1);
  const canInvest = canSubmitOffer(profile, deal);
  const isSellerOwner = canManageDeal(profile, user?.uid, deal);
  const canUseDealRoom = Boolean(user && (isSellerOwner || canInvest));
  const canAccessVdr = canUnlockVdr(profile, user?.uid, deal);
  const ownLatestOffer = offers.find(offer => offer.buyerId === user?.uid);
  const offerStatusLabel: Record<Offer['status'], string> = {
    pending: 'Chờ phản hồi',
    countered: 'Đã phản hồi lại',
    accepted: 'Đã chấp nhận',
    rejected: 'Đã từ chối',
    withdrawn: 'Đã rút',
  };
  const dealStatusLabel = (status: Deal['status']) => t(dealStatusKeys[status]);
  const dealVerificationLabel = deal.status === 'published'
    ? t('verifiedListing')
    : deal.status === 'approved'
      ? dealStatusLabel('approved')
      : dealStatusLabel(deal.status);
  const dealVerificationClass = deal.status === 'published'
    ? 'border-blue-100 bg-blue-50 text-blue-600'
    : deal.status === 'approved'
      ? 'border-green-100 bg-green-50 text-green-700'
      : 'border-amber-100 bg-amber-50 text-amber-700';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      {/* breadcrumbs */}
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <Link to="/" className="shrink-0 hover:text-blue-600 transition-colors">{t('marketplace')}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="shrink-0 text-slate-900">{tSector(deal.industry)}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="min-w-0 max-w-full truncate text-slate-900">{deal.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="glass-card overflow-hidden p-8 rounded-3xl bg-white border border-slate-200">
            <div className="flex flex-col gap-6 xl:flex-row xl:justify-between xl:items-start mb-6">
              <div className="min-w-0 space-y-4">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-1.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-500">
                      {seller?.photoURL ? (
                        <img src={seller.photoURL} alt={seller.displayName} className="h-full w-full object-cover" />
                      ) : (
                        (seller?.displayName || 'S').slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Người đăng bán</div>
                      <div className="max-w-[180px] truncate text-xs font-bold text-slate-800">{seller?.displayName || deal.sellerId}</div>
                    </div>
                  </div>
                  <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border", dealVerificationClass)}>
                    <ShieldCheck className="w-3 h-3" /> {dealVerificationLabel}
                  </div>
                  {user && !isSellerOwner && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleWatch('savedDeals')}
                        disabled={watchLoading === 'savedDeals'}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors",
                          savedDeal
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-slate-200 bg-white text-slate-500 hover:border-amber-200 hover:text-amber-700"
                        )}
                      >
                        <Bookmark className={cn("h-3 w-3", savedDeal && "fill-current")} />
                        {savedDeal ? 'Đã lưu' : 'Lưu'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleWatch('followedDeals')}
                        disabled={watchLoading === 'followedDeals'}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors",
                          followedDeal
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700"
                        )}
                      >
                        <Eye className="h-3 w-3" />
                        {followedDeal ? 'Đang theo dõi' : 'Theo dõi'}
                      </button>
                    </div>
                  )}
                </div>
                <h1 className="max-w-full break-words text-3xl md:text-4xl font-bold text-slate-900 leading-tight tracking-tight [overflow-wrap:anywhere]">
                  {deal.title}
                </h1>
                <div className="flex min-w-0 flex-wrap items-center gap-6 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {deal.location}</span>
                  <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /> {tSector(deal.industry)}</span>
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> {t('founded')} {deal.mandaInfo.foundedYear}</span>
                </div>
              </div>
              <div className="min-w-0 max-w-full xl:max-w-[260px] xl:text-right">
                <div className="metric-label">{t('askingPrice')}</div>
                <div className="truncate text-3xl font-bold text-slate-900" title={formatCurrency(deal.mandaInfo.valuation, lang)}>
                  {formatCompactNumber(deal.mandaInfo.valuation, lang)}
                </div>
                <div className="truncate text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{equityOffered}{t('equityOfferedLabel')}</div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-y border-slate-50 mt-8">
              <div className="min-w-0">
                <div className="metric-label mb-1">{t('annualRevenue')}</div>
                <div className="truncate text-xl font-bold text-slate-900" title={formatCurrency(latestRevenue, lang)}>{formatCompactNumber(latestRevenue, lang)}</div>
                <div className="truncate text-[10px] text-green-600 font-bold mt-1">+{growthRate}% {t('growthLabel')}</div>
              </div>
              <div className="min-w-0">
                <div className="metric-label mb-1">{t('adjustedEbitda')}</div>
                <div className="truncate text-xl font-bold text-slate-900" title={formatCurrency(deal.financials.ebitda, lang)}>{formatCompactNumber(deal.financials.ebitda, lang)}</div>
                <div className="truncate text-[10px] text-slate-400 font-bold mt-1">{ebitdaMargin}% {t('margin')}</div>
              </div>
              <div className="min-w-0">
                <div className="metric-label mb-1">{t('staffCount')}</div>
                <div className="truncate text-xl font-bold text-slate-900">{formatCompactNumber(deal.mandaInfo.employeeCount || 0, lang)}</div>
                <div className="text-[10px] text-slate-400 font-bold mt-1">{t('fullTimeStaff')}</div>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-4 mt-8 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                    B{i}
                  </div>
                ))}
              </div>
              <p className="min-w-0 text-xs text-slate-500 font-medium leading-relaxed">
                <strong className="text-slate-900">14 {t('verifiedInvestors')}</strong> {t('verifiedBuyersRequested')}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-8 border-b border-slate-200">
            {['overview', 'financials', 'matching'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "pb-4 text-xs font-bold uppercase tracking-widest transition-all relative",
                  activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab === 'overview' ? t('overviewTab') : tab === 'financials' ? t('financials') : t('matching')}
                {activeTab === tab && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="prose prose-slate max-w-none">
                    <h3 className="text-lg font-bold text-slate-900">{t('executiveSummary')}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{deal.strategy.reasonForSale}</p>
                    
                    <h3 className="text-lg font-bold text-slate-900 mt-8">{t('growthRoadmap')}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{deal.strategy.futurePlans}</p>

                    <h3 className="text-lg font-bold text-slate-900 mt-8">{t('idealBuyerProfile')}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{deal.strategy.idealBuyerProfile}</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'financials' && (
                <motion.div
                  key="financials"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="glass-card p-6 rounded-2xl bg-white">
                    <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest">{t('revenuePerformance')}</h3>
                    <div className="h-64 flex items-end justify-between gap-4">
                      {deal.financials.revenue.map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div 
                            className="w-full bg-blue-600/10 border-t-2 border-blue-600 rounded-t-lg transition-all hover:bg-blue-600/20"
                            style={{ height: `${(val / Math.max(...deal.financials.revenue)) * 100}%` }}
                          />
                          <span className="text-[10px] font-bold text-slate-400">FY{22+i}</span>
                          <span className="max-w-full truncate text-xs font-bold text-slate-900" title={formatCurrency(val, lang)}>{formatCompactNumber(val, lang)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'matching' && (
                <motion.div
                  key="matching"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="ai-glow p-8 rounded-3xl bg-slate-900 text-white space-y-6 overflow-hidden relative">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight">{t('synergyAnalysis')}</h3>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                        {deal.aiSummary || t('synergyDescDefault')}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-8 mt-8">
                        <div>
                          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">{t('keySynergies')}</div>
                          <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-xs font-medium text-slate-200">
                              <CheckCircle2 className="w-4 h-4 text-blue-400" /> {t('techOverlap')}
                            </li>
                            <li className="flex items-center gap-2 text-xs font-medium text-slate-200">
                              <CheckCircle2 className="w-4 h-4 text-blue-400" /> {t('customerBaseIntegration')}
                            </li>
                          </ul>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">{t('roiEstimation')}</div>
                          <div className="text-2xl font-bold text-white">3.4x <span className="text-xs font-medium text-slate-400 uppercase ml-1">{t('projectedMultiple')}</span></div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Sidebar Actions */}
        <div className="space-y-6">
          <div className="glass-card overflow-hidden p-6 rounded-3xl bg-white border-2 border-blue-600 shadow-xl shadow-blue-600/5">
            <div className="truncate text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('operational')}: {t('activeStatus')}</div>
            <h3 className="text-lg font-bold text-slate-900 mb-6">{t('investmentActions')}</h3>
            
            <div className="space-y-4">
              {canInvest && (
                <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value.replace(/[^\d.]/g, '').slice(0, 14))}
                      placeholder="Giá đề nghị"
                      className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
                    />
                    <input
                      value={offerEquity}
                      onChange={(e) => setOfferEquity(e.target.value.replace(/[^\d.]/g, '').slice(0, 5))}
                      placeholder="% cổ phần"
                      className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
                    />
                  </div>
                  <textarea
                    value={offerNote}
                    onChange={(e) => setOfferNote(e.target.value.slice(0, 280))}
                    placeholder="Ghi chú cho bên bán"
                    rows={2}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
              )}
              <button 
                onClick={handleSendOffer}
                disabled={offerLoading || !canInvest}
                className={cn(
                  "w-full professional-btn py-3 text-sm tracking-widest uppercase",
                  !canInvest && "cursor-not-allowed bg-slate-300 hover:bg-slate-300"
                )}
              >
                {offerLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : canInvest ? t('submitOfferBtn') : t('onlyBuyerAdvisor')}
              </button>
              {ownLatestOffer && (
                <p className="text-[11px] font-bold text-slate-500">
                  Offer gần nhất: <span className="text-blue-600">{offerStatusLabel[ownLatestOffer.status]}</span>
                </p>
              )}

              {isSellerOwner && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Upload className="h-4 w-4 text-blue-600" />
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Thêm tài liệu VDR bằng link</div>
                  </div>
                  <div className="space-y-3">
                    <select
                      value={uploadCategory}
                      onChange={(event) => setUploadCategory(event.target.value as DocumentCategory)}
                      className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                    >
                      {documentCategories.map(category => (
                        <option key={category.id} value={category.id}>{category.label}</option>
                      ))}
                    </select>
                    <input
                      value={documentName}
                      onChange={(event) => setDocumentName(event.target.value.slice(0, 120))}
                      placeholder="Tên tài liệu, ví dụ: Báo cáo tài chính 2024"
                      className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500"
                    />
                    <input
                      value={documentUrl}
                      onChange={(event) => setDocumentUrl(event.target.value.slice(0, 500))}
                      placeholder="Link Google Drive, OneDrive hoặc PDF"
                      className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddDocumentLink}
                      disabled={!documentName.trim() || !documentUrl.trim() || uploadingDoc}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploadingDoc ? 'Đang lưu...' : 'Thêm vào VDR'}
                    </button>
                    {uploadError && <p className="text-xs font-bold text-rose-600">{uploadError}</p>}
                  </div>
                </div>
              )}
              
              {!ndaSigned ? (
                <div className="space-y-3">
                  {showNdaConfirm && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-800">Xác nhận NDA</div>
                      <p className="mt-2 text-xs font-medium leading-relaxed text-amber-900">
                        Bằng cách mở VDR, bạn xác nhận chỉ sử dụng tài liệu cho mục đích đánh giá thương vụ và không chia sẻ dữ liệu nhạy cảm ra bên ngoài.
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleUnlockVdr}
                    disabled={vdrLoading || (!canAccessVdr && !isSellerOwner)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 border-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                      canAccessVdr
                        ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                        : "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-700"
                    )}
                  >
                    {vdrLoading ? 'Đang mở VDR...' : canAccessVdr ? (showNdaConfirm ? 'Xác nhận mở VDR' : t('unlockVdr')) : 'Cần xác minh KYC'}
                    <Lock className="w-4 h-4 text-slate-400" />
                  </button>
                  {vdrError && <p className="text-xs font-bold text-rose-600">{vdrError}</p>}
                </div>
              ) : (
                <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-green-700">VDR đã mở khóa</div>
                      <div className="text-[11px] font-medium text-green-700">{docs.length} tài liệu khả dụng</div>
                    </div>
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    {docs.length > 0 ? docs.map(document => (
                      <a
                        key={document.id}
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 rounded-xl border border-green-100 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-green-200 hover:text-blue-600"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-green-600" />
                          <span className="truncate">{document.name}</span>
                        </span>
                        <Download className="h-4 w-4 shrink-0 text-slate-400" />
                      </a>
                    )) : (
                      <div className="rounded-xl border border-dashed border-green-200 bg-white/70 p-3 text-xs font-medium text-green-700">
                        Chưa có tài liệu nào trong VDR của thương vụ này.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-400 uppercase tracking-wider font-bold">{t('dealManager')}</span>
                <span className="text-blue-600 hover:underline cursor-pointer">{t('contactAdvisor')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400">
                  {profile?.displayName?.charAt(0) || 'JD'}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900">Jonathan Davies</div>
                  <div className="truncate text-[10px] font-medium text-slate-500 uppercase tracking-wider leading-none mt-0.5">{t('principalAdvisor')}</div>
                </div>
              </div>
            </div>
          </div>

          {canUseDealRoom && (
            <div className="glass-card p-5 rounded-3xl bg-white space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Lịch sử offer</h3>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">{offers.length}</span>
              </div>
              <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                {offers.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-xs font-medium text-slate-500">Chưa có offer nào cho thương vụ này.</p>
                ) : offers.map((offer) => {
                  const isCounter = offer.type === 'counter';
                  const canAnswer = offer.status === 'pending' && (
                    (isCounter && offer.buyerId === user?.uid) ||
                    (!isCounter && isSellerOwner)
                  );
                  return (
                    <div key={offer.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{isCounter ? 'Counter-offer' : 'Offer'}</div>
                          <div className="truncate text-lg font-bold text-slate-900" title={formatCurrency(offer.amount, lang)}>
                            {formatCompactNumber(offer.amount, lang)}
                          </div>
                          <div className="text-[11px] font-bold text-slate-500">{Math.min(100, Math.max(0, Number(offer.equity) || 0))}% cổ phần</div>
                        </div>
                        <span className={cn(
                          "shrink-0 rounded-full px-2 py-1 text-[10px] font-bold",
                          offer.status === 'accepted' ? "bg-green-50 text-green-600" :
                          offer.status === 'rejected' ? "bg-rose-50 text-rose-600" :
                          "bg-blue-50 text-blue-600"
                        )}>
                          {offerStatusLabel[offer.status]}
                        </span>
                      </div>
                      {offer.note && <p className="mt-3 whitespace-pre-wrap break-words text-xs font-medium leading-relaxed text-slate-600">{offer.note}</p>}
                      <div className="mt-3 text-[10px] font-bold text-slate-400">{new Date(offer.createdAt).toLocaleString('vi-VN')}</div>
                      {canAnswer && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button onClick={() => handleOfferStatus(offer, 'accepted')} className="rounded-xl bg-green-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white">Chấp nhận</button>
                          <button onClick={() => handleOfferStatus(offer, 'rejected')} className="rounded-xl bg-rose-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white">Từ chối</button>
                          {isSellerOwner && !isCounter && (
                            <button onClick={() => setCounterOfferId(counterOfferId === offer.id ? null : offer.id)} className="rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">Counter</button>
                          )}
                        </div>
                      )}
                      {counterOfferId === offer.id && (
                        <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-3">
                          <div className="grid grid-cols-2 gap-2">
                            <input value={counterAmount} onChange={(e) => setCounterAmount(e.target.value.replace(/[^\d.]/g, '').slice(0, 14))} placeholder="Giá mới" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold outline-none" />
                            <input value={counterEquity} onChange={(e) => setCounterEquity(e.target.value.replace(/[^\d.]/g, '').slice(0, 5))} placeholder="% mới" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold outline-none" />
                          </div>
                          <textarea value={counterNote} onChange={(e) => setCounterNote(e.target.value.slice(0, 280))} placeholder="Ghi chú counter-offer" rows={2} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium outline-none" />
                          <button onClick={() => handleCounterOffer(offer)} className="w-full rounded-xl bg-blue-600 py-2 text-xs font-bold uppercase tracking-wider text-white">Gửi counter-offer</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {canUseDealRoom && (
            <div className="glass-card p-5 rounded-3xl bg-white space-y-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Chat theo thương vụ</h3>
              </div>
              <div className="max-h-80 space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-3">
                {messages.length === 0 ? (
                  <p className="text-xs font-medium text-slate-500">Chưa có tin nhắn nào.</p>
                ) : messages.map((message) => (
                  <div key={message.id} className={cn("flex", message.senderId === user?.uid ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-xs font-medium leading-relaxed",
                      message.senderId === user?.uid ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-200"
                    )}>
                      <div className={cn("mb-1 text-[10px] font-bold", message.senderId === user?.uid ? "text-blue-100" : "text-slate-400")}>{message.senderName || 'Người dùng'}</div>
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value.slice(0, 2000))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder="Nhập tin nhắn..."
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <button onClick={handleSendMessage} className="rounded-xl bg-blue-600 px-3 text-white">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="glass-card p-6 rounded-3xl bg-slate-50 border-none">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t('confidentialityGuard')}</h4>
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-slate-400 mt-0.5" />
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {t('confidentialityDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
