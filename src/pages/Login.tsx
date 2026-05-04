import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, signInWithGoogle } from '../lib/firebase';
import { ShieldCheck, ArrowRight, Shield, Globe, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, profile, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    navigate(profile?.userType ? '/' : '/profile-setup', { replace: true });
  }, [loading, navigate, profile?.userType, user]);

  const handleLogin = async () => {
    if (signingIn) return;
    setSigningIn(true);
    try {
      const signedInUser = await signInWithGoogle();
      const profileSnap = await getDoc(doc(db, 'users', signedInUser.uid));
      const existingProfile = profileSnap.exists() ? profileSnap.data() : null;
      navigate(existingProfile?.userType ? '/' : '/profile-setup', { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 md:py-24">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-10">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              {t('loginTitleTop')} <br />
              <span className="text-blue-600">{t('loginTitleBottom')}</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              {t('platformOneLiner')}
            </p>
          </div>

          <div className="space-y-6">
            {[
              { icon: Shield, title: t('vdrFeatureTitle'), desc: t('vdrFeatureDesc') },
              { icon: Globe, title: t('globalDealFlowTitle'), desc: t('globalDealFlowDesc') },
              { icon: Lock, title: t('strategicGuardTitle'), desc: t('strategicGuardDesc') },
            ].map((feature, i) => (
              <div key={i} className="flex gap-5 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center transition-colors group-hover:bg-blue-100">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-slate-900 text-base">{feature.title}</h3>
                  <p className="text-sm text-slate-500 font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 rounded-[32px] bg-white border border-slate-200 shadow-2xl shadow-slate-900/5"
        >
          <div className="text-center space-y-8">
            <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-slate-900/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900">{t('signInToNexus')}</h2>
              <p className="text-sm text-slate-500 font-medium px-4">{t('securePortal')}</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleLogin}
                disabled={signingIn}
                className="w-full flex items-center justify-center gap-3 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 opacity-70" />
                {signingIn ? t('saving') : t('continueWithGoogle')}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold text-slate-300">
                  <span className="bg-white px-4">{t('standardSSO')}</span>
                </div>
              </div>
              
              <button className="professional-btn w-full py-4 bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-900/10">
                {t('institutionalLogin')} <ArrowRight className="w-4 h-4 inline ml-2" />
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              {t('auditNote')}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
