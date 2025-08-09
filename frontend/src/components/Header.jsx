import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'Waitlist', href: '#waitlist' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <motion.header
      className="relative w-full bg-slate-900/80 backdrop-blur-xl border-b border-cyan-500/30 shadow-2xl"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Futuristic Header Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-purple-900/30 to-slate-900/50"></div>
      <div className="scan-line"></div>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Futuristic Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center neon-border">
                <span className="text-white font-black text-xl">L</span>
              </div>
              <div className="absolute inset-0 bg-cyan-400/20 rounded-lg blur animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black neon-text tracking-tight">LOK</span>
              <span className="text-xs text-cyan-300/70 -mt-1 tracking-wider">QUANTUM SECURITY</span>
            </div>
          </motion.div>

          {/* Futuristic Navigation */}
          <nav className="flex items-center space-x-8 lg:flex md:hidden sm:hidden">
            {navigation.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="relative text-cyan-300 hover:text-cyan-100 font-semibold text-sm tracking-wider transition-all duration-300 group"
                whileHover={{ scale: 1.1 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <span className="relative z-10">{item.name}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300 shadow-sm shadow-cyan-400/50"></span>
                <span className="absolute inset-0 bg-cyan-400/10 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-2"></span>
              </motion.a>
            ))}
          </nav>

          {/* Futuristic CTA */}
          <div className="flex items-center space-x-6 md:hidden sm:hidden">
            <motion.a
              href="#signin"
              className="text-cyan-300 hover:text-cyan-100 font-semibold text-sm tracking-wider transition-all duration-300 relative group"
              whileHover={{ scale: 1.05 }}
            >
              <span className="relative z-10">SIGN IN</span>
              <span className="absolute inset-0 bg-cyan-400/10 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-2"></span>
            </motion.a>
            <motion.a
              href="#waitlist"
              className="cyber-button text-sm tracking-wider"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              INITIALIZE
            </motion.a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hidden md:block sm:block px-4 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            className="hidden md:block sm:block py-4 border-t border-gray-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <a
                  href="#signin"
                  className="block text-gray-600 hover:text-gray-900 font-medium mb-3 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </a>
                <a
                  href="#waitlist"
                  className="btn-primary text-center w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
