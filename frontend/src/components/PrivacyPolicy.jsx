import { ArrowLeft, Shield, Eye, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Lok</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/security" className="text-gray-300 hover:text-white transition-colors">Security</Link>
              <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">Terms</Link>
              <Link to="/login" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors">Login</Link>
            </nav>
            
            <Link to="/" className="md:hidden text-cyan-400 hover:text-cyan-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your privacy is our priority. Learn how we protect your data with zero-knowledge architecture.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Trust Indicators */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-6 border-b border-white/10">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center text-cyan-300">
                <Eye className="w-4 h-4 mr-2" />
                Zero-Knowledge
              </div>
              <div className="flex items-center text-blue-300">
                <Lock className="w-4 h-4 mr-2" />
                End-to-End Encrypted
              </div>
              <div className="flex items-center text-green-300">
                <Shield className="w-4 h-4 mr-2" />
                GDPR Compliant
              </div>
            </div>
          </div>
          
          <div className="p-8 lg:p-12">
          
          <div className="prose prose-invert max-w-none text-gray-300">
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-4 mb-8 border border-cyan-500/20">
              <p className="text-lg mb-0 text-cyan-200">
                <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>

            <section className="mb-10 group">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-4 text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <h2 className="text-3xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">Information We Collect</h2>
              </div>
              <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  Account Information
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Email address (for account creation and authentication)
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Master password (encrypted and never stored in plain text)
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Account preferences and settings
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  Password Data
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Website names and URLs
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Usernames and passwords (encrypted with zero-knowledge architecture)
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Password metadata (creation date, strength score)
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-10 group">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mr-4 text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <h2 className="text-3xl font-bold text-white group-hover:text-green-300 transition-colors duration-300">Zero-Knowledge Architecture</h2>
              </div>
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                <p className="mb-6 text-lg text-green-100">
                  Lok uses zero-knowledge encryption, meaning:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Your passwords are encrypted on your device before transmission',
                    'We cannot see, access, or decrypt your passwords',
                    'Only you have access to your master key',
                    'Even our employees cannot access your data'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start bg-white/5 rounded-lg p-4">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide and maintain the password management service</li>
                <li>Authenticate your identity and secure your account</li>
                <li>Send important security notifications</li>
                <li>Improve our service and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing</h2>
              <p className="mb-4">
                We do not sell, trade, or share your personal information with third parties, except:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>When required by law or legal process</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who assist in operations (under strict confidentiality)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>AES-256 encryption for all stored data</li>
                <li>TLS encryption for data in transit</li>
                <li>Regular security audits and penetration testing</li>
                <li>Secure data centers with physical security measures</li>
                <li>Employee background checks and security training</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
              <p className="mb-4">
                We retain your data only as long as necessary to provide our services. 
                When you delete your account, all data is permanently removed within 30 days.
              </p>
            </section>

            <section className="mb-10">
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl p-8 border border-cyan-400/30 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Contact Us</h2>
                <p className="text-lg text-gray-300 mb-6">
                  For privacy-related questions or concerns, contact us at:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a href="mailto:privacy@lok.com" className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105">
                    privacy@lok.com
                  </a>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-300">[Your Company Address]</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. We will notify you of 
                significant changes via email or through our service.
              </p>
            </section>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}