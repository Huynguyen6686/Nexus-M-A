import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Building2, Filter, RotateCcw, Search, TrendingUp } from 'lucide-react';
import { db } from '../lib/firebase';
import { Deal } from '../types';
import { cn, formatCompactNumber, formatCurrency } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { t, tSector, language } = useLanguage();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [dealTypeFilter, setDealTypeFilter] = useState('all');
  const [minValuation, setMinValuation] = useState('');
  const [maxValuation, setMaxValuation] = useState('');
  const [minGrowth, setMinGrowth] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const heroSubtitle = t('heroSubtitle').replace(/^Để/u, 'để').replace(/^Äá»ƒ/u, 'Ä‘á»ƒ');

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const q = query(collection(db, 'deals'), where('status', '==', 'published'), limit(50));
        const snapshot = await getDocs(q);
        setDeals(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as Deal)));
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const industries = useMemo(() => Array.from(new Set(deals.map(deal => deal.industry))).sort(), [deals]);
  const locations = useMemo(() => Array.from(new Set(deals.map(deal => deal.location))).sort(), [deals]);
  const marketplaceStats = useMemo(() => {
    const todayKey = new Date().toDateString();
    const dayMs = 24 * 60 * 60 * 1000;
    const totalValuation = deals.reduce((sum, deal) => sum + (Number(deal.mandaInfo.valuation) || 0), 0);
    const newToday = deals.filter(deal => {
      const dateValue = deal.updatedAt || deal.createdAt;
      return dateValue && new Date(dateValue).toDateString() === todayKey;
    }).length;
    const averageListingDays = deals.length
      ? Math.max(1, Math.round(deals.reduce((sum, deal) => {
          const createdAt = deal.createdAt ? new Date(deal.createdAt).getTime() : Date.now();
          return sum + Math.max(0, Date.now() - createdAt) / dayMs;
        }, 0) / deals.length))
      : 0;

    return {
      totalValuation,
      dealCount: deals.length,
      newToday,
      averageListingDays,
    };
  }, [deals]);

  const filteredDeals = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const minValue = Number(minValuation) || 0;
    const maxValue = Number(maxValuation) || Number.MAX_SAFE_INTEGER;
    const growthValue = Number(minGrowth) || 0;

    return deals
      .filter(deal => {
        const haystack = [
          deal.title,
          deal.industry,
          deal.location,
          deal.strategy.reasonForSale,
          deal.strategy.futurePlans,
        ].join(' ').toLowerCase();

        return (!term || haystack.includes(term)) &&
          (industryFilter === 'all' || deal.industry === industryFilter) &&
          (locationFilter === 'all' || deal.location === locationFilter) &&
          (dealTypeFilter === 'all' || deal.dealType === dealTypeFilter) &&
          deal.mandaInfo.valuation >= minValue &&
          deal.mandaInfo.valuation <= maxValue &&
          (Number(deal.financials.growthRate) || 0) >= growthValue;
      })
      .sort((a, b) => {
        if (sortBy === 'valuation_desc') return b.mandaInfo.valuation - a.mandaInfo.valuation;
        if (sortBy === 'valuation_asc') return a.mandaInfo.valuation - b.mandaInfo.valuation;
        if (sortBy === 'growth_desc') return (Number(b.financials.growthRate) || 0) - (Number(a.financials.growthRate) || 0);
        return (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || '');
      });
  }, [dealTypeFilter, deals, industryFilter, locationFilter, maxValuation, minGrowth, minValuation, searchTerm, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setIndustryFilter('all');
    setLocationFilter('all');
    setDealTypeFilter('all');
    setMinValuation('');
    setMaxValuation('');
    setMinGrowth('');
    setSortBy('newest');
  };

  return (
    <div className="space-y-10 sm:space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-5 py-12 text-slate-100 shadow-2xl shadow-slate-900/40 sm:px-8 md:py-24">
        <div className="relative z-10 max-w-3xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-blue-400"
          >
            <TrendingUp className="h-3 w-3" />
            <span>{t('heroBadge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl"
          >
            {t('heroTitle')} <br />
            <span className="text-blue-400">{heroSubtitle}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl text-base font-medium text-slate-400 sm:text-lg"
          >
            {t('heroDesc')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4 pt-4 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
              />
            </div>
            <button className="professional-btn h-12 px-6 text-sm shadow-lg shadow-blue-500/20 sm:px-8 sm:text-base">
              {t('browseMarket')}
            </button>
          </motion.div>
        </div>

        <div className="absolute right-0 top-0 h-full w-1/3 translate-x-1/2 rounded-full bg-blue-600/5 blur-[120px]" />
      </section>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {[
          {
            label: t('activeDealVol'),
            value: formatCompactNumber(marketplaceStats.totalValuation, language),
            trend: language === 'vi' ? `${marketplaceStats.dealCount} thương vụ` : `${marketplaceStats.dealCount} deals`,
            color: 'text-blue-600',
          },
          {
            label: language === 'vi' ? 'Thương vụ đã xuất bản' : 'Published deals',
            value: String(marketplaceStats.dealCount),
            trend: language === 'vi' ? `${industries.length} ngành` : `${industries.length} industries`,
            color: 'text-slate-900',
          },
          {
            label: t('dailyDealFlow'),
            value: String(marketplaceStats.newToday),
            trend: t('newToday'),
            color: 'text-slate-900',
          },
          {
            label: language === 'vi' ? 'Thời gian niêm yết TB' : 'Average listing age',
            value: `${marketplaceStats.averageListingDays} ${language === 'vi' ? 'ngày' : 'days'}`,
            trend: language === 'vi' ? 'Theo dữ liệu hiện có' : 'From current deals',
            color: 'text-slate-900',
          },
        ].map((stat, i) => (
          <div key={i} className="glass-card min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
            <div className="metric-label mb-2">{stat.label}</div>
            <div className={cn('truncate text-2xl font-bold tracking-tight', stat.color)}>{stat.value}</div>
            <div className="mt-1 text-[10px] font-bold tracking-widest text-slate-400">{stat.trend}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">{t('recommendedTitle')}</h2>
          <p className="mt-1 text-xs font-medium tracking-tight text-slate-500">{t('recommendedDesc')}</p>
        </div>
        <button className="flex items-center gap-1 text-xs font-bold tracking-widest text-blue-600 transition-colors hover:text-blue-700">
          {t('viewAll')} <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Filter className="h-4 w-4 text-blue-600" />
            {language === 'vi' ? 'Bộ lọc nâng cao' : 'Advanced filters'}
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 transition-colors hover:text-blue-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {language === 'vi' ? 'Đặt lại' : 'Reset'}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative md:col-span-2 xl:col-span-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-4 text-sm font-medium transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              style={{ paddingLeft: '3rem' }}
            />
          </div>

          <select value={industryFilter} onChange={event => setIndustryFilter(event.target.value)} className="professional-input h-11 text-sm">
            <option value="all">{language === 'vi' ? 'Tất cả ngành' : 'All industries'}</option>
            {industries.map(industry => <option key={industry} value={industry}>{tSector(industry)}</option>)}
          </select>

          <select value={locationFilter} onChange={event => setLocationFilter(event.target.value)} className="professional-input h-11 text-sm">
            <option value="all">{language === 'vi' ? 'Tất cả quốc gia' : 'All locations'}</option>
            {locations.map(location => <option key={location} value={location}>{location}</option>)}
          </select>

          <select value={dealTypeFilter} onChange={event => setDealTypeFilter(event.target.value)} className="professional-input h-11 text-sm">
            <option value="all">{language === 'vi' ? 'Tất cả loại giao dịch' : 'All deal types'}</option>
            <option value="sell_100">{t('acquisition100')}</option>
            <option value="sell_equity">{t('equityStake')}</option>
            <option value="fundraising">{t('fundraisingStep')}</option>
          </select>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={minValuation}
            onChange={event => setMinValuation(event.target.value.replace(/\D/g, '').slice(0, 12))}
            inputMode="numeric"
            placeholder={language === 'vi' ? 'Định giá tối thiểu' : 'Min valuation'}
            className="professional-input h-11 text-sm"
          />
          <input
            value={maxValuation}
            onChange={event => setMaxValuation(event.target.value.replace(/\D/g, '').slice(0, 12))}
            inputMode="numeric"
            placeholder={language === 'vi' ? 'Định giá tối đa' : 'Max valuation'}
            className="professional-input h-11 text-sm"
          />
          <input
            value={minGrowth}
            onChange={event => setMinGrowth(event.target.value.replace(/\D/g, '').slice(0, 3))}
            inputMode="numeric"
            placeholder={language === 'vi' ? 'Tăng trưởng tối thiểu (%)' : 'Min growth (%)'}
            className="professional-input h-11 text-sm"
          />
          <select value={sortBy} onChange={event => setSortBy(event.target.value)} className="professional-input h-11 text-sm">
            <option value="newest">{language === 'vi' ? 'Mới cập nhật' : 'Newest'}</option>
            <option value="valuation_desc">{language === 'vi' ? 'Định giá cao đến thấp' : 'Valuation high to low'}</option>
            <option value="valuation_asc">{language === 'vi' ? 'Định giá thấp đến cao' : 'Valuation low to high'}</option>
            <option value="growth_desc">{language === 'vi' ? 'Tăng trưởng cao nhất' : 'Highest growth'}</option>
          </select>
        </div>

        <div className="mt-4 text-xs font-bold text-slate-400">
          {language === 'vi' ? `Hiển thị ${filteredDeals.length} / ${deals.length} thương vụ` : `Showing ${filteredDeals.length} / ${deals.length} deals`}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map(n => (
            <div key={n} className="h-[280px] animate-pulse rounded-2xl border border-slate-100 bg-slate-50" />
          ))
        ) : filteredDeals.length > 0 ? (
          filteredDeals.map(deal => (
            <motion.div
              key={deal.id}
              whileHover={{ y: -4, borderColor: '#2563eb' }}
              className="glass-card group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-5"
            >
              <Link to={`/deals/${deal.id}`}>
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-tighter text-slate-500">
                      {deal.title.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[10px] font-bold tracking-widest text-slate-400">{tSector(deal.industry)}</div>
                      <h3 className="line-clamp-1 font-bold text-slate-900 transition-colors group-hover:text-blue-600">{deal.title}</h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {deal.strategy.reasonForSale.substring(0, 100)}...
                  </p>

                  <div className="grid grid-cols-2 gap-3 border-y border-slate-50 py-3 sm:grid-cols-3">
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
                      <div className="mb-0.5 text-[9px] font-bold tracking-widest text-slate-400">{t('valuation')}</div>
                      <div className="truncate text-lg font-bold text-slate-900" title={formatCurrency(deal.mandaInfo.valuation, language)}>
                        {formatCompactNumber(deal.mandaInfo.valuation, language)}
                      </div>
                    </div>
                    <button className="shrink-0 rounded-lg bg-slate-900 px-5 py-2 text-[10px] font-bold tracking-wider text-white transition-all hover:bg-slate-800">
                      {t('details')}
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="glass-card col-span-full rounded-3xl border-2 border-dashed bg-slate-50/50 py-24 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-slate-200" />
            <h3 className="text-lg font-bold text-slate-800">{t('marketSilence')}</h3>
            <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
              {searchTerm || industryFilter !== 'all' || locationFilter !== 'all'
                ? (language === 'vi' ? 'Không có thương vụ phù hợp với bộ lọc hiện tại.' : 'No deals match the current filters.')
                : t('marketSilenceDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
