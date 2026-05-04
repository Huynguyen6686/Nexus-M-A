import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserRole, UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { ShieldCheck, User, Building, Briefcase, ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProfileSetup() {
  const { user, setProfile } = useAuth();
  const { t } = useLanguage();
  const [role, setRole] = useState<UserRole>('buyer');
  const [country, setCountry] = useState('Vietnam');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || t('unnamedProfessional'),
      photoURL: user.photoURL || undefined,
      userType: role,
      country,
      kycStatus: 'unverified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setProfile(newProfile);
      navigate('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 md:p-14 rounded-[40px] bg-white border border-slate-200 shadow-2xl shadow-slate-900/5"
      >
        <div className="text-center space-y-6 mb-12">
          <div className="w-20 h-20 bg-blue-50 rounded-[28px] flex items-center justify-center mx-auto transition-transform hover:rotate-3">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('onboarding')}</h1>
            <p className="text-slate-500 font-medium">{t('onboardingDesc')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-5">
            <label className="metric-label ml-1">{t('networkRole')}</label>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'buyer', label: t('investorAcquirer'), desc: t('investorAcquirerDesc'), icon: Briefcase },
                { id: 'seller', label: t('ownerPrincipal'), desc: t('ownerPrincipalDesc'), icon: Building },
                { id: 'advisor', label: t('strategicAdvisor'), desc: t('strategicAdvisorDesc'), icon: ShieldCheck },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id as UserRole)}
                  className={cn(
                    "flex items-center gap-5 p-6 rounded-3xl border-2 transition-all text-left group",
                    role === item.id 
                    ? "border-blue-600 bg-blue-50/30 shadow-xl shadow-blue-600/5 ring-4 ring-blue-50" 
                    : "border-slate-100 hover:border-slate-200 bg-white"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                    role === item.id ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                  )}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">{item.label}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                  {role === item.id && <ChevronRight className="w-5 h-5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <label className="metric-label ml-1">{t('jurisdiction')}</label>
            <select 
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="professional-input h-14 text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12"
            >
              <option>Vietnam</option>
              <option>Singapore</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Hong Kong</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="professional-btn w-full py-5 bg-slate-900 hover:bg-black text-white shadow-2xl shadow-slate-900/10 group h-auto rounded-3xl"
          >
            {submitting ? t('finalizingProfile') : t('completeSetup')}
            {!submitting && <ArrowRight className="w-5 h-5 inline ml-2 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
