import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateDeal from './pages/CreateDeal';
import DealDetail from './pages/DealDetail';
import ProfileSetup from './pages/ProfileSetup';
import Profile from './pages/Profile';
import MarketingCenter from './pages/MarketingCenter';
import Admin from './pages/Admin';
import Resources from './pages/Resources';
import Network from './pages/Network';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from './types';
import { hasRole, routeRoles } from './lib/rbac';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const isProfileSetup = window.location.pathname === '/profile-setup';

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (!profile && !isProfileSetup) return <Navigate to="/profile-setup" />;
  if (profile?.userType && isProfileSetup) return <Navigate to="/" />;

  return <>{children}</>;
}

function RoleRoute({ children, roles }: { children: React.ReactNode; roles: UserRole[] }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (!profile) return <Navigate to="/profile-setup" />;
  if (!hasRole(profile, roles)) return <AccessDenied />;

  return <>{children}</>;
}

function AccessDenied() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center text-center">
      <div className="mb-4 rounded-full border border-amber-100 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700">
        Quyền truy cập bị giới hạn
      </div>
      <h1 className="text-2xl font-bold text-slate-950">Tài khoản của bạn chưa có quyền vào khu vực này.</h1>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
        Vai trò buyer, seller, advisor và admin được tách riêng để bảo vệ dữ liệu giao dịch.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
          <Navbar />
          <AnimatePresence mode="wait">
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full" id="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/deals/:id" element={<DealDetail />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/network" element={<Network />} />
                
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/deals/new" element={<RoleRoute roles={routeRoles('createDeal')}><CreateDeal /></RoleRoute>} />
                <Route path="/marketing" element={<RoleRoute roles={routeRoles('marketing')}><MarketingCenter /></RoleRoute>} />
                <Route path="/admin" element={<RoleRoute roles={routeRoles('admin')}><Admin /></RoleRoute>} />
              </Routes>
            </main>
          </AnimatePresence>
          
          <Footer />
        </div>
      </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
