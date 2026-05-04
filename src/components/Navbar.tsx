import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth, signInWithGoogle } from '../lib/firebase';
import { LogOut, LayoutDashboard, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const VietnamFlag = () => (
  <svg viewBox="0 0 16 10" className="w-4 h-3 rounded-[1px] overflow-hidden shadow-sm">
    <rect width="16" height="10" fill="#da251d"/>
    <polygon fill="#ffff00" points="8,2 8.7,4 10.8,4 9.1,5.3 9.8,7.3 8,6 6.2,7.3 6.9,5.3 5.2,4 7.3,4"/>
  </svg>
);

const USAFlag = () => (
  <svg viewBox="0 0 16 10" className="w-4 h-3 rounded-[1px] overflow-hidden shadow-sm">
    <rect width="16" height="10" fill="#ffffff"/>
    <path fill="#b22234" d="M0 0h16v.77H0zm0 1.54h16v.77H0zm0 1.54h16v.77H0zm0 1.54h16v.77H0zm0 1.54h16v.77H0zm0 1.54h16v.77H0zm0 1.54h16v.77H0z"/>
    <rect width="7" height="5.38" fill="#3c3b6e"/>
  </svg>
);

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200" id="main-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2" id="nav-logo">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-sm shadow-blue-200">M</div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Nexus M&A</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider">{t('marketplace')}</Link>
              <Link to="/resources" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider">{t('resources')}</Link>
              <Link to="/about" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider">{t('network')}</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm group"
              title={language === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
            >
              <div className="flex transition-transform group-active:scale-95">
                {language === 'en' ? <USAFlag /> : <VietnamFlag />}
              </div>
              <span className="uppercase tracking-widest pt-0.5 border-l border-slate-100 pl-2">
                {language === 'en' ? 'EN' : 'VI'}
              </span>
            </button>

            <div className="relative hidden xl:block">
              <input 
                type="text" 
                placeholder={t('searchDeals')} 
                className="w-32 focus:w-48 bg-slate-50 border border-slate-200 rounded-full py-1.5 px-4 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>

            {user ? (
              <>
                <Link 
                  to="/deals/new" 
                  className="professional-btn h-9 px-6 text-xs whitespace-nowrap flex items-center justify-center shrink-0"
                  id="btn-create-deal"
                >
                  {t('listDeal')}
                </Link>
                
                <div className="h-6 w-[1px] bg-slate-200 mx-1" />
                
                <Link to="/dashboard" className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Dashboard">
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
                
                <Link to="/profile" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                    {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-slate-400" />}
                  </div>
                </Link>
                
                <button 
                  onClick={() => auth.signOut()}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button 
                onClick={handleLogin}
                className="professional-btn h-9 px-6 text-xs whitespace-nowrap flex items-center justify-center shrink-0"
                id="btn-login"
              >
                {t('signIn')}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
