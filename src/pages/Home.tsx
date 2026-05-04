import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Deal } from '../types';
import { Search, Filter, TrendingUp, Building2, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatCompactNumber, formatCurrency, cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { t, tSector, language } = useLanguage();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const heroSubtitle = t('heroSubtitle').replace(/^Để/u, 'để');

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const q = query(
          collection(db, 'deals'),
          where('status', '==', 'published'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        setDeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal)));
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-slate-100 px-8 py-16 md:py-24 shadow-2xl shadow-slate-900/40">
        <div className="relative z-10 max-w-3xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-wider"
          >
            <TrendingUp className="w-3 h-3" />
            <span>{t('heroBadge')}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white"
          >
            {t('heroTitle')} <br />
            <span className="text-blue-400">{heroSubtitle}</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-xl font-medium"
          >
            {t('heroDesc')}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="professional-btn h-12 px-8 text-base shadow-lg shadow-blue-500/20">
              {t('browseMarket')}
            </button>
          </motion.div>
        </div>
        
        {/* Abstract background detail */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 blur-[120px] rounded-full translate-x-1/2" />
      </section>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: t('activeDealVol'), value: formatCompactNumber(4200000000, language), trend: t('upTrend'), color: 'text-blue-600' },
          { label: t('verifiedInvestors'), value: '1,240', trend: t('verified'), color: 'text-slate-900' },
          { label: t('dailyDealFlow'), value: '28', trend: t('newToday'), color: 'text-slate-900' },
          { label: t('avgCloseTime'), value: `88 ${t('ago')}`, trend: t('optimal'), color: 'text-slate-900' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl bg-white border border-slate-200">
            <div className="metric-label mb-2">{stat.label}</div>
            <div className={cn("text-2xl font-bold tracking-tight", stat.color)}>{stat.value}</div>
            <div className="text-[10px] text-slate-400 mt-1 font-bold tracking-widest">{stat.trend}</div>
          </div>
        ))}
      </div>

      {/* Recommended Opportunities Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{t('recommendedTitle')}</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium tracking-tight">{t('recommendedDesc')}</p>
        </div>
        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors tracking-widest flex items-center gap-1">
          {t('viewAll')} <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Deal Market Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(n => (
            <div key={n} className="h-[280px] bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
          ))
        ) : deals.length > 0 ? (
          deals.map(deal => (
            <motion.div
              key={deal.id}
              whileHover={{ y: -4, borderColor: '#2563eb' }}
              className="glass-card p-5 rounded-2xl group cursor-pointer relative bg-white"
            >
              <Link to={`/deals/${deal.id}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase tracking-tighter text-xs">
                      {deal.title.substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 tracking-widest">{tSector(deal.industry)}</div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{deal.title}</h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {deal.strategy.reasonForSale.substring(0, 100)}...
                  </p>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-50 sm:grid-cols-3">
                    <div className="min-w-0">
                      <div className="metric-label text-[9px]">{t('revenue')}</div>
                      <div className="truncate text-sm font-bold text-slate-800" title={formatCurrency(deal.financials.revenue[deal.financials.revenue.length - 1], language)}>
                        {formatCompactNumber(deal.financials.revenue[deal.financials.revenue.length - 1], language)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="metric-label text-[9px]">{t('ebitda')}</div>
                      <div className="truncate text-sm font-bold text-slate-800" title={formatCurrency(deal.financials.ebitda, language)}>
                        {formatCompactNumber(deal.financials.ebitda, language)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="metric-label text-[9px]">{t('growth')}</div>
                      <div className="text-sm font-bold text-blue-600">{deal.financials.growthRate}%</div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-4 pt-2">
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold text-slate-400 tracking-widest mb-0.5">{t('valuation')}</div>
                      <div className="truncate text-lg font-bold text-slate-900" title={formatCurrency(deal.mandaInfo.valuation, language)}>
                        {formatCompactNumber(deal.mandaInfo.valuation, language)}
                      </div>
                    </div>
                    <button className="shrink-0 px-5 py-2 bg-slate-900 text-white text-[10px] rounded-lg font-bold tracking-wider hover:bg-slate-800 transition-all">
                      {t('details')}
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center glass-card rounded-3xl bg-slate-50/50 border-dashed border-2">
            <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">{t('marketSilence')}</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">{t('marketSilenceDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
