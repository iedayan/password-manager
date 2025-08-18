import { useState, useEffect, useRef } from 'react';

export default function Pricing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef(null);

  const plans = [
    {
      name: "Personal",
      price: "$8",
      period: "/month",
      description: "Perfect for individuals",
      features: [
        "Unlimited passwords & secure notes",
        "Auto-update weak & reused passwords",
        "Cross-platform sync (iOS, Android, Web)",
        "AI-powered password generator",
        "Dark web monitoring",
        "Two-factor authentication (2FA)",
        "24/7 email support",
        "1GB encrypted file storage"
      ]
    },
    {
      name: "Family",
      price: "$12",
      period: "/month",
      description: "Secure your whole family",
      features: [
        "Everything in Personal",
        "Up to 6 family members",
        "Family dashboard & management",
        "Shared family vaults",
        "Emergency access for family",
        "Individual family member vaults",
        "Priority chat support",
        "5GB encrypted file storage per member"
      ],
      popular: true
    },
    {
      name: "Business",
      price: "$20",
      period: "/month",
      description: "Enterprise security for teams",
      features: [
        "Everything in Family",
        "Unlimited team members",
        "Advanced admin dashboard",
        "Team password policies",
        "SSO integration (SAML, OIDC)",
        "Advanced reporting & analytics",
        "API access for integrations",
        "Dedicated customer success manager",
        "Unlimited encrypted file storage"
      ]
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.pricing-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('animate-scale-in');
                card.style.opacity = '1';
              }, index * 200);
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

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <section id="pricing" className="section-spacing px-6 bg-gradient-to-b from-blue-50 to-white" ref={sectionRef} onMouseMove={handleMouseMove}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pricing</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that's right for you. All plans include 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`pricing-card relative p-10 bg-white rounded-3xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 opacity-0 group flex flex-col ${
                plan.popular 
                  ? 'border-blue-500 shadow-2xl scale-105 ring-4 ring-blue-100' 
                  : 'border-gray-200 hover:border-blue-300 shadow-lg'
              }`}
              style={{
                transform: `translate(${Math.max(-10, Math.min(10, (mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 0) / 2) * 0.01))}px, ${Math.max(-10, Math.min(10, (mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2) * 0.01))}px)`,
              }}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 animate-bounce">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-10">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                <p className="text-gray-600 mb-6 text-base md:text-lg">{plan.description}</p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl md:text-5xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2 text-lg md:text-xl">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: `${featureIndex * 50}ms`}}>
                    <svg className="w-5 h-5 text-green-500 mr-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-base md:text-lg">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => document.getElementById('email-signup')?.scrollIntoView({ behavior: 'smooth' })}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 group-hover:scale-105 mt-auto focus-ring ${
                plan.popular
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white hover:from-blue-800 hover:to-indigo-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                  : 'bg-white text-gray-900 hover:bg-blue-50 hover:text-blue-700 border-2 border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md'
              }`}>
Join Waitlist
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}