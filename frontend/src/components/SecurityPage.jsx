import { ArrowLeft, Shield, Lock, Eye, Server, Key, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
      
      <div className="container mx-auto px-4 py-8">
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl mb-8 animate-pulse">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Security First
              </span>
            </h1>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Your security is our top priority. Learn how Lok protects your passwords 
              with military-grade encryption and zero-knowledge architecture.
            </p>
            
            {/* Security Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-cyan-400 mb-2">256-bit</div>
                <div className="text-gray-300">AES Encryption</div>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-green-400 mb-2">Zero</div>
                <div className="text-gray-300">Knowledge Access</div>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
                <div className="text-gray-300">Client-side Encryption</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-cyan-400/30 transition-all duration-300 hover:scale-105 group">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">Zero-Knowledge Encryption</h3>
              <p className="text-gray-300 leading-relaxed">
                Your passwords are encrypted on your device before transmission. 
                We never see your data in plain text.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AES-256 Encryption</h3>
              <p className="text-gray-300">
                Military-grade encryption standard used by governments and 
                financial institutions worldwide.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No Access Policy</h3>
              <p className="text-gray-300">
                Even our employees cannot access your passwords. 
                Your master key never leaves your device.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center mb-4">
                <Server className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure Infrastructure</h3>
              <p className="text-gray-300">
                SOC 2 compliant data centers with 24/7 monitoring, 
                redundancy, and physical security measures.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <Key className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure Key Derivation</h3>
              <p className="text-gray-300">
                PBKDF2 with 100,000+ iterations ensures your master password 
                is protected against brute force attacks.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Breach Monitoring</h3>
              <p className="text-gray-300">
                Continuous monitoring of data breaches to alert you 
                if your passwords are compromised.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">How Zero-Knowledge Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Local Encryption</h3>
                <p className="text-gray-300">
                  Your passwords are encrypted on your device using your master password 
                  before being sent to our servers.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure Transmission</h3>
                <p className="text-gray-300">
                  Encrypted data is transmitted over TLS and stored in our secure, 
                  encrypted databases.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Local Decryption</h3>
                <p className="text-gray-300">
                  When you access your passwords, they're decrypted locally on your 
                  device using your master password.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Security Certifications</h2>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  SOC 2 Type II Compliance
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  ISO 27001 Certified
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  GDPR Compliant
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  Regular Penetration Testing
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  Third-party Security Audits
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Security Best Practices</h2>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Use a strong, unique master password
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Enable two-factor authentication
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Regularly update your passwords
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Monitor security dashboard alerts
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Keep your devices secure and updated
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-8 border border-cyan-400/30 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Security Questions?</h2>
            <p className="text-gray-300 mb-6">
              Have questions about our security practices? Our security team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:security@lok.com" 
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
              >
                Contact Security Team
              </a>
              <Link 
                to="/privacy" 
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20"
              >
                View Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}