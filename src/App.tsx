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
import { motion, AnimatePresence } from 'motion/react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (!profile && window.location.pathname !== '/profile-setup') return <Navigate to="/profile-setup" />;

  return <>{children}</>;
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
                
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/deals/new" element={<ProtectedRoute><CreateDeal /></ProtectedRoute>} />
                <Route path="/marketing" element={<ProtectedRoute><MarketingCenter /></ProtectedRoute>} />
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
