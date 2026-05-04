import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, TrendingUp, DollarSign, Target, FileText, ArrowRight, ArrowLeft, Loader2, Sparkles, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { DealType, Deal, Company } from '../types';
import { generateDealSummary } from '../lib/gemini';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

export default function CreateDeal() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    industry: 'Technology',
    location: 'Singapore',
    dealType: 'sell_100' as DealType,
    legalName: '',
    taxId: '',
    revenue: ['', '', ''], // Y1, Y2, Y3
    ebitda: '',
    netProfit: '',
    valuation: '',
    equityOffered: '100',
    reasonForSale: '',
    futurePlans: '',
    aiSummary: '',
    employeeCount: '10',
    foundedYear: '2020',
    products: '',
    targetMarket: '',
    founderPct: '100',
    investorPct: '0',
    esopPct: '0',
    growthRate: '15',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.title) newErrors.title = t('fieldRequired');
      else if (formData.title.length < 10) newErrors.title = t('titleTooShort');
      
      if (!formData.location) newErrors.location = t('fieldRequired');
      if (!formData.legalName) newErrors.legalName = t('fieldRequired');
      if (!formData.taxId) newErrors.taxId = t('fieldRequired');
    }

    if (currentStep === 2) {
      const hasRevenue = formData.revenue.some(rev => rev !== '' && Number(rev) > 0);
      if (!hasRevenue) newErrors.revenue = t('atLeastOneRevenue');
      
      if (!formData.valuation) newErrors.valuation = t('fieldRequired');
      else if (Number(formData.valuation) <= 0) newErrors.valuation = t('invalidAmount');
      
      if (!formData.equityOffered) newErrors.equityOffered = t('fieldRequired');
    }

    if (currentStep === 3) {
      if (!formData.reasonForSale) newErrors.reasonForSale = t('fieldRequired');
      else if (formData.reasonForSale.length < 20) newErrors.reasonForSale = t('descTooShort');
      
      if (!formData.futurePlans) newErrors.futurePlans = t('fieldRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
    }
  };

  const formatInputNumber = (value: string) => {
    if (!value) return '';
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    
    const locale = t('language') === 'vi' ? 'vi-VN' : 'en-US';
    return new Intl.NumberFormat(locale).format(Number(numericValue));
  };

  const parseCurrencyInput = (formattedValue: string) => {
    return formattedValue.replace(/\D/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const rawValue = parseCurrencyInput(value);
    
    setFormData(prev => ({ ...prev, [name]: rawValue }));
    
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleRevenueCurrencyChange = (index: number, value: string) => {
    const rawValue = parseCurrencyInput(value);
    const newRevenue = [...formData.revenue];
    newRevenue[index] = rawValue;
    setFormData(prev => ({ ...prev, revenue: newRevenue }));
    
    if (errors.revenue) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.revenue;
        return next;
      });
    }
  };

  const handleGenerateAI = async () => {
    if (!formData.title || !formData.reasonForSale) return;
    setAiGenerating(true);
    const summary = await generateDealSummary({
      title: formData.title,
      industry: formData.industry,
      financials: { revenue: formData.revenue.map(Number) },
      strategy: { reasonForSale: formData.reasonForSale }
    });
    if (summary) {
      setFormData(prev => ({ ...prev, aiSummary: summary }));
    }
    setAiGenerating(false);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const companyRef = doc(collection(db, 'companies'));
      const companyData: Company = {
        id: companyRef.id,
        ownerId: user.uid,
        legalName: formData.legalName,
        taxId: formData.taxId,
        country: formData.location,
        foundedYear: parseInt(formData.foundedYear) || new Date().getFullYear(),
        industry: formData.industry,
        products: formData.products,
        targetMarket: formData.targetMarket,
        ownershipStructure: { 
          founderPct: Number(formData.founderPct), 
          investorPct: Number(formData.investorPct), 
          esopPct: Number(formData.esopPct) 
        },
        createdAt: new Date().toISOString(),
      };
      await setDoc(companyRef, companyData);

      const dealRef = doc(collection(db, 'deals'));
      const dealData: Deal = {
        id: dealRef.id,
        sellerId: user.uid,
        companyId: companyRef.id,
        title: formData.title,
        industry: formData.industry,
        location: formData.location,
        dealType: formData.dealType,
        status: 'published',
        financials: {
          revenue: formData.revenue.map(Number),
          ebitda: Number(formData.ebitda),
          netProfit: Number(formData.netProfit),
          growthRate: Number(formData.growthRate),
        },
        mandaInfo: {
          valuation: Number(formData.valuation),
          equityOffered: Number(formData.equityOffered),
          employeeCount: parseInt(formData.employeeCount),
          foundedYear: parseInt(formData.foundedYear),
        },
        strategy: {
          reasonForSale: formData.reasonForSale,
          futurePlans: formData.futurePlans,
        },
        aiSummary: formData.aiSummary,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(dealRef, dealData);
      navigate(`/deals/${dealRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'deals');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { name: t('identity'), icon: Building2 },
    { name: t('financials'), icon: Building2 },
    { name: t('strategyStep'), icon: Target },
    { name: t('deployStep'), icon: Sparkles },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('institutionalListing')}</h1>
          <p className="text-sm text-slate-500 font-medium">{t('createProposalDesc')}</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <span className={cn(
                "transition-colors",
                step === i + 1 ? "text-blue-600" : "text-slate-300"
              )}>{s.name}</span>
              {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-slate-200" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Steps Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i + 1)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group",
                step === i + 1 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <s.icon className={cn("w-4 h-4", step === i + 1 ? "text-blue-400" : "text-slate-400 group-hover:text-slate-900")} />
              <span className="text-xs font-bold uppercase tracking-wider">{s.name}</span>
            </button>
          ))}
        </div>

        {/* Right Side: Form Content */}
        <div className="lg:col-span-3">
          <div className="glass-card p-8 rounded-3xl bg-white border border-slate-200 min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="metric-label uppercase">{t('listingTitle')}</label>
                      <input 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        className={cn(
                          "professional-input text-lg",
                          errors.title && "border-rose-500 bg-rose-50/10 focus:ring-rose-500"
                        )}
                        placeholder={t('listingTitlePlaceholder')} 
                      />
                      {errors.title && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{errors.title}</p>}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="metric-label">{t('industryCluster')}</label>
                        <select 
                          name="industry" 
                          value={formData.industry} 
                          onChange={handleChange} 
                          className="professional-input"
                        >
                          <option value="Technology">{t('techIndustry')}</option>
                          <option value="Consumer / Retail">{t('consumerIndustry')}</option>
                          <option value="Manufacturing">{t('manufacturingIndustry')}</option>
                          <option value="Logistics">{t('logisticsIndustry')}</option>
                          <option value="Healthcare">{t('healthcareIndustry')}</option>
                          <option value="Finance">{t('financeIndustry', 'Finance')}</option>
                          <option value="Real Estate">{t('realEstateIndustry', 'Bất động sản')}</option>
                          <option value="Education">{t('educationIndustry', 'Giáo dục')}</option>
                          <option value="Energy">{t('energyIndustry', 'Năng lượng')}</option>
                          <option value="Agriculture">{t('agricultureIndustry', 'Nông nghiệp')}</option>
                          <option value="Media">{t('mediaIndustry', 'Truyền thông & Giải trí')}</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="metric-label">{t('entityCountry')}</label>
                        <select 
                          name="location" 
                          value={formData.location} 
                          onChange={handleChange} 
                          className={cn(
                            "professional-input",
                            errors.location && "border-rose-500 bg-rose-50/10 focus:ring-rose-500"
                          )} 
                        >
                          <option value="Vietnam">Vietnam</option>
                          <option value="Singapore">Singapore</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Hong Kong">Hong Kong</option>
                          <option value="Japan">Japan</option>
                          <option value="South Korea">South Korea</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Canada">Canada</option>
                        </select>
                        {errors.location && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{errors.location}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="metric-label">{t('legalName')}</label>
                        <input 
                          name="legalName" 
                          value={formData.legalName} 
                          onChange={handleChange} 
                          className={cn(
                            "professional-input",
                            errors.legalName && "border-rose-500 bg-rose-50/10 focus:ring-rose-500"
                          )} 
                          placeholder={t('legalNamePlaceholder')} 
                        />
                        {errors.legalName && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{errors.legalName}</p>}
                      </div>
                      <div className="space-y-4">
                        <label className="metric-label">{t('taxIdLabel')}</label>
                        <input 
                          name="taxId" 
                          value={formData.taxId} 
                          onChange={handleChange} 
                          className={cn(
                            "professional-input",
                            errors.taxId && "border-rose-500 bg-rose-50/10 focus:ring-rose-500"
                          )} 
                          placeholder={t('taxIdPlaceholder')} 
                        />
                        {errors.taxId && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{errors.taxId}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <label className="metric-label">{t('foundedYear')}</label>
                        <input name="foundedYear" type="number" value={formData.foundedYear} onChange={handleChange} className="professional-input" />
                      </div>
                      <div className="space-y-4 md:col-span-2">
                        <label className="metric-label">{t('productsServices')}</label>
                        <input name="products" value={formData.products} onChange={handleChange} className="professional-input" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="metric-label">{t('targetMarket')}</label>
                      <input name="targetMarket" value={formData.targetMarket} onChange={handleChange} className="professional-input" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-4">
                        <label className="metric-label">{t('founderEquity')}</label>
                        <input name="founderPct" type="number" value={formData.founderPct} onChange={handleChange} className="professional-input" />
                      </div>
                      <div className="space-y-4">
                        <label className="metric-label">{t('investorEquity')}</label>
                        <input name="investorPct" type="number" value={formData.investorPct} onChange={handleChange} className="professional-input" />
                      </div>
                      <div className="space-y-4">
                        <label className="metric-label">{t('esopEquity')}</label>
                        <input name="esopPct" type="number" value={formData.esopPct} onChange={handleChange} className="professional-input" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="metric-label">{t('transactionThesis')}</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'sell_100', label: t('acquisition100') },
                          { id: 'sell_equity', label: t('equityStake') },
                          { id: 'fundraising', label: t('fundraisingStep') },
                        ].map(type => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, dealType: type.id as DealType }))}
                            className={cn(
                              "py-2.5 rounded-xl border-2 font-bold text-[12px] transition-all",
                              formData.dealType === type.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                            )}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="metric-label">{t('annualRevenueHistory')}</label>
                      <div className="grid grid-cols-3 gap-4">
                        {formData.revenue.map((rev, i) => (
                          <div key={i} className="relative">
                            {t('language') === 'en' && (
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono italic">$</span>
                            )}
                            <input
                              type="text"
                              value={formatInputNumber(rev)}
                              onChange={(e) => handleRevenueCurrencyChange(i, e.target.value)}
                              className={cn(
                                "professional-input",
                                t('language') === 'en' ? "pl-9" : "pr-9",
                                errors.revenue && "border-rose-500 bg-rose-50/10 focus:ring-rose-500"
                              )}
                              placeholder={`${t('yearLabel')} ${i + 1}`}
                            />
                            {t('language') === 'vi' && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono italic">₫</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {errors.revenue && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{errors.revenue}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="metric-label">{t('targetValuation')}</label>
                        <div className="relative">
                          {t('language') === 'en' && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono italic">$</span>
                          )}
                          <input 
                            name="valuation" 
                            value={formatInputNumber(formData.valuation)} 
                            onChange={handleCurrencyChange} 
                            type="text" 
                            className={cn(
                                "professional-input text-blue-600 font-bold",
                                t('language') === 'en' ? "pl-9" : "pr-9",
                                errors.valuation && "border-rose-500 bg-rose-50/10 focus:ring-rose-500"
                            )} 
                            placeholder={t('expectedValue')} 
                          />
                          {t('language') === 'vi' && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">₫</span>
                          )}
                        </div>
                        {errors.valuation && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{errors.valuation}</p>}
                      </div>
                      <div className="space-y-4">
                        <label className="metric-label">{t('equityHandover')}</label>
                        <input name="equityOffered" value={formData.equityOffered} onChange={handleChange} type="number" className="professional-input" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="metric-label">{t('adjustedEbitda')}</label>
                        <div className="relative">
                          {t('language') === 'en' && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono italic">$</span>
                          )}
                          <input 
                            name="ebitda" 
                            value={formatInputNumber(formData.ebitda)} 
                            onChange={handleCurrencyChange} 
                            type="text" 
                            className={cn(
                                "professional-input",
                                t('language') === 'en' ? "pl-9" : "pr-9"
                            )} 
                          />
                          {t('language') === 'vi' && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">₫</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="metric-label">{t('netProfit')}</label>
                        <div className="relative">
                          {t('language') === 'en' && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono italic">$</span>
                          )}
                          <input 
                            name="netProfit" 
                            value={formatInputNumber(formData.netProfit)} 
                            onChange={handleCurrencyChange} 
                            type="text" 
                            className={cn(
                                "professional-input",
                                t('language') === 'en' ? "pl-9" : "pr-9"
                            )} 
                          />
                          {t('language') === 'vi' && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">₫</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="metric-label">{t('staffCount')}</label>
                        <input name="employeeCount" value={formData.employeeCount} onChange={handleChange} type="number" className="professional-input" />
                      </div>
                      <div className="space-y-4">
                        <label className="metric-label">{t('growthRate')}</label>
                        <input name="growthRate" value={formData.growthRate} onChange={handleChange} type="number" className="professional-input" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="metric-label">{t('investmentThesis')}</label>
                      <textarea 
                        name="reasonForSale" 
                        value={formData.reasonForSale} 
                        onChange={handleChange} 
                        className={cn(
                            "professional-input h-32 resize-none",
                            errors.reasonForSale && "border-rose-500 bg-rose-50/10 focus:ring-rose-500"
                        )} 
                        placeholder={t('investmentThesisPlaceholder')} 
                      />
                      {errors.reasonForSale && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{errors.reasonForSale}</p>}
                    </div>
                    <div className="space-y-4">
                      <label className="metric-label">{t('growthRoadmap')}</label>
                      <textarea 
                        name="futurePlans" 
                        value={formData.futurePlans} 
                        onChange={handleChange} 
                        className={cn(
                            "professional-input h-32 resize-none",
                            errors.futurePlans && "border-rose-500 bg-rose-50/10 focus:ring-rose-500"
                        )} 
                        placeholder={t('growthRoadmapPlaceholder')} 
                      />
                      {errors.futurePlans && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{errors.futurePlans}</p>}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8">
                    <div className="ai-glow p-8 rounded-3xl bg-slate-900 text-white space-y-6 relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-5 h-5 text-blue-400" />
                          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-widest">{t('aiAudit')}</span>
                        </div>
                        {formData.aiSummary ? (
                          <div className="space-y-4">
                            <p className="text-slate-200 font-medium italic leading-relaxed">"{formData.aiSummary}"</p>
                            <button onClick={handleGenerateAI} className="text-[10px] font-bold text-blue-400 hover:underline uppercase tracking-widest">{t('regenerateAnalysis')}</button>
                          </div>
                        ) : (
                          <button
                            onClick={handleGenerateAI}
                            disabled={aiGenerating}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                          >
                            {aiGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            {t('generateDealSummaryBtn')}
                          </button>
                        )}
                      </div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    </div>

                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 items-start">
                      <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-[10px] text-amber-900 font-bold uppercase tracking-tight">{t('institutionalComplianceLabel')}</p>
                        <p className="text-[10px] text-amber-900 font-medium leading-relaxed uppercase tracking-tight">
                          {t('complianceWarningText')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-auto pt-8 flex justify-between border-t border-slate-100">
              <button
                onClick={() => setStep(s => Math.max(1, s - 1))}
                className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors", step === 1 && "opacity-0 invisible")}
              >
                <ArrowLeft className="w-4 h-4" /> {t('previousBtn')}
              </button>
              
              {step < 4 ? (
                <button
                  onClick={handleNextStep}
                  className="professional-btn h-11 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {t('continueBtn')} <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="professional-btn h-11 px-8 bg-slate-900 hover:bg-black rounded-xl flex items-center gap-2 shadow-xl shadow-slate-900/20"
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                  {t('deployToMarketBtn')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

