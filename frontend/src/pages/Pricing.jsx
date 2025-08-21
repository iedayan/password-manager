import { useState, useEffect, useRef } from 'react';

export default function Pricing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [spotsRemaining, setSpotsRemaining] = useState(500);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchSpotsRemaining = async () => {
      try {
        const response = await fetch('/api/v1/early-bird/spots-remaining');
        if (response.ok) {
          const data = await response.json();
          setSpotsRemaining(data.spotsRemaining);
        }
      } catch (error) {
        console.error('Failed to fetch spots remaining:', error);
      }
    };

    fetchSpotsRemaining();
    const interval = setInterval(fetchSpotsRemaining, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const plans = [
    {
      name: "Personal",
      price: "$99",
      period: "5 years",
      monthlyPrice: "$6/month",
      originalPrice: "$144",
      description: "Perfect for individuals",
      features: [
        "Unlimited passwords & secure notes",
        "AI-powered password strength analysis",
        "Cross-platform sync (iOS, Android, Web)",
        "Smart password generator with ML",
        "Basic breach monitoring",
        "Two-factor authentication (2FA)",
        "Email support",
        "1GB encrypted file storage",
        "Password health dashboard",
        "5 years of updates included"
      ],
      lifetime: true,
      badge: "5-YEAR DEAL"
    },
    {
      name: "Family",
      price: "$249",
      period: "5 years",
      monthlyPrice: "$15/month",
      originalPrice: "$360",
      description: "AI-powered security for families",
      features: [
        "Everything in Personal",
        "Up to 6 family members",
        "Advanced AI security analysis",
        "Family dashboard & management",
        "Shared family vaults with smart categorization",
        "Emergency access for family",
        "Behavioral anomaly detection",
        "Priority chat support",
        "5GB encrypted file storage per member",
        "Real-time breach alerts",
        "5 years of updates included"
      ],

      lifetime: true,
      badge: "5-YEAR DEAL"
    },

    {
      name: "Enterprise",
      price: "$599",
      period: "5 years",
      monthlyPrice: "$35/month",
      originalPrice: "$840",
      description: "State-of-the-art AI security for business",
      features: [
        "Everything in Family",
        "Unlimited team members",
        "Advanced ML threat intelligence",
        "Predictive breach analytics",
        "Quantum security assessment",
        "Advanced admin dashboard",
        "SSO integration (SAML, OIDC)",
        "Behavioral pattern analysis",
        "API access for integrations",
        "Dedicated customer success manager",
        "Unlimited encrypted file storage",
        "Custom security policies",
        "Advanced reporting & compliance",
        "5 years of updates included"
      ],
      lifetime: true,
      badge: "5-YEAR DEAL"
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
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            <strong className="text-blue-600">Currently in free beta!</strong> Pricing starts only when the official final product is released with mobile and desktop apps.
          </p>
          <div className="inline-block px-6 py-3 bg-orange-100 text-orange-800 rounded-full font-semibold">
Limited Time: First 500 users get 5-year access! Only {spotsRemaining} spots left.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`pricing-card relative p-10 bg-white rounded-3xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 opacity-0 group flex flex-col ${
                plan.lifetime
                  ? 'border-green-500 shadow-2xl ring-4 ring-green-100'
                  : 'border-gray-200 hover:border-blue-300 shadow-lg'
              }`}
              style={{
                transform: `translate(${Math.max(-10, Math.min(10, (mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 0) / 2) * 0.01))}px, ${Math.max(-10, Math.min(10, (mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2) * 0.01))}px)`,
              }}
            >

              {plan.lifetime && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 animate-pulse">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-10">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                <p className="text-gray-600 mb-6 text-base md:text-lg">{plan.description}</p>
                <div className="flex items-baseline justify-center mb-2">
                  <div className="flex flex-col items-center">
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl md:text-5xl font-black text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-2 text-lg md:text-xl">{plan.period}</span>
                    </div>
                    {plan.monthlyPrice && (
                      <div className="text-sm text-gray-500 mb-2">Pay once, use for 5 years</div>
                    )}
                    {plan.monthlyPrice && (
                      <div className="text-sm text-blue-600 font-medium">
                        {index === 0 ? 'Equivalent to 16 months of $6/month' :
                         index === 1 ? 'Equivalent to 16 months of $15/month' :
                         'Equivalent to 17 months of $35/month'}
                      </div>
                    )}
                    <div className="text-sm text-orange-600 font-semibold mt-2 bg-orange-50 px-3 py-1 rounded-full">First 500 users only: {spotsRemaining} spots left</div>
                  </div>
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
                onClick={() => window.location.href = '/login'}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 group-hover:scale-105 mt-auto focus-ring ${
                plan.popular
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white hover:from-blue-800 hover:to-indigo-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                  : 'bg-white text-gray-900 hover:bg-blue-50 hover:text-blue-700 border-2 border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md'
              }`}>
                Try Beta
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}