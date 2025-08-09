// No icons needed

export default function Footer() {
  const navigation = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Security', href: '#security' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Roadmap', href: '#roadmap' }
    ],
    company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Security Policy', href: '#security-policy' },
      { name: 'Cookie Policy', href: '#cookies' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', href: '#' },
    { name: 'GitHub', href: '#' },
    { name: 'LinkedIn', href: '#' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)]"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-8">
              <div className="flex flex-col">
                <span className="text-4xl font-black tracking-tight">Lok</span>
                <span className="text-lg font-medium text-gray-400 -mt-1">Password Manager</span>
              </div>
            </div>
            <p className="text-gray-300 mb-8 leading-relaxed max-w-md text-lg font-medium">
              The last password manager you'll ever need. Secure, intelligent, and effortless.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-xl text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 transition-all duration-300 hover:scale-110 shadow-soft hover:shadow-glow font-medium text-sm"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Status</h3>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">All systems operational</span>
            </div>
            <p className="text-xs text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Lok, Inc. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-4 md:mt-0">
              Made for a more secure internet
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
