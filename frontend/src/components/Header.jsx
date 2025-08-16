import { useState, useEffect } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'features', 'pricing', 'about', 'faq'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#about', label: 'About' },
    { href: '#faq', label: 'FAQ' }
  ];

  return (
    <header className="fixed w-full top-0 bg-white/95 backdrop-blur-md border-b border-blue-100 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group">
              <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 32 32">
                <path d="M16 3l10 4v8c0 7-4 14-10 16-6-2-10-9-10-16V7l10-4z" fill="white" opacity="0.95"/>
                <rect x="12" y="16" width="8" height="7" rx="1.5" fill="#0891b2"/>
                <path d="M13 16V12c0-1.7 1.3-3 3-3s3 1.3 3 3v4" stroke="#0891b2" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
                <circle cx="16" cy="19.5" r="1.8" fill="white"/>
                <rect x="12.5" y="16.5" width="7" height="1" rx="0.5" fill="rgba(255,255,255,0.5)"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Lok</span>
            <div className="hidden sm:flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Secure
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <a 
                key={item.href}
                href={item.href} 
                className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg group focus-ring ${
                  activeSection === item.href.slice(1) 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 rounded-full transition-all duration-300 ${
                  activeSection === item.href.slice(1) ? 'w-6' : 'w-0 group-hover:w-6'
                }`}></span>
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center">
            <button 
              onClick={() => {
                const heroSection = document.getElementById('hero');
                if (heroSection) {
                  heroSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Focus on email input after scroll
                  setTimeout(() => {
                    const emailInput = document.querySelector('input[type="email"]');
                    if (emailInput) emailInput.focus();
                  }, 800);
                }
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 text-sm font-bold transition-all shadow-md hover:shadow-lg focus-ring transform hover:scale-105 flex items-center space-x-2">
              <span>Join Waitlist</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors focus-ring"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 bg-white/95 backdrop-blur-md">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <a 
                  key={item.href}
                  href={item.href} 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-semibold py-3 px-4 rounded-lg transition-all duration-300 focus-ring"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-100 mt-2">
                <button 
                  onClick={() => {
                    const heroSection = document.getElementById('hero');
                    if (heroSection) {
                      heroSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      setIsOpen(false);
                      // Focus on email input after scroll
                      setTimeout(() => {
                        const emailInput = document.querySelector('input[type="email"]');
                        if (emailInput) emailInput.focus();
                      }, 800);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold shadow-md focus-ring flex items-center justify-center space-x-2">
                  <span>Join Waitlist</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}