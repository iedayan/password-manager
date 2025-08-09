import { useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import About from './components/About';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (window.location.hash) {
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        window.history.replaceState(null, null, window.location.pathname);
        window.location.reload();
      }, 300);
    }

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-transparent to-indigo-100/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" style={{animation: 'float 12s ease-in-out infinite'}}></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200/15 rounded-full blur-3xl" style={{animation: 'float 15s ease-in-out infinite reverse'}}></div>
      {/* Scroll Progress */}
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
        <Features />
        <Pricing />
        <About />
        <FAQ />
      </main>
      <Footer />
      </div>
    </div>
  );
}