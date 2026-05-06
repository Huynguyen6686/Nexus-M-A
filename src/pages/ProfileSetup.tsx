import React, { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Briefcase,
  Building,
  ChevronRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { countries, countryFlagUrl, countryLabel, getCountryOption } from '../lib/countries';

const industries = ['Công nghệ', 'Sản xuất', 'Logistics', 'Y tế', 'Giáo dục', 'Bán lẻ', 'Tài chính', 'Bất động sản'];

export default function ProfileSetup() {
  const { user, profile, setProfile } = useAuth();
  const { language, t } = useLanguage();
  const [role, setRole] = useState<UserRole>('buyer');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [country, setCountry] = useState('Vietnam');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [headline, setHeadline] = useState('');
  const [interests, setInterests] = useState<string[]>(['Công nghệ']);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const roleOptions = useMemo(() => ([
    { id: 'buyer' as const, label: t('investorAcquirer'), desc: t('investorAcquirerDesc'), icon: Briefcase },
    { id: 'seller' as const, label: t('ownerPrincipal'), desc: t('ownerPrincipalDesc'), icon: Building },
    { id: 'advisor' as const, label: t('strategicAdvisor'), desc: t('strategicAdvisorDesc'), icon: ShieldCheck },
  ]), [t]);
  const selectedCountry = getCountryOption(country);

  if (!user) return null;
  if (profile?.userType) return <Navigate to="/" replace />;

  const toggleInterest = (industry: string) => {
    setInterests(prev => {
      if (prev.includes(industry)) return prev.filter(item => item !== industry);
      return [...prev, industry].slice(0, 5);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = displayName.trim();
    if (cleanName.length < 2) {
      setErrorMessage('Vui lòng nhập họ tên tối thiểu 2 ký tự.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: cleanName.slice(0, 80),
      userType: role,
      country,
      companyName: companyName.trim().slice(0, 100),
      jobTitle: jobTitle.trim().slice(0, 100),
      headline: headline.trim().slice(0, 140),
      interests,
      kycStatus: 'unverified',
      createdAt: now,
      updatedAt: now,
    };

    if (user.photoURL) newProfile.photoURL = user.photoURL;

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setProfile(newProfile);
      navigate('/', { replace: true });
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      } catch (handledError) {
        console.error('Profile setup failed:', handledError);
      }
      setErrorMessage('Không lưu được hồ sơ. Vui lòng thử lại hoặc kiểm tra quyền Firestore.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-8 md:py-14">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/5 md:p-10"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">{t('onboarding')}</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">{t('onboardingDesc')}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <section className="space-y-5">
            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-500">Họ và tên</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value.slice(0, 80))}
                className="professional-input h-12"
                placeholder="Nguyễn Văn A"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-500">Chức danh</span>
              <input
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value.slice(0, 100))}
                className="professional-input h-12"
                placeholder="Founder, CFO, Investment manager..."
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-500">Tổ chức / công ty</span>
              <input
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value.slice(0, 100))}
                className="professional-input h-12"
                placeholder="Nexus Capital"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-500">Mô tả ngắn</span>
              <textarea
                value={headline}
                onChange={(event) => setHeadline(event.target.value.slice(0, 140))}
                className="professional-input min-h-24 resize-none py-3"
                placeholder="Quan tâm đến M&A, gọi vốn, chuyển nhượng doanh nghiệp..."
              />
              <span className="block text-right text-[11px] font-bold text-slate-400">{headline.length}/140</span>
            </label>
          </section>

          <section className="space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500">{t('networkRole')}</span>
              <div className="grid gap-3">
                {roleOptions.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={cn(
                      'flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all',
                      role === item.id
                        ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-600/5'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    )}
                  >
                    <div className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                      role === item.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
                    )}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900">{item.label}</h3>
                      <p className="line-clamp-2 text-xs font-medium leading-5 text-slate-500">{item.desc}</p>
                    </div>
                    {role === item.id && <ChevronRight className="h-5 w-5 shrink-0 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-500">Khu vực hoạt động</span>
              <div className="relative">
                <img
                  src={countryFlagUrl(selectedCountry)}
                  alt=""
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-6 -translate-y-1/2 rounded-[2px] object-cover shadow-sm"
                />
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="professional-input h-12 appearance-none"
                  style={{ paddingLeft: '3.25rem' }}
                >
                  {countries.map(item => <option key={item.code} value={item.value}>{countryLabel(item, language)}</option>)}
                </select>
              </div>
            </label>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500">Lĩnh vực quan tâm</span>
              <div className="flex flex-wrap gap-2">
                {industries.map(industry => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => toggleInterest(industry)}
                    className={cn(
                      'rounded-full border px-3 py-2 text-xs font-bold transition-colors',
                      interests.includes(industry)
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    {industry}
                  </button>
                ))}
              </div>
              <p className="text-[11px] font-semibold text-slate-400">Chọn tối đa 5 lĩnh vực để cá nhân hóa marketplace.</p>
            </div>
          </section>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="professional-btn mt-8 flex h-auto w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-white hover:bg-black"
        >
          {submitting ? t('finalizingProfile') : t('completeSetup')}
          {!submitting && <ArrowRight className="h-5 w-5" />}
        </button>
      </motion.form>
    </div>
  );
}
