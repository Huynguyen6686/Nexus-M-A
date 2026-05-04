import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { UserRole, UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { User, ShieldCheck, Building, Briefcase, MapPin, Mail, Calendar, Save, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Profile() {
  const { user, profile, setProfile } = useAuth();
  const { t } = useLanguage();
  const [role, setRole] = useState<UserRole>(profile?.userType || 'buyer');
  const [country, setCountry] = useState(profile?.country || 'Vietnam');
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setRole(profile.userType);
      setCountry(profile.country);
      setDisplayName(profile.displayName);
    }
  }, [profile]);

  if (!user || !profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    
    const updatedProfile = {
      ...profile,
      displayName,
      country,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        country,
        updatedAt: new Date().toISOString(),
      });
      setProfile(updatedProfile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Sidebar */}
        <div className="w-full md:w-80 shrink-0 space-y-6">
          <div className="glass-card p-8 rounded-[32px] text-center border border-slate-200">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white ring-4 ring-slate-50">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-300" />
                )}
              </div>
              {profile.kycStatus === 'verified' && (
                <div className="absolute -right-1 -bottom-1 bg-green-500 rounded-full border-4 border-white p-1">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{profile.displayName}</h2>
            <div className="flex items-center justify-center gap-1 text-slate-500 text-sm mt-1 uppercase tracking-wider font-bold">
              {role === 'buyer' && <Briefcase className="w-3 h-3" />}
              {role === 'seller' && <Building className="w-3 h-3" />}
              {role === 'advisor' && <ShieldCheck className="w-3 h-3" />}
              {t(role === 'buyer' ? 'investorAcquirer' : role === 'seller' ? 'ownerPrincipal' : 'strategicAdvisor')}
            </div>
          </div>

          <div className="glass-card p-6 rounded-[32px] border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <span className="truncate">{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-slate-400" />
              </div>
              <span>{profile.country}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
              <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10 rounded-[32px] bg-white border border-slate-200"
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('editProfile') || 'Edit Profile'}</h1>
              {success && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-green-100"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('profileUpdated') || 'Profile Updated'}
                </motion.div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="metric-label ml-1">{t('fullName') || 'Full Name'}</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="professional-input h-14"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="metric-label ml-1">{t('networkRole')}</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'buyer', label: t('investorAcquirer'), icon: Briefcase },
                    { id: 'seller', label: t('ownerPrincipal'), icon: Building },
                    { id: 'advisor', label: t('strategicAdvisor'), icon: ShieldCheck },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                        role === item.id 
                        ? "border-blue-600 bg-blue-50/50" 
                        : "border-slate-50 bg-white opacity-60"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        role === item.id ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"
                      )}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900">{item.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-medium text-slate-500">Vai trò được quản lý bởi admin để đảm bảo phân quyền rõ ràng.</p>
              </div>

              <div className="space-y-3">
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

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="professional-btn w-full py-5 bg-slate-900 hover:bg-black text-white group h-auto rounded-2xl flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {submitting ? (t('saving') || 'Saving...') : (t('saveChanges') || 'Save Changes')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
