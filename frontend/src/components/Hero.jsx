import { useState, useEffect } from 'react';

export default function Hero() {
  const [email, setEmail] = useState('');
  const [displayText, setDisplayText] = useState('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email:', email);
  };

  return (
    <section className="pt-32 pb-20 px-6 bg-transparent">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-blue-300 rounded-full text-sm font-medium mb-8 animate-scale-in">
          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
Auto-Updates Weak Passwords Across All Sites
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-slide-up">
          {displayText}
          <span className="animate-pulse">|</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{animationDelay: '2s', animationFillMode: 'both'}}>
          The first password manager that automatically detects and updates weak, reused passwords 
          across all your accounts. Set it once, secure forever.
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-16 animate-slide-up" style={{animationDelay: '2.5s', animationFillMode: 'both'}}>
          <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/10 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border-0 rounded-lg focus:ring-0 focus:outline-none text-white placeholder-gray-400 bg-transparent"
              required
            />
            <button
              type="submit"
              className="relative bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-xl hover:from-cyan-400 hover:to-blue-400 font-bold transition-all shadow-lg hover:shadow-cyan-500/25 hover:scale-105 whitespace-nowrap overflow-hidden group"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Get Started</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "256-bit Encryption", desc: "Military-grade security", color: "green" },
            { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", title: "Zero Knowledge", desc: "We never see your data", color: "blue" },
            { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", title: "Auto Sync", desc: "All devices, instantly", color: "purple" }
          ].map((item, index) => (
            <div key={index} className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 hover:bg-white/15 hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-scale-in group" style={{animationDelay: `${3 + index * 0.2}s`, animationFillMode: 'both'}}>
              <div className={`w-12 h-12 bg-${item.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform duration-300`}>
                <svg className={`w-5 h-5 text-${item.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-base text-gray-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}