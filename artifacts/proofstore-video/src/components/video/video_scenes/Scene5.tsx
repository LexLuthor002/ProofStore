import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center">
        {/* Logo Mark */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ scale: 0, rotate: 180 }}
          animate={phase >= 1 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: 180 }}
          transition={{ type: "spring", stiffness: 150, damping: 20 }}
        >
          <div className="w-24 h-24 border-[3px] border-white flex items-center justify-center relative overflow-hidden">
            <div className="w-12 h-12 bg-white rotate-45" />
            <motion.div 
              className="absolute inset-0 bg-white mix-blend-difference"
              animate={{ top: ['100%', '-100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1 
          className="text-[4.5vw] font-display font-bold tracking-widest mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          PROOFSTORE
        </motion.h1>

        {/* Subtitle */}
        <motion.div 
          className="text-[1.5vw] font-mono text-white/50 tracking-wider flex items-center gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="w-12 h-[1px] bg-white/30" />
          TRUSTLESS FILE CERTIFICATION
          <span className="w-12 h-[1px] bg-white/30" />
        </motion.div>
      </div>
    </motion.div>
  );
}
