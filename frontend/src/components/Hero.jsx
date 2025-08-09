import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Hero() {
  const [email, setEmail] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle email submission
    console.log('Email submitted:', email);
  };

  return (
    <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background with improved gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Announcement Badge */}
          <motion.div
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-blue-200/50 shadow-sm"
            variants={itemVariants}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
            <span>🚀 Now in Beta • Join the Waitlist</span>
          </motion.div>

          {/* Main Headline - Improved typography */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-gray-900 mb-8 leading-tight tracking-tight"
            variants={itemVariants}
          >
            The Last{' '}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                Password Manager
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full opacity-30"></div>
            </span>{' '}
            You'll Ever Need
          </motion.h1>

          {/* Subtitle - Better spacing and typography */}
          <motion.p
            className="text-xl sm:text-2xl lg:text-3xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed font-medium"
            variants={itemVariants}
          >
            Lok uses advanced AI to automatically update compromised passwords,
            monitor security breaches, and keep you protected—
            <span className="text-blue-600 font-semibold">without you lifting a finger.</span>
          </motion.p>

          {/* Improved Email Signup Form */}
          <motion.form
            className="max-w-lg mx-auto mb-16"
            variants={itemVariants}
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-2xl shadow-xl border border-gray-200/50">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-500 text-lg"
                required
              />
              <motion.button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started →
              </motion.button>
            </div>
            <p className="text-sm text-gray-500 mt-4 font-medium">
              🔒 Join 12,000+ professionals who trust Lok with their digital security
            </p>
          </motion.form>

          {/* Enhanced Trust Indicators */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            {[
              { icon: '🛡️', text: '256-bit Encryption', color: 'from-green-500 to-emerald-500' },
              { icon: '🔐', text: 'Zero-Knowledge', color: 'from-blue-500 to-cyan-500' },
              { icon: '✅', text: 'SOC 2 Compliant', color: 'from-purple-500 to-violet-500' }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-300">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white text-xl mb-3 shadow-lg`}>
                  {item.icon}
                </div>
                <span className="text-sm font-semibold text-gray-700">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            variants={itemVariants}
          >
            {[
              { number: '99.9%', label: 'Uptime Guarantee' },
              { number: '24/7', label: 'Security Monitoring' },
              { number: '<100ms', label: 'Response Time' },
              { number: '12K+', label: 'Beta Users' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}