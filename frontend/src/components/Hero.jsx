import { useState, useEffect } from 'react';

export default function Hero() {
  const [email, setEmail] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fullText = 'Never Worry About Weak Passwords Again';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);



  return (
    <section id="hero" className="pt-32 pb-20 md:pb-24 lg:pb-32 px-6 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-5xl mx-auto">
        {/* Trust Indicators */}
        <div className="flex justify-center items-center space-x-8 mb-12 animate-fade-in">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                <path d="M6.5 1L3 4.5 1.5 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold">SOC 2 Certified</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                <path d="M4 0L7 2v3c0 2.5-1.5 4-3 4S1 7.5 1 5V2L4 0z"/>
              </svg>
            </div>
            <span className="font-semibold">256-bit Encryption</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3"/>
              </svg>
            </div>
            <span className="font-semibold">Zero Knowledge</span>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-200 text-blue-800 rounded-full text-sm font-semibold mb-8 animate-scale-in">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
            Auto-Updates Weak Passwords Across All Sites
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-slide-up">
            {displayText}
            <span className="animate-pulse text-blue-600">|</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{animationDelay: '2s', animationFillMode: 'both'}}>
            The first password manager that automatically detects and updates weak, reused passwords 
            across all your accounts. Enterprise-grade security with zero-knowledge encryption.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-slide-up" style={{animationDelay: '2.5s', animationFillMode: 'both'}}>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <span>Try Demo</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <span className="text-gray-400 hidden sm:block">or</span>
          </div>

          <form id="email-signup" name="waitlist" method="POST" action="/success.html" data-netlify="true" className="max-w-lg mx-auto mb-16 animate-slide-up" style={{animationDelay: '2.8s', animationFillMode: 'both'}}>
            <input type="hidden" name="form-name" value="waitlist" />
            <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 border-0 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none text-gray-900 placeholder-gray-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                required
                aria-label="Email address"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-8 py-3 rounded-lg hover:from-blue-800 hover:to-indigo-800 font-semibold transition-all shadow-md hover:shadow-lg whitespace-nowrap focus-ring transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={!email || isLoading}
              >
                <span className="flex items-center space-x-2">
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <span>Join the Waitlist</span>
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </div>
            {message ? (
              <p className={`text-sm mt-3 font-medium ${message.includes('Successfully') || message.includes('already') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            ) : (
              <p className="text-sm text-gray-600 mt-3">Be first to get early access • No spam • Unsubscribe anytime</p>
            )}
          </form>

          {/* Download Options */}
          <div className="max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '3s', animationFillMode: 'both'}}>
            <h3 className="text-center mb-6 font-black text-2xl md:text-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent tracking-wide">Coming Soon</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#" 
                className="flex items-center space-x-3 bg-gradient-to-r from-blue-100 to-blue-200 border-2 border-blue-300 hover:border-blue-500 hover:from-blue-200 hover:to-blue-300 px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group focus-ring w-56 transform hover:scale-105"
              >
                <svg className="w-5 h-5 text-blue-600 group-hover:text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <div className="text-left">
                  <div className="text-sm font-semibold text-blue-900 group-hover:text-blue-800">Browser Extension</div>
                  <div className="text-xs text-blue-600">Chrome, Firefox, Safari</div>
                </div>
              </a>
              
              <a 
                href="#" 
                className="flex items-center space-x-3 bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-300 hover:border-green-500 hover:from-green-200 hover:to-green-300 px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group focus-ring w-56 transform hover:scale-105"
              >
                <svg className="w-5 h-5 text-green-600 group-hover:text-green-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                </svg>
                <div className="text-left">
                  <div className="text-sm font-semibold text-green-900 group-hover:text-green-800">Desktop App</div>
                  <div className="text-xs text-green-600">Windows, Mac, Linux</div>
                </div>
              </a>
              
              <a 
                href="#" 
                className="flex items-center space-x-3 bg-gradient-to-r from-purple-100 to-purple-200 border-2 border-purple-300 hover:border-purple-500 hover:from-purple-200 hover:to-purple-300 px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group focus-ring w-56 transform hover:scale-105"
              >
                <svg className="w-5 h-5 text-purple-600 group-hover:text-purple-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 19H7V5h10m0-2H7c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h10c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2z"/>
                </svg>
                <div className="text-left">
                  <div className="text-sm font-semibold text-purple-900 group-hover:text-purple-800">Mobile App</div>
                  <div className="text-xs text-purple-600">iOS & Android</div>
                </div>
              </a>

            </div>
          </div>


        </div>
      </div>
    </section>
  );
}