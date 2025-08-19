import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from './services/auth';
import { ToastProvider } from './contexts/ToastContext';
import { Header, Hero, Footer } from './components/layout';
import { Login } from './components/auth';
import { Dashboard } from './components/dashboard';
import { SecurityPage } from './components/security';
import { ScrollToTop } from './components/ui';
import { About, Features, Pricing, FAQ, PrivacyPolicy, TermsOfService } from './pages';
import ErrorBoundary from './components/ui/ErrorBoundary';

const LandingPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (auth.isAuthenticated()) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-transparent to-indigo-100/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" style={{animation: 'float 12s ease-in-out infinite'}}></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200/15 rounded-full blur-3xl" style={{animation: 'float 15s ease-in-out infinite reverse'}}></div>
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
          <Features />
          <div className="section-divider"></div>
          <Pricing />
          <div className="section-divider"></div>
          <About />
          <div className="section-divider"></div>
          <FAQ />
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
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/vault" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/security" element={<SecurityPage />} />
          </Routes>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}