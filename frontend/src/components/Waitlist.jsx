import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

export default function Waitlist() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      const { error } = await supabase
        .from('waitlist')
        .insert([{
          email: formData.email,
          name: formData.name || null,
          role: formData.role || null,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        toast.error(error.message || 'Failed to join waitlist');
      } else {
        toast.success('🎉 Welcome to the waitlist! We\'ll notify you soon.');
        setFormData({ email: '', name: '', role: '' });
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 5000);
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
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

  return (
    <section id="waitlist" className="py-32 bg-transparent relative overflow-hidden md:py-24 sm:py-20">

      <div className="relative max-w-5xl mx-auto px-8 md:px-6 sm:px-4">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-3 glass border border-blue-200/30 rounded-full px-6 py-3 mb-10">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
            <span className="text-sm font-bold text-blue-700 tracking-wide">Limited Beta Access</span>
          </div>

          <h2 className="text-6xl font-black text-gray-900 mb-8 leading-tight text-balance md:text-5xl sm:text-4xl">
            Join the{' '}
            <span className="gradient-text">Future</span>{' '}
            of Password Security
          </h2>

          <p className="text-2xl text-gray-600 max-w-4xl mx-auto mb-16 text-balance font-medium leading-relaxed">
            Be among the first to experience Lok. Get early access, exclusive updates,
            and help shape the future of password management.
          </p>
        </div>

        {/* Waitlist Form */}
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-3xl p-10 border border-gray-200/30 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Field */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading || isSuccess}
                  className="input-field px-6 py-5 text-lg rounded-2xl"
                />
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name (optional)"
                    disabled={isLoading || isSuccess}
                    className="input-field px-6 py-4 text-lg rounded-2xl"
                  />
                </div>

                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={isLoading || isSuccess}
                    className="input-field px-6 py-4 text-lg rounded-2xl appearance-none cursor-pointer"
                  >
                    <option value="">Select role (optional)</option>
                    {roles.map(role => (
                      <option key={role} value={role.toLowerCase()}>{role}</option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <span className="text-gray-400">▼</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full py-6 rounded-2xl font-bold text-xl transition-all duration-300 ${
                  isSuccess
                    ? 'bg-green-500 text-white shadow-glow'
                    : isLoading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'btn-primary text-xl py-6 hover:shadow-glow-lg'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Joining Waitlist...</span>
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center justify-center space-x-4">
                    <span>✓ Welcome to the Waitlist!</span>
                  </div>
                ) : (
                  <span>Join the Waitlist →</span>
                )}
              </button>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No spam, ever</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Early access guaranteed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Unsubscribe anytime</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Join 12,000+ professionals already on the waitlist
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Early Access',
              description: 'Be the first to try new features and provide feedback'
            },
            {
              title: 'Exclusive Updates',
              description: 'Get behind-the-scenes insights and development updates'
            },
            {
              title: 'Special Pricing',
              description: 'Lock in early-bird pricing when we launch'
            }
          ].map((benefit, index) => (
            <div key={index} className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
