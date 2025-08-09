import { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 bg-black/20 backdrop-blur-xl border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center h-16">
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">Lok</span>
          </div>

          <nav className="hidden md:flex items-center space-x-2 flex-1 justify-center">
            <a href="#features" className="relative px-4 py-2 text-gray-300 hover:text-blue-400 text-sm font-semibold transition-all duration-300 rounded-xl hover:bg-white/10 group">
              <span className="relative z-10">Features</span>
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-400 rounded-full group-hover:w-6 transition-all duration-300"></span>
            </a>
            <a href="#pricing" className="relative px-4 py-2 text-gray-300 hover:text-blue-400 text-sm font-semibold transition-all duration-300 rounded-xl hover:bg-white/10 group">
              <span className="relative z-10">Pricing</span>
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-400 rounded-full group-hover:w-6 transition-all duration-300"></span>
            </a>
            <a href="#about" className="relative px-4 py-2 text-gray-300 hover:text-blue-400 text-sm font-semibold transition-all duration-300 rounded-xl hover:bg-white/10 group">
              <span className="relative z-10">About</span>
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-400 rounded-full group-hover:w-6 transition-all duration-300"></span>
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            <button className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Sign In</button>
            <button className="relative bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-cyan-400 hover:to-blue-400 text-sm font-bold transition-all shadow-lg hover:shadow-cyan-500/25 hover:scale-105 overflow-hidden group">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          <button 
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-2">
              <a href="#features" className="text-gray-300 hover:text-blue-400 font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-blue-400 font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300">Pricing</a>
              <a href="#about" className="text-gray-300 hover:text-blue-400 font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300">About</a>
              <button className="text-left text-gray-300 hover:text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300">Sign In</button>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-cyan-400 hover:to-blue-400 font-bold text-left mt-2 shadow-lg hover:shadow-cyan-500/25 transition-all">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}