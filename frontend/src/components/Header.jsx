import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthButtons = () => {
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    if (token && userId) {
      setUser({ id: userId });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setUser(null);
    setShowUserMenu(false);
    navigate('/');
  };

  const isOnDashboard = location.pathname.includes('/dashboard') || location.pathname.includes('/vault') || location.pathname.includes('/app');

  if (user) {
    return (
      <>
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {!isOnDashboard && (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              My Vault
            </button>
          )}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              <span className="text-sm font-bold text-white">U</span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">Account</p>
                  <p className="text-xs text-gray-500">Manage your vault</p>
                </div>
                <button
                  onClick={() => { navigate('/dashboard'); setShowUserMenu(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </button>
                <button
                  onClick={() => { navigate('/'); setShowUserMenu(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-center gap-3 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </button>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm text-red-600 flex items-center gap-3 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          {!isOnDashboard && (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center"
          >
            <span className="text-xs font-bold text-white">U</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-3">
        <button
          onClick={() => navigate('/login')}
          className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all font-medium"
        >
          Sign In
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          Start Free Trial
        </button>
      </div>
      
      {/* Mobile */}
      <div className="md:hidden">
        <button
          onClick={() => navigate('/login')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          Sign In
        </button>
      </div>
    </>
  );
};

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const sectionsRef = useRef({});

  useEffect(() => {
    // Cache DOM elements
    const sections = ['hero', 'features', 'pricing', 'about', 'faq'];
    sections.forEach(section => {
      sectionsRef.current[section] = document.getElementById(section);
    });

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = sectionsRef.current[section];
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
          <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
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
          </a>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <a 
                key={item.href}
                href={item.href} 
                className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-300 rounded-xl group ${
                  activeSection === item.href.slice(1) 
                    ? 'text-blue-600 bg-blue-50 shadow-sm' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className="relative z-10">{item.label}</span>
                <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 rounded-full transition-all duration-300 ${
                  activeSection === item.href.slice(1) ? 'w-6' : 'w-0 group-hover:w-6'
                }`}></span>
              </a>
            ))}
          </nav>

          {/* Auth Buttons */}
          <AuthButtons />

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-all focus-ring"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 text-gray-700 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 bg-white/95 backdrop-blur-md animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <a 
                  key={item.href}
                  href={item.href} 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center gap-3"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="w-2 h-2 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {item.label}
                </a>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-gray-100 mt-4 space-y-3">
                <AuthButtons />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}