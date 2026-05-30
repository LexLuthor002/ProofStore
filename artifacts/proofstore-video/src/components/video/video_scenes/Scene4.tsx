import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-white"
      initial={{ clipPath: 'circle(0% at center)' }}
      animate={{ clipPath: 'circle(150% at center)' }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="text-black text-center relative z-10 w-full px-[10vw]">
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CheckCircle2 size={120} strokeWidth={1.5} className="text-black" />
          </motion.div>
        </div>

        <motion.h2 
          className="text-[6vw] font-display font-black uppercase tracking-tighter leading-none mb-6"
          initial={{ y: 50, opacity: 0 }}
          animate={phase >= 2 ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          VERIFIED FOREVER
        </motion.h2>

        <motion.div 
          className="flex flex-col gap-4 font-mono text-[1.2vw] items-center"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-between w-[40vw] border-b border-black/20 pb-2">
            <span className="text-black/50">COMPUTED HASH:</span>
            <span className="font-bold">f2d81a260de...</span>
          </div>
          <div className="flex justify-between w-[40vw] border-b border-black/20 pb-2">
            <span className="text-black/50">REGISTRY HASH:</span>
            <span className="font-bold">f2d81a260de...</span>
          </div>
          <div className="flex justify-between w-[40vw] pt-2">
            <span className="text-black/50">STATUS:</span>
            <span className="font-bold px-3 py-1 bg-black text-white text-[1vw]">MATCH FOUND</span>
          </div>
        </motion.div>
      </div>

      {/* Grid overlay for light mode */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
        backgroundSize: `40px 40px`
      }} />
    </motion.div>
  );
}
