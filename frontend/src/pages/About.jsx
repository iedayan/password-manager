import { useEffect, useRef } from 'react';

export default function About() {
  const sectionRef = useRef(null);

  const values = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Privacy First",
      description: "Zero-knowledge architecture ensures we never see your data. Your passwords are encrypted locally before leaving your device."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Transparency",
      description: "Open-source code, regular security audits, and public security reports. Trust through verification, not promises."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Innovation",
      description: "AI-powered security that learns and adapts to emerging threats, bringing enterprise-grade protection to everyone."
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll('.animate-on-scroll');
            elements.forEach((element, index) => {
              setTimeout(() => {
                element.classList.add('animate-slide-up');
                element.style.opacity = '1';
              }, index * 150);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="section-spacing px-6 bg-gradient-to-b from-white to-blue-50" ref={sectionRef}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Lok</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Founded by security experts who believe everyone deserves enterprise-grade protection for their digital life.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-24">
          <div className="animate-on-scroll bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-16 text-center border border-blue-100 shadow-xl opacity-0 hover:shadow-2xl hover:border-blue-200 transition-all duration-300">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Our Mission</h3>
            <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              To make advanced cybersecurity accessible to everyone through AI-powered password management. 
              We're building a future where strong security doesn't compromise convenience, and where your 
              digital identity is protected by the same technology used by Fortune 500 companies.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              Our Values
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Drives Us</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The core principles that guide our mission to democratize cybersecurity
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const bgColors = [
                'bg-blue-500/10 hover:bg-blue-500/20 border-blue-200/30 hover:border-blue-200/50',
                'bg-teal-500/10 hover:bg-teal-500/20 border-teal-200/30 hover:border-teal-200/50',
                'bg-violet-500/10 hover:bg-violet-500/20 border-violet-200/30 hover:border-violet-200/50'
              ];
              return (
                <div 
                  key={index} 
                  className={`text-center p-8 backdrop-blur-md rounded-2xl shadow-lg transition-all duration-300 h-full flex flex-col ${bgColors[index]}`}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg backdrop-blur-sm">
                    {value.icon}
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h4>
                  <p className="text-gray-600 leading-relaxed flex-grow">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Compliance */}
        <div className="animate-on-scroll bg-gradient-to-r from-gray-900 to-slate-800 rounded-3xl p-16 text-center text-white shadow-2xl opacity-0">
          <h3 className="text-3xl md:text-4xl font-bold mb-8">Security & Compliance</h3>
          <p className="text-gray-300 mb-12 max-w-4xl mx-auto text-lg md:text-xl leading-relaxed">
            We maintain the highest security standards with regular third-party audits, 
            bug bounty programs, and compliance with international security frameworks.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { title: 'SOC 2', subtitle: 'Type II Certified' },
              { title: 'ISO 27001', subtitle: 'Certified' },
              { title: 'GDPR', subtitle: 'Compliant' },
              { title: '99.9%', subtitle: 'Uptime SLA' }
            ].map((item, index) => (
              <div key={index} className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-colors duration-300 animate-scale-in" style={{animationDelay: `${index * 0.1}s`, animationFillMode: 'both'}}>
                <div className="text-3xl font-black text-blue-400 mb-3">{item.title}</div>
                <div className="text-gray-300 font-medium">{item.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}