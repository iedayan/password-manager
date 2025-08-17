import { ArrowLeft, FileText, Scale, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Lok</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/security" className="text-gray-300 hover:text-white transition-colors">Security</Link>
              <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">Terms</Link>
              <Link to="/login" className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">Login</Link>
            </nav>
            
            <Link to="/" className="md:hidden text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl mb-6">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Clear, fair terms that protect both you and Lok while ensuring the best service experience.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Key Points */}
          <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 p-6 border-b border-white/10">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center text-purple-300">
                <FileText className="w-4 h-4 mr-2" />
                Fair Usage
              </div>
              <div className="flex items-center text-indigo-300">
                <Users className="w-4 h-4 mr-2" />
                User Rights
              </div>
              <div className="flex items-center text-blue-300">
                <Scale className="w-4 h-4 mr-2" />
                Legal Protection
              </div>
            </div>
          </div>
          
          <div className="p-8 lg:p-12">
          
          <div className="prose prose-invert max-w-none text-gray-300">
            <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl p-4 mb-8 border border-purple-500/20">
              <p className="text-lg mb-0 text-purple-200">
                <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>

            <section className="mb-10 group">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center mr-4 text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <h2 className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">Acceptance of Terms</h2>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300">
                <p className="text-gray-300 leading-relaxed">
                  By accessing or using Lok Password Manager ("Service"), you agree to be bound by these 
                  Terms of Service ("Terms"). If you do not agree to these Terms, do not use our Service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="mb-4">
                Lok is a password management service that helps you securely store, generate, and 
                manage your passwords using zero-knowledge encryption technology.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-medium text-cyan-400 mb-2">Account Creation</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must be at least 13 years old to use our Service</li>
                <li>One account per person or organization</li>
              </ul>
              
              <h3 className="text-xl font-medium text-cyan-400 mb-2">Master Password</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>You are solely responsible for your master password</li>
                <li>We cannot recover or reset your master password</li>
                <li>Loss of master password may result in permanent data loss</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use</h2>
              <h3 className="text-xl font-medium text-cyan-400 mb-2">You May:</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Use the Service for personal or business password management</li>
                <li>Store and manage your own passwords and credentials</li>
                <li>Share passwords securely through our sharing features</li>
              </ul>
              
              <h3 className="text-xl font-medium text-cyan-400 mb-2">You May Not:</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Use the Service for illegal activities</li>
                <li>Store illegal content or credentials for illegal services</li>
                <li>Attempt to breach security or access other users' data</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use automated tools to access the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data and Privacy</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>You retain ownership of your data</li>
                <li>We use zero-knowledge encryption - we cannot access your passwords</li>
                <li>You are responsible for backing up important data</li>
                <li>Our Privacy Policy governs data collection and use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Service Availability</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
                <li>Scheduled maintenance will be announced in advance</li>
                <li>We are not liable for service interruptions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Subscription and Billing</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Free tier includes basic features with limitations</li>
                <li>Premium subscriptions are billed monthly or annually</li>
                <li>Refunds are provided according to our refund policy</li>
                <li>Prices may change with 30 days notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent text-white mb-4">8. Termination</h2>
              <h3 className="text-xl font-medium text-cyan-400 mb-2">By You:</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>You may delete your account at any time</li>
                <li>Data will be permanently deleted within 30 days</li>
              </ul>
              
              <h3 className="text-xl font-medium text-cyan-400 mb-2">By Us:</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>We may terminate accounts for Terms violations</li>
                <li>We will provide reasonable notice when possible</li>
                <li>You will have opportunity to export your data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Disclaimers</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Service is provided "as is" without warranties</li>
                <li>We are not responsible for data loss due to user error</li>
                <li>You are responsible for maintaining secure passwords</li>
                <li>We recommend regular data backups</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
              <p className="mb-4">
                Our liability is limited to the amount you paid for the Service in the 
                12 months preceding the claim. We are not liable for indirect, 
                incidental, or consequential damages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
              <p className="mb-4">
                We may update these Terms periodically. Significant changes will be 
                communicated via email or service notifications. Continued use 
                constitutes acceptance of updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Information</h2>
              <p className="mb-4">
                For questions about these Terms, contact us at:
              </p>
              <p className="mb-2">Email: legal@lok.com</p>
              <p>Address: [Your Company Address]</p>
            </section>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}