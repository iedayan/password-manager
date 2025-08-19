import { useState, useEffect, useRef } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const sectionRef = useRef(null);

  const faqs = [
    {
      question: "How does automatic password updating work?",
      answer: "Our AI monitors your accounts and detects weak or reused passwords. When found, it securely logs into your accounts using your saved credentials and updates passwords to strong, unique ones. You'll be notified of all changes and can review them in your dashboard."
    },
    {
      question: "Is my data really secure with zero-knowledge encryption?",
      answer: "Yes. Your master password creates an encryption key that only exists on your devices. We never see your passwords, personal data, or encryption keys. Even if our servers were compromised, your data would remain encrypted and useless to attackers."
    },
    {
      question: "What happens if I forget my master password?",
      answer: "Due to zero-knowledge encryption, we cannot recover your master password. However, you can set up emergency access contacts who can help you regain access, or use account recovery methods you've configured during setup."
    },
    {
      question: "How do you update passwords without storing my login credentials?",
      answer: "We use secure, encrypted sessions that are immediately destroyed after password updates. The process happens locally on your device when possible, or through secure, audited automation that never stores your credentials permanently."
    },
    {
      question: "Which websites and apps support automatic password updates?",
      answer: "We support over 1,000 popular websites and apps including banking, social media, email, and shopping sites. Our list is constantly growing, and you can request support for specific sites through your dashboard."
    },
    {
      question: "Can I control which passwords get updated automatically?",
      answer: "Absolutely. You have full control over the auto-update feature. You can enable/disable it per account, set update schedules, review changes before they're applied, and maintain manual control over sensitive accounts."
    },
    {
      question: "What makes this different from other password managers?",
      answer: "We're the first password manager that proactively maintains your security by automatically updating weak passwords. Traditional managers only store and fill passwords - we actively improve your security posture without manual intervention."
    },
    {
      question: "How do you ensure the new passwords are truly secure?",
      answer: "Our AI generates passwords using cryptographically secure random generation, checks them against known breach databases, ensures uniqueness across all your accounts, and follows the latest security guidelines for length and complexity."
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = entry.target.querySelectorAll('.faq-item');
            items.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add('animate-slide-up');
                item.style.opacity = '1';
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

  return (
    <section id="faq" className="section-spacing px-6 bg-gradient-to-b from-white to-blue-50" ref={sectionRef}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about our revolutionary password management technology.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="faq-item bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 opacity-0"
            >
              <button
                id={`faq-button-${index}`}
                className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none rounded-2xl group"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpenIndex(openIndex === index ? -1 : index);
                  }
                }}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 pr-4 leading-relaxed group-hover:text-blue-600 transition-colors">
                  {faq.question}
                </h3>
                <div className={`flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center transition-all duration-300 ${
                  openIndex === index ? 'bg-blue-600 rotate-180' : 'group-hover:bg-blue-200'
                }`}>
                  <svg 
                    className={`w-4 h-4 transition-colors duration-300 ${
                      openIndex === index ? 'text-white' : 'text-blue-600'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <div 
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                role="region"
                aria-labelledby={`faq-button-${index}`}
              >
                <div className="px-8 pb-6">
                  <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            Still have questions? Our security experts are here to help.
          </p>
          <button 
            onClick={() => document.getElementById('email-signup')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Join Waitlist
          </button>
        </div>
      </div>
    </section>
  );
}