import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Hash } from 'lucide-react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center relative">
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, scale: 0, rotate: -90 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0, rotate: -90 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="p-4 border border-white/20 relative">
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-white" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white" />
            <Hash size={48} className="text-white" />
          </div>
        </motion.div>

        <h1 className="text-[5vw] font-display font-bold uppercase tracking-[0.2em] leading-none mb-4">
          {'PROOF'.split('').map((char, i) => (
            <motion.span 
              key={`w1-${i}`} 
              className="inline-block"
              initial={{ opacity: 0, y: 40 }}
              animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.5, delay: phase >= 2 ? i * 0.05 : 0 }}
            >
              {char}
            </motion.span>
          ))}
          <span className="mx-[1vw]"></span>
          {'DOESN\'T'.split('').map((char, i) => (
            <motion.span 
              key={`w2-${i}`} 
              className="inline-block"
              initial={{ opacity: 0, y: 40 }}
              animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.5, delay: phase >= 2 ? (i + 5) * 0.05 : 0 }}
            >
              {char}
            </motion.span>
          ))}
          <span className="mx-[1vw]"></span>
          {'LIE.'.split('').map((char, i) => (
            <motion.span 
              key={`w3-${i}`} 
              className="inline-block"
              initial={{ opacity: 0, y: 40 }}
              animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.5, delay: phase >= 2 ? (i + 13) * 0.05 : 0 }}
            >
              {char}
            </motion.span>
          ))}
        </h1>

        <motion.div
          className="text-[1.2vw] text-white/50 font-mono tracking-widest uppercase"
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={phase >= 3 ? { opacity: 1, clipPath: 'inset(0 0% 0 0)' } : { opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          transition={{ duration: 0.8, ease: "circOut" }}
        >
          [ AUTHORITATIVE · PRECISE · IMMUTABLE ]
        </motion.div>
      </div>
    </motion.div>
  );
}
