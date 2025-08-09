import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Personal",
      description: "Perfect for individuals",
      monthlyPrice: 3,
      annualPrice: 30,
      savings: "Save $6",
      icon: "👤",
      features: [
        "Unlimited passwords",
        "Secure password sharing", 
        "Dark web monitoring",
        "2FA authentication",
        "Mobile & desktop apps",
        "24/7 customer support"
      ],
      popular: false,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Family",
      description: "Great for families up to 6 members",
      monthlyPrice: 5,
      annualPrice: 50,
      savings: "Save $10",
      icon: "👨‍👩‍👧‍👦",
      features: [
        "Everything in Personal",
        "Up to 6 family members",
        "Family dashboard",
        "Shared family vault", 
        "Emergency access",
        "Priority support"
      ],
      popular: true,
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Business",
      description: "For teams and organizations",
      monthlyPrice: 8,
      annualPrice: 80,
      savings: "Save $16",
      icon: "🏢",
      features: [
        "Everything in Family",
        "Unlimited team members",
        "Admin dashboard",
        "Advanced reporting",
        "SSO integration",
        "Dedicated account manager"
      ],
      popular: false,
      color: "from-green-500 to-emerald-500"
    }
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
    <section id="pricing" className="py-24 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200/50 rounded-full px-6 py-3 mb-8">
            <span className="text-sm font-bold text-green-700 tracking-wide">💰 Simple Pricing</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Choose Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
              Security Plan
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 font-medium">
            All plans include our core security features. Upgrade or downgrade anytime.
          </p>

          {/* Enhanced Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 bg-white/80 backdrop-blur-sm p-2 rounded-2xl border border-gray-200/50 w-fit mx-auto shadow-lg">
            <span className={`text-lg font-semibold px-4 py-2 ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isAnnual ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg ${
                  isAnnual ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg font-semibold px-4 py-2 ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
              Save 17%
            </span>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative bg-white rounded-3xl shadow-lg border-2 p-8 lg:p-10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                plan.popular 
                  ? 'border-purple-500 shadow-purple-100 shadow-2xl scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              variants={itemVariants}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    🔥 Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                {/* Plan Icon */}
                <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-r ${plan.color} flex items-center justify-center text-3xl mb-6 shadow-xl`}>
                  {plan.icon}
                </div>

                <h3 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-8 text-lg">{plan.description}</p>
                
                <div className="mb-8">
                  <span className="text-5xl lg:text-6xl font-black text-gray-900">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-600 ml-2 text-xl">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                  {isAnnual && (
                    <div className="mt-2">
                      <span className="text-green-600 font-semibold text-sm bg-green-100 px-3 py-1 rounded-full">
                        {plan.savings}
                      </span>
                    </div>
                  )}
                </div>

                <motion.button
                  className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900 hover:shadow-lg'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </div>

              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-600 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Trust Section */}
        <motion.div
          className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-12 border border-gray-200/30"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Risk-Free 30-Day Money-Back Guarantee
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Try Lok completely risk-free. If you're not satisfied, get a full refund.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🚫', text: 'No setup fees', color: 'text-green-600' },
              { icon: '🔄', text: 'Cancel anytime', color: 'text-blue-600' },
              { icon: '🛟', text: '24/7 support', color: 'text-purple-600' },
              { icon: '⚡', text: '99.9% uptime SLA', color: 'text-orange-600' }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <span className={`text-sm font-bold ${item.color}`}>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}