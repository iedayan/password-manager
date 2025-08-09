import { Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Security from './components/Security';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Waitlist from './components/Waitlist';
import CTA from './components/CTA';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import NotificationContainer from './components/NotificationContainer';
import { ToastProvider } from './components/Toast';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <div className="min-h-screen bg-white">
            <Header />

            <main>
              <Hero />
              <Features />
              <Security />
              <Pricing />
              <Testimonials />
              <FAQ />
              <Waitlist />
              <CTA />
            </main>

            <Footer />
            <NotificationContainer />
          </div>
        </Suspense>
      </ToastProvider>
    </ErrorBoundary>
  );
}