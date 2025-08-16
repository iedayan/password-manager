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
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center relative overflow-hidden group shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="w-5 h-5 text-white relative z-10" fill="none" viewBox="0 0 24 24">
                <!-- Shield -->
                <path d="M12 2C12 2 8 1 5 1C2 1 0 2 0 2V12C0 17 3 20 6 22C9 24 12 22 15 22C18 20 21 17 21 12V2S19 1 16 1C13 1 12 2 12 2Z" 
                      fill="white" opacity="0.95"/>
                <!-- Lock -->
                <rect x="8" y="13" width="6" height="4" rx="0.5" fill="#06b6d4" opacity="0.9"/>
                <path d="M9 13V11C9 9.9 9.9 9 11 9H13C14.1 9 15 9.9 15 11V13" 
                      stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.9"/>
                <circle cx="11" cy="15" r="0.8" fill="white"/>
                <!-- Security dots -->
                <circle cx="6" cy="8" r="0.4" fill="#06b6d4" opacity="0.6"/>
                <circle cx="18" cy="8" r="0.4" fill="#06b6d4" opacity="0.6"/>
                <circle cx="4" cy="14" r="0.4" fill="#06b6d4" opacity="0.6"/>
                <circle cx="20" cy="14" r="0.4" fill="#06b6d4" opacity="0.6"/>
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