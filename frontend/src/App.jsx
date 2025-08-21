import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { auth } from './services/auth';
import { ToastProvider } from './contexts/ToastContext';
import { Header, Hero, Footer } from './components/layout';
import { Login } from './components/auth';
// Lazy load heavy dashboard components
const Dashboard = lazy(() => import('./components/dashboard').then(module => ({ default: module.Dashboard || module.default })));
const SecurityPage = lazy(() => import('./components/security').then(module => ({ default: module.SecurityPage || module.default })));
import { ScrollToTop } from './components/ui';
// Lazy load non-critical components
const Features = lazy(() => import('./pages/Features').then(module => ({ default: module.default })));
const Pricing = lazy(() => import('./pages/Pricing').then(module => ({ default: module.default })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.default })));
const FAQ = lazy(() => import('./pages/FAQ').then(module => ({ default: module.default })));

import { PrivacyPolicy, TermsOfService, Technical } from './pages';
import AboutPage from './pages/AboutPage';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { AccessibilityProvider } from './components/ui/AccessibilityProvider';

const LandingPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [handleScroll]);

  const handleGetStarted = () => {
    if (auth.isAuthenticated()) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 relative overflow-hidden" style={{contain: 'layout style paint'}}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-transparent to-indigo-100/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl will-change-transform" style={{animation: 'float 12s ease-in-out infinite', transform: 'translate3d(0,0,0)'}}></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200/15 rounded-full blur-3xl will-change-transform" style={{animation: 'float 15s ease-in-out infinite reverse', transform: 'translate3d(0,0,0)'}}></div>
      <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-50">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>
      
      <div className="relative z-10 animate-fade-in">
        <Header />
        <main>
          <Hero />
          <div className="section-divider"></div>
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <Features />
          </Suspense>
          <div className="section-divider"></div>
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <Pricing />
          </Suspense>
          <div className="section-divider"></div>
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <About />
          </Suspense>
          <div className="section-divider"></div>
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <FAQ />
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  return auth.isAuthenticated() ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <ToastProvider>
          <Router>
            <ScrollToTop />
            <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/vault" element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/technical" element={<Technical />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/security" element={
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <SecurityPage />
          </Suspense>
        } />
            </Routes>
          </Router>
        </ToastProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}