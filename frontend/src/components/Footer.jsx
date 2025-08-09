import { useEffect, useRef } from 'react';

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll('.footer-animate');
            elements.forEach((element, index) => {
              setTimeout(() => {
                element.classList.add('animate-fade-in');
                element.style.opacity = '1';
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-16 px-6" ref={footerRef}>
      <div className="max-w-7xl mx-auto">
        {/* Security Badges */}
        <div className="flex justify-center items-center space-x-8 mb-12 pb-8 border-b border-gray-800">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-white">SOC 2 Type II</div>
              <div className="text-xs">Certified</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-white">ISO 27001</div>
              <div className="text-xs">Certified</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-white">GDPR</div>
              <div className="text-xs">Compliant</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <div className="text-xs font-bold text-white">SSL</div>
            </div>
            <div>
              <div className="font-semibold text-white">256-bit SSL</div>
              <div className="text-xs">Encrypted</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2 footer-animate opacity-0">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2l8 3v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V5l8-3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.5 10.5l1.5-1.5 1.5 1.5M14.5 13.5l-1.5 1.5-1.5-1.5" />
                  <circle cx="8" cy="12" r="1" fill="currentColor" />
                  <circle cx="12" cy="9" r="1" fill="currentColor" />
                  <circle cx="16" cy="12" r="1" fill="currentColor" />
                  <circle cx="12" cy="15" r="1" fill="currentColor" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M8 12h8M12 9v6" opacity="0.6" />
                </svg>
              </div>
              <span className="text-xl font-bold">Lok</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              Enterprise-grade password manager with automatic password updates. 
              Trusted by security professionals worldwide.
            </p>
            <div className="flex space-x-4">
              {[
                { path: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" },
                { path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" }
              ].map((social, index) => (
                <a key={index} href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 hover:scale-110 transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-animate opacity-0">
            <h3 className="font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-3 text-gray-400">
              {['Features', 'Pricing', 'Security', 'Downloads'].map((item, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-animate opacity-0">
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-3 text-gray-400">
              {['About', 'Blog', 'Careers', 'Contact'].map((item, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center footer-animate opacity-0">
          <p className="text-gray-400 text-sm">
            © 2024 Lok Security Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}