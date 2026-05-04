import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Type, Image as ImageIcon, Link as LinkIcon, Send, 
  Sparkles, Download, Share2, Filter, Layers, 
  Palette, Smartphone, Monitor, CheckCircle2, ChevronRight,
  Target, TrendingUp, Building2, Megaphone, Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

type Industry = 'Technology' | 'Finance' | 'Healthcare' | 'Manufacturing' | 'Consumer';
type Purpose = 'Promotion' | 'Announcement' | 'Lead Generation';

interface BannerTemplate {
  id: string;
  name: string;
  industry: Industry;
  purpose: Purpose;
  bgColor: string;
  accentColor: string;
  icon: React.ElementType;
  style: 'minimal' | 'bold' | 'technical' | 'corporate';
}

const TEMPLATES: BannerTemplate[] = [
  { id: 't1', name: 'Silicon Growth', industry: 'Technology', purpose: 'Promotion', bgColor: 'bg-slate-900', accentColor: 'blue', icon: Zap, style: 'technical' },
  { id: 't2', name: 'Strategic Health', industry: 'Healthcare', purpose: 'Announcement', bgColor: 'bg-emerald-900', accentColor: 'emerald', icon: ShieldCheck, style: 'corporate' },
  { id: 't3', name: 'Fiscal Fortress', industry: 'Finance', purpose: 'Lead Generation', bgColor: 'bg-slate-950', accentColor: 'amber', icon: TrendingUp, style: 'bold' },
  { id: 't4', name: 'Industrial Scale', industry: 'Manufacturing', purpose: 'Promotion', bgColor: 'bg-zinc-800', accentColor: 'orange', icon: Building2, style: 'minimal' },
  { id: 't5', name: 'Retail Reach', industry: 'Consumer', purpose: 'Announcement', bgColor: 'bg-indigo-900', accentColor: 'indigo', icon: Megaphone, style: 'corporate' },
  { id: 't6', name: 'Cyber Stream', industry: 'Technology', purpose: 'Lead Generation', bgColor: 'bg-blue-950', accentColor: 'blue', icon: Monitor, style: 'bold' },
];

function ShieldCheck(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function MarketingCenter() {
  const { language, t, tSector } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState<BannerTemplate>(TEMPLATES[0]);
  const [industryFilter, setIndustryFilter] = useState<Industry | 'All'>('All');
  const [purposeFilter, setPurposeFilter] = useState<Purpose | 'All'>('All');
  
  const defaultHeadline = language === 'vi'
    ? 'Cơ hội mua lại chiến lược: SaaS tăng trưởng cao tại Đông Nam Á'
    : 'Strategic Acquisition Opportunity: High-Growth SaaS in SE Asia';
  const [customText, setCustomText] = useState(defaultHeadline);
  const [customUrl, setCustomUrl] = useState('nexus.ma/deals/sf-tech');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setCustomText(current => {
      const oldDefaults = [
        'Strategic Acquisition Opportunity: High-Growth SaaS in SE Asia',
        'Cơ hội mua lại chiến lược: SaaS tăng trưởng cao tại Đông Nam Á',
      ];
      return oldDefaults.includes(current) ? defaultHeadline : current;
    });
  }, [defaultHeadline]);

  const filteredTemplates = TEMPLATES.filter(t => 
    (industryFilter === 'All' || t.industry === industryFilter) &&
    (purposeFilter === 'All' || t.purpose === purposeFilter)
  );

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('marketingCenterTitle')}</h1>
          <p className="text-sm text-slate-500 font-medium">{t('genAssetsDesc')}</p>
        </div>
        <div className="flex gap-3">
          <button className="professional-btn bg-slate-900 hover:bg-black flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> {t('aiAutoCopy')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Library & Filters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 rounded-2xl bg-white space-y-6">
            <div className="space-y-4">
              <label className="metric-label ml-1">{t('industryCluster')}</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Consumer'].map(ind => (
                  <button
                    key={ind}
                    onClick={() => setIndustryFilter(ind as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all",
                      industryFilter === ind ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                    )}
                  >
                    {ind === 'All' ? t('all') : tSector(ind)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="metric-label ml-1">{t('assetPurposeLabel')}</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Promotion', 'Announcement', 'Lead Generation'].map(purp => (
                  <button
                    key={purp}
                    onClick={() => setPurposeFilter(purp as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all",
                      purposeFilter === purp ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                    )}
                  >
                    {purp === 'All' ? t('all') : purp === 'Promotion' ? t('promotion') : purp === 'Announcement' ? t('announcement') : t('leadGeneration')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="metric-label ml-1">{t('librarySamplesLabel')}</h3>
            <div className="grid grid-cols-1 gap-3">
              {filteredTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all group overflow-hidden relative",
                    selectedTemplate.id === template.id ? "border-blue-600 bg-blue-50/10" : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg",
                      template.bgColor
                    )}>
                      <template.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{template.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{tSector(template.industry)} • {template.style}</div>
                    </div>
                  </div>
                  {selectedTemplate.id === template.id && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: Canvas & Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t('livePreview')}</h2>
              <div className="flex gap-2">
                <Monitor className="w-4 h-4 text-slate-400" />
                <Smartphone className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <motion.div 
              layout
              className={cn(
                "w-full aspect-[16/9] rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl transition-all duration-500",
                selectedTemplate.bgColor
              )}
            >
              {/* Abstract Background Detail */}
              <div className={cn(
                "absolute -top-20 -right-20 w-64 h-64 blur-3xl opacity-20 rounded-full",
                `bg-${selectedTemplate.accentColor}-400`
              )} />
              <div className={cn(
                "absolute -bottom-10 -left-10 w-48 h-48 blur-2xl opacity-10 rounded-full",
                `bg-${selectedTemplate.accentColor}-200`
              )} />

              <div className="relative z-10 flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20",
                  `text-${selectedTemplate.accentColor}-400`
                )}>
                  <selectedTemplate.icon className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  Nexus M&A Network • {tSector(selectedTemplate.industry)}
                </div>
              </div>

              <div className="relative z-10 space-y-4">
                <h3 className={cn(
                  "text-3xl font-bold text-white tracking-tight leading-tight",
                  selectedTemplate.style === 'minimal' ? "font-light" : "font-black"
                )}>
                  {customText || t('yourHeadlineHere')}
                </h3>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg",
                    `bg-${selectedTemplate.accentColor}-500 text-white`
                  )}>
                    {selectedTemplate.purpose === 'Lead Generation' ? t('leadGeneration') : selectedTemplate.purpose === 'Announcement' ? t('announcement') : t('promotion')}
                  </div>
                  <div className="text-[10px] font-bold text-white/40 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" /> {customUrl || 'nexus.ma/deals/...'}
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/10 flex justify-between items-center text-[8px] font-bold text-white/30 uppercase tracking-[0.3em]">
                <span>{t('verified')} {t('assetIndex')}</span>
                <span>© 2026 Nexus Capital</span>
              </div>
            </motion.div>

            {/* Controls */}
            <div className="flex gap-4">
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 professional-btn py-3 bg-slate-900 border-none shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 h-12"
              >
                {isExporting ? <CheckCircle2 className="w-5 h-5 animate-bounce" /> : <Download className="w-5 h-5" />}
                {isExporting ? t('exportedReady') : t('downloadHighResBtn')}
              </button>
              <button className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <Share2 className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Customization */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-6 rounded-2xl bg-white space-y-8">
            <div className="space-y-4">
              <label className="metric-label ml-1">{t('assetConfiguration')}</label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{t('headlineText')}</span>
                  <textarea 
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="professional-input h-32 resize-none text-xs" 
                    placeholder={t('describeOpportunityPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Target URL</span>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="professional-input pl-9 text-xs" 
                      placeholder="nexus.ma/your-deal"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <label className="metric-label ml-1">{t('aestheticOverrides')}</label>
              <div className="grid grid-cols-4 gap-2">
                {['blue', 'emerald', 'amber', 'rose'].map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedTemplate(prev => ({ ...prev, accentColor: color }))}
                    className={cn(
                      "w-full aspect-square rounded-lg border-2 transition-all",
                      selectedTemplate.accentColor === color ? "border-slate-900" : "border-transparent"
                    )}
                    style={{ backgroundColor: `var(--color-${color}-500)` }}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
              <Megaphone className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-[10px] text-blue-800 font-bold uppercase tracking-tight leading-relaxed">
                {t('proTipShortUrl')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
