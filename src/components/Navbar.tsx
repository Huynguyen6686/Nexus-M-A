import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../lib/firebase';
import { LayoutDashboard, LogOut, Menu, ShieldCheck, User, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Notifications from './Notifications';
import { canAccessAdmin, canCreateDeal } from '../lib/rbac';

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
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const showCreateDeal = canCreateDeal(profile);
  const showAdmin = canAccessAdmin(profile);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  const handleLogin = async () => {
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: t('marketplace') },
    { to: '/resources', label: t('resources') },
    { to: '/network', label: t('network') },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white" id="main-nav">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4 lg:gap-8">
            <Link to="/" className="flex min-w-0 items-center gap-2" id="nav-logo">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm shadow-blue-200">M</div>
              <span className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Nexus M&A</span>
            </Link>

            <div className="hidden items-center gap-6 lg:flex">
              {navItems.map(item => (
                <Link key={item.to} to={item.to} className="text-sm font-semibold uppercase tracking-wider text-slate-600 transition-colors hover:text-blue-600">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50"
              title={language === 'en' ? 'Chuyển sang tiếng Việt' : 'Switch to English'}
            >
              {language === 'en' ? <USAFlag /> : <VietnamFlag />}
              <span className="border-l border-slate-100 pl-2 pt-0.5 uppercase tracking-widest">
                {language === 'en' ? 'EN' : 'VI'}
              </span>
            </button>

            <div className="relative hidden xl:block">
              <input
                type="text"
                placeholder={t('searchDeals')}
                className="w-32 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all focus:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            {user ? (
              <>
                {showCreateDeal && (
                  <Link
                    to="/deals/new"
                    className="professional-btn hidden h-9 shrink-0 items-center justify-center whitespace-nowrap px-6 text-xs sm:flex"
                    id="btn-create-deal"
                  >
                    {t('listDeal')}
                  </Link>
                )}

                <div className="hidden h-6 w-px bg-slate-200 sm:block" />
                <Notifications />

                <Link to="/dashboard" className="hidden p-2 text-slate-400 transition-colors hover:text-blue-600 sm:block" title="Dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                </Link>

                {showAdmin && (
                  <Link to="/admin" className="hidden p-2 text-slate-400 transition-colors hover:text-blue-600 sm:block" title="Admin">
                    <ShieldCheck className="h-4 w-4" />
                  </Link>
                )}

                <Link to="/profile" className="hidden items-center gap-2 sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                    {user.photoURL ? <img src={user.photoURL} alt="User" className="h-full w-full object-cover" /> : <User className="h-4 w-4 text-slate-400" />}
                  </div>
                </Link>

                <button
                  onClick={() => auth.signOut()}
                  className="hidden p-2 text-slate-400 transition-colors hover:text-red-600 sm:block"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="professional-btn hidden h-9 shrink-0 items-center justify-center whitespace-nowrap px-6 text-xs sm:flex"
                id="btn-login"
              >
                {t('signIn')}
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen(value => !value)}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 lg:hidden"
              title="Menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-xl shadow-slate-900/5 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {[
              ...navItems,
              ...(user ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
              ...(user ? [{ to: '/profile', label: t('editProfile') }] : []),
              ...(showAdmin ? [{ to: '/admin', label: t('adminNav') }] : []),
              ...(showCreateDeal ? [{ to: '/deals/new', label: t('listDeal') }] : []),
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
              >
                {item.label}
              </Link>
            ))}

            {!user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogin();
                }}
                className="rounded-xl bg-blue-600 px-3 py-3 text-left text-sm font-bold text-white"
              >
                {t('signIn')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  auth.signOut();
                }}
                className="rounded-xl px-3 py-3 text-left text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
