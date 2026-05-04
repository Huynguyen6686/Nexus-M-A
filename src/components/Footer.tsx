import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 py-16 bg-white shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Nexus Marketplace</span>
            </div>
            <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
              {t('footerDesc')}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">{t('platform')}</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t('marketplace')}</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t('aiMatching')}</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t('vdrSecurity')}</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t('compliance')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">{t('support')}</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t('privacyPolicy')}</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t('termsOfService')}</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t('securityAudit')}</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t('contactAdvisor')}</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('footerCopyright')}</p>
          <div className="flex gap-6">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t('networkStatus')}: {t('operational')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
