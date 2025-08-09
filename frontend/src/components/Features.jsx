// No icons needed

export default function Features() {
  const features = [
    {
      title: 'AI-Powered Security',
      description: 'Advanced machine learning algorithms continuously monitor and protect your digital identity.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Zero-Knowledge Architecture',
      description: 'Your data is encrypted locally. We never see your passwords, even if we wanted to.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Universal Sync',
      description: 'Seamlessly access your passwords across all devices with end-to-end encryption.',
      color: 'from-purple-500 to-violet-500'
    },
    {
      title: 'Biometric Authentication',
      description: 'Unlock with Face ID, Touch ID, or fingerprint for instant, secure access.',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Instant Autofill',
      description: 'Smart context-aware autofill works across websites, apps, and forms.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Mobile-First Design',
      description: 'Native iOS and Android apps with full offline functionality and sync.',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const stats = [
    { number: '99.9%', label: 'Uptime' },
    { number: '256-bit', label: 'Encryption' },
    { number: '<100ms', label: 'Response Time' },
    { number: '24/7', label: 'Monitoring' }
  ];

  const certifications = [
    { name: 'SOC 2 Type II' },
    { name: 'ISO 27001' },
    { name: 'GDPR Compliant' }
  ];

  return (
    <section id="features" className="py-32 bg-transparent md:py-24 sm:py-20">
      <div className="max-w-7xl mx-auto px-8 md:px-6 sm:px-4">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center glass border border-blue-200/30 rounded-full px-8 py-3 mb-8">
            <span className="text-sm font-bold text-blue-700 tracking-wide">Enterprise-Grade Features</span>
          </div>

          <h2 className="text-6xl font-black text-gray-900 mb-8 leading-tight text-balance md:text-5xl sm:text-4xl">
            Everything you need for{' '}
            <span className="gradient-text">complete security</span>
          </h2>

          <p className="text-2xl text-gray-600 max-w-4xl mx-auto text-balance font-medium leading-relaxed md:text-xl sm:text-lg">
            Built with the latest security standards and powered by AI to keep you protected 24/7.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-10 mb-24 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 md:gap-8 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-10 bg-white rounded-3xl border border-gray-200/50 shadow-card hover:shadow-card-hover hover:border-gray-300/50 transition-all duration-500 hover:-translate-y-2"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>

              <div className="relative">
                <div className={`w-full h-2 rounded-full bg-gradient-to-r ${feature.color} mb-8 group-hover:scale-105 transition-all duration-300 shadow-soft`}></div>

                <h3 className="text-2xl font-black text-gray-900 mb-6 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed text-lg font-medium">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-3xl p-12 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by professionals worldwide
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of users who rely on Lok for their digital security
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-black gradient-text mb-2">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-6">Certified and compliant with industry standards</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span className="text-sm font-medium text-gray-700">✓ {cert.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
