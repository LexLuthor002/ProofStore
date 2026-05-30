import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Database, Link2 } from 'lucide-react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center gap-[8vw] mb-[8vw]">
        {/* Wallet Node */}
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-[8vw] h-[8vw] rounded-full border border-white flex items-center justify-center bg-white/5 relative">
            <div className="absolute inset-0 rounded-full border border-white/30 animate-[spin_4s_linear_infinite] border-dashed" />
            <span className="font-mono text-[1.2vw] font-bold">SUI</span>
          </div>
          <div className="text-[1vw] font-mono text-white/50">WALLET SIGNATURE</div>
        </motion.div>

        {/* Connection */}
        <motion.div 
          className="relative w-[15vw] h-[2px] bg-white/20"
          initial={{ scaleX: 0 }}
          animate={phase >= 2 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8 }}
        >
          {phase >= 2 && (
            <motion.div 
              className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>

        {/* Walrus Storage */}
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-[8vw] h-[8vw] border border-white flex items-center justify-center bg-white/5 relative rotate-45">
            <div className="absolute inset-0 border border-white/30 -rotate-45 scale-110" />
            <Database size={40} className="-rotate-45 text-white" />
          </div>
          <div className="text-[1vw] font-mono text-white/50">WALRUS STORAGE</div>
        </motion.div>
      </div>

      {/* Text block */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-[3.5vw] font-display font-bold uppercase tracking-wide">
          Tamper-Proof Certificate
        </h2>
        <p className="text-[1.5vw] font-mono text-white/60 mt-4 max-w-[60vw]">
          Hash uploaded to Walrus. Signed with Sui wallet.
          <br/>Your address IS your identity.
        </p>
      </motion.div>
    </motion.div>
  );
}
