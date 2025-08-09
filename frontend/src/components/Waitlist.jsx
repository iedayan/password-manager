import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from './Toast';

// Mock Supabase functionality for demo
const mockSupabase = {
  from: () => ({
    insert: async (data) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate occasional errors
      if (Math.random() < 0.1) {
        return { error: { message: 'Network error occurred' } };
      }
      
      return { data, error: null };
    }
  })
};

export default function Waitlist() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await mockSupabase
        .from('waitlist')
        .insert([{
          email: formData.email,
          name: formData.name || null,
          role: formData.role || null,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        addToast(error.message || 'Failed to join waitlist', 'error');
      } else {
        addToast('🎉 Welcome to the waitlist! We\'ll notify you soon.', 'success');
        setFormData({ email: '', name: '', role: '' });
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 5000);
      }
    } catch (err) {
      addToast('Something went wrong. Please try again.', 'error');
    }

    setIsLoading(false);
  };

  const roles = [
    'Developer',
    'Designer', 
    'Product Manager',
    'Security Engineer',
    'Student',
    'Other'
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section id="waitlist" className="py-24 lg:py-32 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-40 h-40 bg-blue-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-purple-200/30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Header */}
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200/50 rounded-full px-6 py-3 mb-8">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <span className="text-sm font-bold text-green-700 tracking-wide">🎯 Limited Beta Access</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Join the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                Future
              </span>{' '}
              of Password Security
            </h2>

            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 font-medium leading-relaxed">
              Be among the first to experience Lok. Get early access, exclusive updates,
              and help shape the future of password management.
            </p>
          </motion.div>

          {/* Waitlist Form */}
          <motion.div className="max-w-2xl mx-auto mb-16" variants={itemVariants}>
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-gray-200/50 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    disabled={isLoading || isSuccess}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-300 disabled:opacity-50"
                  />
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      disabled={isLoading || isSuccess}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-300 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="relative">
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        disabled={isLoading || isSuccess}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-300 disabled:opacity-50 appearance-none cursor-pointer"
                      >
                        <option value="">Select your role</option>
                        {roles.map(role => (
                          <option key={role} value={role.toLowerCase()}>{role}</option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className={`w-full py-6 rounded-2xl font-bold text-xl transition-all duration-300 transform ${
                    isSuccess
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : isLoading
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Joining Waitlist...</span>
                    </div>
                  ) : isSuccess ? (
                    <div className="flex items-center justify-center space-x-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Welcome to the Waitlist!</span>
                    </div>
                  ) : (
                    <span>Join the Waitlist →</span>
                  )}
                </button>
              </form>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 text-center">
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mb-4">
                {[
                  { icon: '🚫', text: 'No spam, ever' },
                  { icon: '⚡', text: 'Early access guaranteed' },
                  { icon: '🔄', text: 'Unsubscribe anytime' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-sm font-medium">
                Join 12,000+ professionals already on the waitlist
              </p>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {[
              {
                icon: '🚀',
                title: 'Early Access',
                description: 'Be the first to try new features and provide valuable feedback',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '📧',
                title: 'Exclusive Updates',
                description: 'Get behind-the-scenes insights and development updates',
                color: 'from-purple-500 to-violet-500'
              },
              {
                icon: '💰',
                title: 'Special Pricing',
                description: 'Lock in early-bird pricing when we officially launch',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((benefit, index) => (
              <motion.div 
                key={index} 
                className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                variants={itemVariants}
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${benefit.color} flex items-center justify-center text-2xl mb-6 shadow-lg`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}