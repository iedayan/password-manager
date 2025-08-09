import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../hooks';
import { cn } from '../lib/utils';

export default function Hero() {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1 });

  const features = [
    { text: 'Auto-Updates', delay: 0.1 },
    { text: 'Military-Grade Security', delay: 0.2 },
    { text: 'AI-Powered', delay: 0.3 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <section
      ref={ref}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Futuristic Background Elements */}
      <div className="absolute inset-0">
        {/* Holographic Orbs */}
        <motion.div
          className="absolute top-32 left-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-32 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            y: [0, 25, 0],
            rotate: [0, -180, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6
          }}
        />

        {/* Matrix Grid */}
        <div className="absolute inset-0 matrix-bg opacity-30"></div>

        {/* Scanning Lines */}
        <div className="absolute inset-0">
          <div className="scan-line"></div>
          <div className="scan-line" style={{animationDelay: '2s'}}></div>
        </div>
      </div>

      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Futuristic Announcement */}
        <motion.div
          className="inline-flex items-center space-x-3 cyber-card px-8 py-4 mb-12 hologram-effect"
          variants={itemVariants}
        >
          <motion.div
            className="w-3 h-3 bg-cyan-400 rounded-full neon-border"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-sm font-bold text-cyan-300 tracking-wider uppercase">QUANTUM BETA • INITIALIZE ACCESS</span>
        </motion.div>

        {/* Futuristic Headline */}
        <motion.h1
          className="text-7xl font-black mb-8 leading-[0.9] text-balance md:text-6xl sm:text-5xl"
          variants={itemVariants}
        >
          <span className="text-white">THE FINAL</span>{' '}
          <span className="neon-text text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
            QUANTUM VAULT
          </span>{' '}
          <span className="text-white">PROTOCOL</span>
        </motion.h1>

        {/* Futuristic Subtitle */}
        <motion.p
          className="text-2xl text-cyan-200/80 max-w-4xl mx-auto mb-16 leading-relaxed text-balance font-medium md:text-xl sm:text-lg"
          variants={itemVariants}
        >
          <span className="text-cyan-300">Neural-enhanced security protocols</span> with quantum encryption.
          Autonomous threat detection and <span className="text-cyan-300">zero-touch password evolution</span>—
          your digital fortress operates beyond human limitations.
        </motion.p>

        {/* Futuristic Feature Pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-16"
          variants={itemVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group cyber-card px-8 py-4 cursor-pointer relative overflow-hidden"
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 30, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: feature.delay, duration: 0.8 }}
            >
              <span className="text-sm font-bold text-cyan-300 tracking-wider uppercase relative z-10">
                {feature.text}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Futuristic CTA Buttons */}
        <motion.div
          className="flex flex-row items-center justify-center gap-8 mb-20 md:flex-col md:gap-6 sm:flex-col sm:gap-6"
          variants={itemVariants}
        >
          <motion.a
            href="#waitlist"
            className="cyber-button px-12 py-6 text-lg font-black tracking-wider"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 40px rgba(0, 255, 255, 0.8)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            INITIALIZE ACCESS
          </motion.a>
          <motion.button
            className="relative px-12 py-6 text-lg font-bold text-cyan-300 border-2 border-cyan-500/50 rounded-lg bg-transparent hover:bg-cyan-500/10 transition-all duration-300 tracking-wider neon-border"
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(0, 255, 255, 0.1)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            VIEW PROTOCOL
          </motion.button>
        </motion.div>

        {/* Social Proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full border-2 border-white"
                ></div>
              ))}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">12,000+</div>
              <div className="text-xs text-gray-500">developers waiting</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">★★★★★ 4.9/5 rating</span>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
