import { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import NotificationContainer from './components/NotificationContainer';

// Lazy load with priority
const Header = lazy(() => import("./components/Header"));
const Hero = lazy(() => import("./components/Hero"));
const Features = lazy(() => import("./components/Features" /* webpackPrefetch: true */));
const Waitlist = lazy(() => import("./components/Waitlist" /* webpackPrefetch: true */));
const Footer = lazy(() => import("./components/Footer"));

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 w-full overflow-x-hidden relative font-sans text-white leading-normal">
      <ErrorBoundary>
        {/* Header loads first */}
        <Suspense fallback={<LoadingSpinner />}>
          <Header />
        </Suspense>

        {/* Main content */}
        <main className="flex-grow">
          <Suspense fallback={<LoadingSpinner className="min-h-[60vh]" />}>
            <Hero />
            <Features />
            <Waitlist />
          </Suspense>
        </main>

        {/* Footer loads last */}
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </ErrorBoundary>

      <NotificationContainer className="fixed bottom-4 right-4 z-50" />
    </div>
  );
}