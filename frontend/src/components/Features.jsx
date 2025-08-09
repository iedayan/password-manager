import { motion } from 'framer-motion';

export default function Features() {
  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Security',
      description: 'Advanced machine learning algorithms continuously monitor and protect your digital identity around the clock.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: '🔒',
      title: 'Zero-Knowledge Architecture',
      description: 'Your data is encrypted locally before transmission. We never see your passwords, even if we wanted to.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: '🔄',
      title: 'Universal Sync',
      description: 'Seamlessly access your passwords across all devices with military-grade end-to-end encryption.',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: '👆',
      title: 'Biometric Authentication',
      description: 'Unlock instantly with Face ID, Touch ID, or fingerprint for secure, passwordless access.',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
    {
      icon: '⚡',
      title: 'Instant Autofill',
      description: 'Smart context-aware autofill works perfectly across websites, mobile apps, and forms.',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: '📱',
      title: 'Mobile-First Design',
      description: 'Native iOS and Android apps with complete offline functionality and real-time sync.',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50'
    }
  ];

  const stats = [
    { number: '99.9%', label: 'Uptime SLA', icon: '⚡' },
    { number: '256-bit', label: 'AES Encryption', icon: '🛡️' },
    { number: '<100ms', label: 'Response Time', icon: '🚀' },
    { number: '24/7', label: 'Threat Monitoring', icon: '👁️' }
  ];

  const certifications = [
    { name: 'SOC 2 Type II', icon: '✅' },
    { name: 'ISO 27001', icon: '🏆' },
    { name: 'GDPR Compliant', icon: '🌍' }
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
    <section id="features" className="py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200/30 rounded-full px-6 py-3 mb-8">
            <span className="text-sm font-bold text-blue-700 tracking-wide">🚀 Enterprise-Grade Features</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Everything you need for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
              complete security
            </span>
          </h2>

          <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
            Built with the latest security standards and powered by AI to keep you protected 24/7.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`group relative ${feature.bgColor} rounded-3xl p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-200/50`}
              variants={itemVariants}
            >
              {/* Background Gradient on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>

              <div className="relative">
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg mb-6 text-3xl group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed text-lg">
                  {feature.description}
                </p>

                {/* Decorative gradient bar */}
                <div className={`w-full h-1 rounded-full bg-gradient-to-r ${feature.color} mt-6 group-hover:scale-105 transition-all duration-300 shadow-sm`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-12 mb-16 border border-gray-200/30"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by professionals worldwide
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of users who rely on Lok for their digital security
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-gray-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Certifications */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <p className="text-lg text-gray-600 mb-8 font-medium">Certified and compliant with industry standards</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl px-8 py-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{cert.icon}</span>
                  <span className="text-sm font-bold text-gray-700">{cert.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}