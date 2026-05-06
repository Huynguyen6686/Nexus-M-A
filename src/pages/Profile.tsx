import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import {
  BadgeCheck,
  Briefcase,
  Building,
  Calendar,
  CheckCircle2,
  Crown,
  Link as LinkIcon,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { countries, countryFlagUrl, countryLabel, getCountryOption } from '../lib/countries';

const industries = ['Công nghệ', 'Sản xuất', 'Logistics', 'Y tế', 'Giáo dục', 'Bán lẻ', 'Tài chính', 'Bất động sản'];

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function Profile() {
  const { user, profile, setProfile } = useAuth();
  const { language, t } = useLanguage();
  const [form, setForm] = useState({
    displayName: '',
    country: 'Vietnam',
    photoURL: '',
    phone: '',
    headline: '',
    companyName: '',
    jobTitle: '',
    bio: '',
    website: '',
    preferredDealSizeMin: '',
    preferredDealSizeMax: '',
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!profile) return;
    setForm({
      displayName: profile.displayName || '',
      country: profile.country || 'Vietnam',
      photoURL: profile.photoURL || '',
      phone: profile.phone || '',
      headline: profile.headline || '',
      companyName: profile.companyName || '',
      jobTitle: profile.jobTitle || '',
      bio: profile.bio || '',
      website: profile.website || '',
      preferredDealSizeMin: profile.preferredDealSizeMin ? String(profile.preferredDealSizeMin) : '',
      preferredDealSizeMax: profile.preferredDealSizeMax ? String(profile.preferredDealSizeMax) : '',
    });
    setInterests(profile.interests || []);
  }, [profile]);

  const roleMeta = useMemo<Record<UserRole, { label: string; icon: typeof Briefcase }>>(() => ({
    buyer: { label: t('investorAcquirer'), icon: Briefcase },
    seller: { label: t('ownerPrincipal'), icon: Building },
    advisor: { label: t('strategicAdvisor'), icon: ShieldCheck },
    admin: { label: t('roleAdmin'), icon: Crown },
  }), [t]);

  if (!user || !profile) return null;

  const role = profile.userType;
  const CurrentRoleIcon = roleMeta[role].icon;
  const avatar = form.photoURL || user.photoURL || '';
  const selectedCountry = getCountryOption(form.country || profile.country);
  const sidebarCountry = getCountryOption(profile.country);

  const setField = (name: keyof typeof form, value: string) => {
    const limits: Record<string, number> = {
      displayName: 80,
      photoURL: 500,
      phone: 30,
      headline: 140,
      companyName: 100,
      jobTitle: 100,
      bio: 600,
      website: 300,
      preferredDealSizeMin: 14,
      preferredDealSizeMax: 14,
      country: 60,
    };
    setForm(prev => ({ ...prev, [name]: value.slice(0, limits[name] || 200) }));
  };

  const toggleInterest = (industry: string) => {
    setInterests(prev => {
      if (prev.includes(industry)) return prev.filter(item => item !== industry);
      return [...prev, industry].slice(0, 5);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const displayName = form.displayName.trim();
    if (displayName.length < 2) {
      setErrorMessage('Họ tên cần tối thiểu 2 ký tự.');
      return;
    }

    const minSize = form.preferredDealSizeMin ? Number(form.preferredDealSizeMin) : undefined;
    const maxSize = form.preferredDealSizeMax ? Number(form.preferredDealSizeMax) : undefined;
    if ((minSize !== undefined && minSize < 0) || (maxSize !== undefined && maxSize < 0)) {
      setErrorMessage('Khoảng định giá quan tâm không được âm.');
      return;
    }
    if (minSize !== undefined && maxSize !== undefined && minSize > maxSize) {
      setErrorMessage('Khoảng định giá tối thiểu không được lớn hơn tối đa.');
      return;
    }

    setSubmitting(true);
    setSuccess(false);
    setErrorMessage('');

    const updatedProfile: UserProfile = {
      ...profile,
      displayName,
      country: form.country,
      photoURL: normalizeUrl(form.photoURL),
      phone: form.phone.trim(),
      headline: form.headline.trim(),
      companyName: form.companyName.trim(),
      jobTitle: form.jobTitle.trim(),
      bio: form.bio.trim(),
      website: normalizeUrl(form.website),
      interests,
      preferredDealSizeMin: minSize,
      preferredDealSizeMax: maxSize,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: updatedProfile.displayName,
        country: updatedProfile.country,
        photoURL: updatedProfile.photoURL,
        phone: updatedProfile.phone,
        headline: updatedProfile.headline,
        companyName: updatedProfile.companyName,
        jobTitle: updatedProfile.jobTitle,
        bio: updatedProfile.bio,
        website: updatedProfile.website,
        interests: updatedProfile.interests,
        preferredDealSizeMin: updatedProfile.preferredDealSizeMin ?? null,
        preferredDealSizeMax: updatedProfile.preferredDealSizeMax ?? null,
        updatedAt: updatedProfile.updatedAt,
      });
      setProfile(updatedProfile);
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      } catch (handledError) {
        console.error('Profile update failed:', handledError);
      }
      setErrorMessage('Không cập nhật được hồ sơ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const kycClass = profile.kycStatus === 'verified'
    ? 'border-green-100 bg-green-50 text-green-700'
    : profile.kycStatus === 'rejected'
      ? 'border-rose-100 bg-rose-50 text-rose-700'
      : 'border-amber-100 bg-amber-50 text-amber-700';

  return (
    <div className="mx-auto max-w-6xl py-8">
      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-5">
          <section className="rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-sm">
            <div className="relative mx-auto mb-4 h-28 w-28">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 ring-4 ring-slate-50">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-slate-300" />
                )}
              </div>
              {profile.kycStatus === 'verified' && (
                <div className="absolute bottom-1 right-1 rounded-full border-4 border-white bg-green-500 p-1">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <h2 className="break-words text-2xl font-bold text-slate-950">{profile.displayName}</h2>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm font-bold text-slate-500">
              <CurrentRoleIcon className="h-4 w-4" />
              {roleMeta[role].label}
            </div>
            {profile.headline && (
              <p className="mt-4 text-sm font-medium leading-6 text-slate-500">{profile.headline}</p>
            )}
            <div className={cn('mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold', kycClass)}>
              <BadgeCheck className="h-4 w-4" />
              KYC: {profile.kycStatus}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4 text-sm font-medium text-slate-600">
              <div className="flex min-w-0 items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                <img src={countryFlagUrl(sidebarCountry)} alt="" className="h-3.5 w-5 rounded-[2px] object-cover shadow-sm" />
                <span>{countryLabel(sidebarCountry, language)}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.companyName && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="break-words">{profile.companyName}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                <span>Tham gia từ {new Date(profile.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </section>
        </aside>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="mb-8 flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">{t('editProfile') || 'Chỉnh sửa hồ sơ'}</h1>
              <p className="mt-1 text-sm font-medium text-slate-500">Quản lý danh tính, hồ sơ chuyên nghiệp và khẩu vị giao dịch.</p>
            </div>
            {success && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-2 text-xs font-bold text-green-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                {t('profileUpdated') || 'Đã cập nhật hồ sơ'}
              </motion.div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-xs font-bold text-slate-500">Họ và tên</span>
                <input value={form.displayName} onChange={(event) => setField('displayName', event.target.value)} className="professional-input h-12" required />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-bold text-slate-500">Khu vực</span>
                <div className="relative">
                  <img
                    src={countryFlagUrl(selectedCountry)}
                    alt=""
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-6 -translate-y-1/2 rounded-[2px] object-cover shadow-sm"
                  />
                  <select
                    value={form.country}
                    onChange={(event) => setField('country', event.target.value)}
                    className="professional-input h-12 appearance-none"
                    style={{ paddingLeft: '3.25rem' }}
                  >
                    {countries.map(country => <option key={country.code} value={country.value}>{countryLabel(country, language)}</option>)}
                  </select>
                </div>
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-bold text-slate-500">Chức danh</span>
                <input value={form.jobTitle} onChange={(event) => setField('jobTitle', event.target.value)} className="professional-input h-12" placeholder="Founder, CFO, Investment manager..." />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-bold text-slate-500">Tổ chức / công ty</span>
                <input value={form.companyName} onChange={(event) => setField('companyName', event.target.value)} className="professional-input h-12" placeholder="Nexus Capital" />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-bold text-slate-500">Số điện thoại</span>
                <input value={form.phone} onChange={(event) => setField('phone', event.target.value.replace(/[^\d+\s()-]/g, ''))} className="professional-input h-12" placeholder="+84..." />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-bold text-slate-500">Website / hồ sơ công khai</span>
                <div className="relative">
                  <LinkIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.website}
                    onChange={(event) => setField('website', event.target.value)}
                    className="professional-input h-12"
                    style={{ paddingLeft: '3rem' }}
                    placeholder="https://..."
                  />
                </div>
              </label>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-bold text-slate-500">Link ảnh đại diện</span>
                <input value={form.photoURL} onChange={(event) => setField('photoURL', event.target.value)} className="professional-input h-12" placeholder="https://..." />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-bold text-slate-500">Mô tả ngắn</span>
                <input value={form.headline} onChange={(event) => setField('headline', event.target.value)} className="professional-input h-12" placeholder="Một dòng giới thiệu về bạn" />
                <span className="block text-right text-[11px] font-bold text-slate-400">{form.headline.length}/140</span>
              </label>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-bold text-slate-500">Tiểu sử chuyên nghiệp</span>
                <textarea value={form.bio} onChange={(event) => setField('bio', event.target.value)} className="professional-input min-h-32 resize-none py-3" placeholder="Kinh nghiệm, lĩnh vực quan tâm, mục tiêu giao dịch..." />
                <span className="block text-right text-[11px] font-bold text-slate-400">{form.bio.length}/600</span>
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-xs font-bold text-slate-500">Định giá quan tâm tối thiểu</span>
                <input value={form.preferredDealSizeMin} onChange={(event) => setField('preferredDealSizeMin', event.target.value.replace(/[^\d.]/g, ''))} className="professional-input h-12" placeholder="Ví dụ: 1000000000" />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-bold text-slate-500">Định giá quan tâm tối đa</span>
                <input value={form.preferredDealSizeMax} onChange={(event) => setField('preferredDealSizeMax', event.target.value.replace(/[^\d.]/g, ''))} className="professional-input h-12" placeholder="Ví dụ: 50000000000" />
              </label>
            </div>

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
              <p className="text-[11px] font-semibold text-slate-400">Tối đa 5 lĩnh vực. Dữ liệu này dùng để cá nhân hóa gợi ý sau này.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-bold text-slate-500">{t('networkRole')}</div>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <CurrentRoleIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-bold text-slate-900">{roleMeta[role].label}</div>
                  <div className="text-xs font-medium text-slate-500">Vai trò do admin quản lý để đảm bảo phân quyền.</div>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="professional-btn flex h-auto w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-white hover:bg-black"
            >
              <Save className="h-5 w-5" />
              {submitting ? (t('saving') || 'Đang lưu...') : (t('saveChanges') || 'Lưu thay đổi')}
            </button>
          </form>
        </motion.section>
      </div>
    </div>
  );
}
