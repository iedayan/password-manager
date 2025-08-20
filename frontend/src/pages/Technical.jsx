import { useState, useEffect, useRef } from 'react';

export default function Technical() {
  const [activeSection, setActiveSection] = useState('security');
  const sectionRef = useRef(null);

  const sections = [
    { id: 'security', title: 'Security Architecture' },
    { id: 'encryption', title: 'Encryption Details' },
    { id: 'infrastructure', title: 'Infrastructure' },
    { id: 'compliance', title: 'Compliance' },
    { id: 'performance', title: 'Performance' }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll('.tech-card');
            elements.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add('animate-fade-in');
                el.style.opacity = '1';
              }, index * 100);
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

  const SecuritySection = () => (
    <div className="space-y-12">
      <div className="relative bg-gradient-to-br from-white via-blue-50/50 to-indigo-50 rounded-3xl p-12 border border-blue-200/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <div className="w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm"></div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-900 mb-2">Zero-Knowledge Architecture</h3>
              <p className="text-blue-600 font-semibold">Military-Grade Security Foundation</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Client-Side Encryption</h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>All passwords encrypted locally before transmission</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Master password never leaves your device</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Server only stores encrypted data blobs</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl mb-6 flex items-center justify-center mx-auto">
                  <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
                </div>
                <div className="text-sm font-mono bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                  Your Password → AES-256 → Encrypted Blob → Server
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="group relative bg-gradient-to-br from-white via-blue-50/30 to-blue-100/50 rounded-3xl p-10 shadow-2xl border border-blue-200/50 hover:shadow-3xl hover:scale-105 transition-all duration-500 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-8 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <div className="w-8 h-8 bg-white/30 rounded-xl backdrop-blur-sm"></div>
            </div>
            <h4 className="text-2xl font-black mb-6 text-gray-900 group-hover:text-blue-900 transition-colors">Military-Grade Encryption</h4>
            <p className="text-gray-700 leading-relaxed text-lg">AES-256 encryption with authenticated encryption modes ensures your data remains secure against quantum threats</p>
          </div>
        </div>
        <div className="group relative bg-gradient-to-br from-white via-emerald-50/30 to-green-100/50 rounded-3xl p-10 shadow-2xl border border-emerald-200/50 hover:shadow-3xl hover:scale-105 transition-all duration-500 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-8 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <div className="w-8 h-8 bg-white/30 rounded-xl backdrop-blur-sm"></div>
            </div>
            <h4 className="text-2xl font-black mb-6 text-gray-900 group-hover:text-emerald-900 transition-colors">Secure Key Derivation</h4>
            <p className="text-gray-700 leading-relaxed text-lg">PBKDF2 with 100,000+ iterations and cryptographically secure salts for maximum protection</p>
          </div>
        </div>
        <div className="group relative bg-gradient-to-br from-white via-purple-50/30 to-violet-100/50 rounded-3xl p-10 shadow-2xl border border-purple-200/50 hover:shadow-3xl hover:scale-105 transition-all duration-500 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl mb-8 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <div className="w-8 h-8 bg-white/30 rounded-xl backdrop-blur-sm"></div>
            </div>
            <h4 className="text-2xl font-black mb-6 text-gray-900 group-hover:text-purple-900 transition-colors">Zero-Knowledge Proof</h4>
            <p className="text-gray-700 leading-relaxed text-lg">Mathematically proven privacy - we cannot access your data even if we wanted to</p>
          </div>
        </div>
      </div>
    </div>
  );

  const EncryptionSection = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Encryption Implementation</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Encryption Flow</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-gray-700">Master password entered</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-gray-700">Key derived using PBKDF2</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-gray-700">Data encrypted with AES-256</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <span className="text-gray-700">Encrypted blob sent to server</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h4 className="text-lg font-semibold mb-4">Technical Specifications</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Algorithm:</span>
                <span className="font-mono">AES-256-GCM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Key Derivation:</span>
                <span className="font-mono">PBKDF2-SHA256</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Iterations:</span>
                <span className="font-mono">100,000+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Salt Length:</span>
                <span className="font-mono">32 bytes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IV Length:</span>
                <span className="font-mono">12 bytes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const InfrastructureSection = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 border border-purple-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Infrastructure & Architecture</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Technology Stack</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white/20 rounded-lg"></div>
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900">Backend: Python Flask</div>
                  <div className="text-gray-600">RESTful API with SQLAlchemy ORM</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white/20 rounded-lg"></div>
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900">Frontend: React</div>
                  <div className="text-gray-600">Modern SPA with Tailwind CSS</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white/20 rounded-lg"></div>
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900">Database: PostgreSQL</div>
                  <div className="text-gray-600">Encrypted at rest with backups</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Security Measures</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">TLS 1.3 encryption in transit</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Rate limiting and DDoS protection</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">JWT authentication with expiration</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Input validation and sanitization</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700">Security headers (HSTS, CSP)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ComplianceSection = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Compliance & Standards</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Privacy Compliance</h4>
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg border border-green-100">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mb-4 flex items-center justify-center">
                  <div className="w-5 h-5 bg-white/30 rounded"></div>
                </div>
                <h5 className="font-bold text-lg mb-2 text-gray-900">GDPR Compliant</h5>
                <p className="text-gray-600 leading-relaxed">Full compliance with EU data protection regulations</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-blue-100">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
                  <div className="w-5 h-5 bg-white/30 rounded"></div>
                </div>
                <h5 className="font-bold text-lg mb-2 text-gray-900">CCPA Ready</h5>
                <p className="text-gray-600 leading-relaxed">California Consumer Privacy Act compliance</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Security Standards</h4>
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border border-purple-100">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                  <div className="w-5 h-5 bg-white/30 rounded"></div>
                </div>
                <h5 className="font-bold text-lg mb-2 text-gray-900">SOC 2 Type II</h5>
                <p className="text-gray-600 leading-relaxed">In progress - comprehensive security audit</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg border border-indigo-100">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg mb-4 flex items-center justify-center">
                  <div className="w-5 h-5 bg-white/30 rounded"></div>
                </div>
                <h5 className="font-bold text-lg mb-2 text-gray-900">ISO 27001</h5>
                <p className="text-gray-600 leading-relaxed">Information security management system</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-100">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
          </div>
          <h4 className="font-bold text-lg mb-3 text-gray-900">Regular Audits</h4>
          <p className="text-gray-600 leading-relaxed">Third-party security assessments</p>
        </div>
        <div className="text-center p-8 bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border border-green-100">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6 flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
          </div>
          <h4 className="font-bold text-lg mb-3 text-gray-900">Bug Bounty</h4>
          <p className="text-gray-600 leading-relaxed">Responsible disclosure program</p>
        </div>
        <div className="text-center p-8 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border border-purple-100">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-6 flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
          </div>
          <h4 className="font-bold text-lg mb-3 text-gray-900">Penetration Testing</h4>
          <p className="text-gray-600 leading-relaxed">Regular security testing</p>
        </div>
      </div>
    </div>
  );

  const PerformanceSection = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance & Reliability</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
            <div className="text-lg font-semibold mb-1">Uptime SLA</div>
            <div className="text-sm text-gray-600">Guaranteed availability</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-4xl font-bold text-blue-600 mb-2">&lt;200ms</div>
            <div className="text-lg font-semibold mb-1">API Response</div>
            <div className="text-sm text-gray-600">Average response time</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
            <div className="text-lg font-semibold mb-1">Monitoring</div>
            <div className="text-sm text-gray-600">Continuous oversight</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">Scalability</h4>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Horizontal scaling with load balancers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Database replication and sharding</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>CDN for global performance</span>
            </li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">Backup & Recovery</h4>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Automated daily backups</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Point-in-time recovery</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Multi-region redundancy</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'security': return <SecuritySection />;
      case 'encryption': return <EncryptionSection />;
      case 'infrastructure': return <InfrastructureSection />;
      case 'compliance': return <ComplianceSection />;
      case 'performance': return <PerformanceSection />;
      default: return <SecuritySection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top Navigation */}
      <div className="bg-slate-900/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 group"
                aria-label="Navigate back to home page"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium text-sm">Home</span>
              </button>
              
              <div className="hidden md:flex items-center gap-3 text-white/70">
                <span className="text-sm">/</span>
                <span className="text-sm font-medium text-white">Technical Overview</span>
              </div>
            </div>
            
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 32 32">
                  <path d="M16 3l10 4v8c0 7-4 14-10 16-6-2-10-9-10-16V7l10-4z" fill="white" opacity="0.95"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-white">Lok</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl animate-spin" style={{animationDuration: '20s'}}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Enterprise Security Architecture
            </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent leading-tight">
            Technical
            <br className="md:hidden" />
            <span className="block md:inline"> Deep Dive</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-12">
            Explore the cutting-edge security architecture, military-grade encryption, 
            and enterprise infrastructure powering the next generation of password management
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {['Zero-Knowledge Architecture', 'AES-256 Encryption', 'SOC 2 Compliant', '99.9% Uptime'].map((badge, index) => (
              <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-blue-100">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-xl sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto py-6 gap-3" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`relative px-8 py-4 rounded-2xl font-bold whitespace-nowrap transition-all duration-500 transform hover:scale-105 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/25'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-lg'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
                aria-label={`View ${section.title} section`}
                aria-pressed={activeSection === section.id}
              >
                <span className="relative z-10">{section.title}</span>
                {activeSection === section.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur-xl"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)`
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20" ref={sectionRef}>
          <div className="tech-card opacity-0">
            {renderSection()}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Enterprise Security
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent leading-tight">
            Experience the Future
            <br className="hidden md:block" />
            <span className="text-blue-300">of Security</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of security professionals who trust Lok with their most sensitive data
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/login'}
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-3">
                Start Free Beta
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}