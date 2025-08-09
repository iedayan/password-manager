import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How does Lok's AI-powered password management work?",
      answer: "Lok uses advanced AI algorithms to monitor the dark web and security databases for compromised passwords. When a breach is detected, our system automatically generates new, secure passwords and updates them across your accounts without any manual intervention."
    },
    {
      question: "Is my data safe with zero-knowledge encryption?",
      answer: "Absolutely. With zero-knowledge encryption, your passwords are encrypted on your device before being sent to our servers. We never have access to your master password or decrypted data. Even if our servers were compromised, your data would remain secure."
    },
    {
      question: "Can I use Lok on multiple devices?",
      answer: "Yes! Lok works seamlessly across all your devices - desktop, mobile, and web browsers. Your encrypted vault syncs automatically, so you always have access to your passwords wherever you are."
    },
    {
      question: "What happens if I forget my master password?",
      answer: "Since we use zero-knowledge encryption, we cannot recover your master password. However, you can set up emergency access contacts who can help you regain access to your account, or use our secure recovery options that you configure during setup."
    },
    {
      question: "How does the family plan work?",
      answer: "The family plan allows up to 6 family members to have their own secure vaults while sharing common passwords through a family vault. Each member maintains their privacy while benefiting from shared access to household accounts."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! We offer a 30-day free trial for all our plans. You can experience all of Lok's features risk-free, and if you're not completely satisfied, you can cancel anytime during the trial period."
    },
    {
      question: "How does Lok compare to other password managers?",
      answer: "Lok stands out with its AI-powered automatic password updates, real-time breach monitoring, and advanced threat detection. While other password managers require manual updates, Lok proactively protects you by automatically updating compromised passwords."
    },
    {
      question: "What kind of customer support do you provide?",
      answer: "We provide 24/7 customer support through multiple channels including live chat, email, and phone. Our security experts are always available to help you with any questions or concerns about your digital security."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-white to-gray-50/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.05),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.05),transparent_50%)]"></div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Lok and password security.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <button
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-blue-50/50 transition-all duration-200 group"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <motion.svg
                  className="w-6 h-6 text-gray-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-8 pb-6">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-6">
            Still have questions? We're here to help.
          </p>
          <motion.a
            href="#contact"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Support
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
