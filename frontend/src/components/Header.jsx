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
    <header className="fixed w-full top-0 bg-white/95 backdrop-blur-sm border-b border-blue-100 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center h-16">
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2l8 3v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V5l8-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.5 10.5l1.5-1.5 1.5 1.5M14.5 13.5l-1.5 1.5-1.5-1.5" />
                <circle cx="8" cy="12" r="1" fill="currentColor" />
                <circle cx="12" cy="9" r="1" fill="currentColor" />
                <circle cx="16" cy="12" r="1" fill="currentColor" />
                <circle cx="12" cy="15" r="1" fill="currentColor" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M8 12h8M12 9v6" opacity="0.6" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Lok</span>
            <div className="hidden sm:flex items-center ml-4 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Secure
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-2 flex-1 justify-center">
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

          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            <button className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors focus-ring rounded-lg px-3 py-2">
              Sign In
            </button>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 text-sm font-semibold transition-all shadow-sm hover:shadow-md focus-ring transform hover:scale-105">
              Get Started Free
            </button>
          </div>

          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus-ring"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <a 
                  key={item.href}
                  href={item.href} 
                  className="text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-all duration-300 focus-ring"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <button className="text-left text-gray-700 hover:text-gray-900 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-300 focus-ring">
                Sign In
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold text-left mt-2 shadow-sm focus-ring">
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}