import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Deal, DealDocument, Offer } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  Building2, MapPin, TrendingUp, DollarSign, Calendar, Target,
  ShieldCheck, FileText, Lock, ArrowLeft, Download, 
  ExternalLink, ChevronRight, MessageCircle, Send, Sparkles, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCompactNumber, formatCurrency, cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

export default function DealDetail() {
  const { t, tSector } = useLanguage();
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [docs, setDocs] = useState<DealDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [ndaSigned, setNdaSigned] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerSent, setOfferSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'matching'>('overview');

  useEffect(() => {
    const fetchDeal = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'deals', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDeal({ id: docSnap.id, ...docSnap.data() } as Deal);
          
          const docsQ = query(collection(db, `deals/${id}/documents`));
          const docsSnap = await getDocs(docsQ);
          setDocs(docsSnap.docs.map(d => ({ id: d.id, ...d.data() } as DealDocument)));
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

  const handleSendOffer = async () => {
    if (!user || !deal || offerSent) return;
    setOfferLoading(true);
    try {
      const offerData: Partial<Offer> = {
        dealId: deal.id,
        buyerId: user.uid,
        amount: deal.mandaInfo.valuation,
        equity: deal.mandaInfo.equityOffered,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, `deals/${deal.id}/offers`), offerData);
      setOfferSent(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `deals/${deal.id}/offers`);
    } finally {
      setOfferLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!deal) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      {/* breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <Link to="/" className="hover:text-blue-600 transition-colors">{t('marketplace')}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-900">{tSector(deal.industry)}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-900">{deal.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="glass-card p-8 rounded-3xl bg-white border border-slate-200">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                  <ShieldCheck className="w-3 h-3" /> {t('verifiedListing')}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
                  {deal.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {deal.location}</span>
                  <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /> {tSector(deal.industry)}</span>
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> {t('founded')} {deal.mandaInfo.foundedYear}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="metric-label">{t('askingPrice')}</div>
                <div className="text-3xl font-bold text-slate-900">{formatCurrency(deal.mandaInfo.valuation, t('language') as 'en'|'vi')}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{deal.mandaInfo.equityOffered}{t('equityOfferedLabel')}</div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 py-8 border-y border-slate-50 mt-8">
              <div>
                <div className="metric-label mb-1">{t('annualRevenue')}</div>
                <div className="text-xl font-bold text-slate-900">{formatCurrency(deal.financials.revenue[deal.financials.revenue.length-1], t('language') as 'en'|'vi')}</div>
                <div className="text-[10px] text-green-600 font-bold mt-1">+{deal.financials.growthRate}% {t('growthLabel')}</div>
              </div>
              <div>
                <div className="metric-label mb-1">{t('adjustedEbitda')}</div>
                <div className="text-xl font-bold text-slate-900">{formatCurrency(deal.financials.ebitda, t('language') as 'en'|'vi')}</div>
                <div className="text-[10px] text-slate-400 font-bold mt-1">{(deal.financials.ebitda / deal.financials.revenue[deal.financials.revenue.length-1] * 100).toFixed(1)}% {t('margin')}</div>
              </div>
              <div>
                <div className="metric-label mb-1">{t('staffCount')}</div>
                <div className="text-xl font-bold text-slate-900">{deal.mandaInfo.employeeCount}</div>
                <div className="text-[10px] text-slate-400 font-bold mt-1">{t('fullTimeStaff')}</div>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                    B{i}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 font-medium">
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
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{deal.strategy.reasonForSale}</p>
                    
                    <h3 className="text-lg font-bold text-slate-900 mt-8">{t('growthRoadmap')}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{deal.strategy.futurePlans}</p>

                    <h3 className="text-lg font-bold text-slate-900 mt-8">{t('idealBuyerProfile')}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{deal.strategy.idealBuyerProfile}</p>
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
                          <span className="text-xs font-bold text-slate-900">{formatCurrency(val, t('language') as 'en'|'vi')}</span>
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
          <div className="glass-card p-6 rounded-3xl bg-white border-2 border-blue-600 shadow-xl shadow-blue-600/5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('operational')}: Active</div>
            <h3 className="text-lg font-bold text-slate-900 mb-6">{t('investmentActions')}</h3>
            
            <div className="space-y-4">
              <button 
                onClick={handleSendOffer}
                disabled={offerLoading || offerSent}
                className={cn(
                  "w-full professional-btn py-3 text-sm tracking-widest uppercase",
                  offerSent && "bg-green-600 hover:bg-green-700"
                )}
              >
                {offerLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : offerSent ? t('offerSentBtn') : t('submitOfferBtn')}
              </button>
              
              {!ndaSigned ? (
                <button 
                  onClick={() => setNdaSigned(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                >
                  {t('unlockVdr')} <Lock className="w-4 h-4 text-slate-400" />
                </button>
              ) : (
                <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                  {t('downloadTeaser')} <Download className="w-4 h-4" />
                </button>
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
                <div>
                  <div className="text-sm font-bold text-slate-900">Jonathan Davies</div>
                  <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider leading-none mt-0.5">{t('principalAdvisor')}</div>
                </div>
              </div>
            </div>
          </div>

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
