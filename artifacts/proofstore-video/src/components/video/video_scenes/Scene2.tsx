import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FileDown, Lock } from 'lucide-react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 3000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center pl-[10vw]"
      initial={{ x: '-100vw' }}
      animate={{ x: 0 }}
      exit={{ x: '100vw', opacity: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="flex items-center gap-[5vw]">
        {/* File Graphic */}
        <motion.div 
          className="relative w-[20vw] h-[28vw] border-2 border-white/20 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute top-0 right-0 w-8 h-8 border-b-2 border-l-2 border-white/20 bg-white/5" />
          
          <motion.div
            animate={phase >= 2 ? { y: [0, -10, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {phase < 3 ? <FileDown size={80} className="text-white/60" /> : <Lock size={80} className="text-white" />}
          </motion.div>

          {/* Hashing animation */}
          {phase >= 2 && (
            <motion.div 
              className="absolute inset-0 bg-white"
              initial={{ scaleY: 0, transformOrigin: "bottom" }}
              animate={phase >= 3 ? { scaleY: 0, opacity: 0 } : { scaleY: 1 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {phase >= 3 && (
            <motion.div 
              className="absolute bottom-4 left-4 right-4 text-[0.8vw] font-mono text-center break-all text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              f2d81a260dea8a100dd92...
            </motion.div>
          )}
        </motion.div>

        {/* Text */}
        <div className="max-w-[35vw]">
          <motion.h2 
            className="text-[3vw] font-display font-bold leading-tight mb-6"
            initial={{ opacity: 0, x: -40 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            CLIENT-SIDE
            <br />
            CRYPTOGRAPHY
          </motion.h2>

          <motion.p 
            className="text-[1.5vw] font-body text-white/70 border-l-2 border-white/30 pl-6"
            initial={{ opacity: 0, height: 0 }}
            animate={phase >= 2 ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.6 }}
          >
            Drop any file. It gets hashed locally via SHA-256. 
            The file never leaves your device.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
