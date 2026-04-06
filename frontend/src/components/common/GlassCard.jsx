import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = true }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.01 } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        relative overflow-hidden
        bg-white/10 backdrop-blur-md
        border border-white/20 rounded-2xl
        shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]
        ${className}
      `}
    >
      {/* Gloss effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
