'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface GlowEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function GlowEffect({ children, className = '', color = '#007BFF' }: GlowEffectProps) {
  return (
    <motion.div
      className={className}
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      <motion.div
        className="rounded-[4px] h-full w-full"
        variants={{
          rest: { boxShadow: `0 0 0px 0px ${color}00` },
          hover: { 
            boxShadow: `0 0 20px 2px ${color}40`,
            transition: { duration: 0.3 }
          }
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
