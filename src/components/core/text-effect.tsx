'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface TextEffectProps {
  children: string;
  per?: 'word' | 'char';
  delay?: number;
  className?: string;
}

export function TextEffect({ children, per = 'word', delay = 0, className = '' }: TextEffectProps) {
  const items = per === 'word' ? children.split(' ') : children.split('');
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: per === 'word' ? 0.08 : 0.04,
        delayChildren: delay,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
      aria-label={children}
    >
      {items.map((text, i) => (
        <motion.span
          key={i}
          variants={item}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {text === ' ' ? '\u00A0' : text}
          {per === 'word' && i < items.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </motion.div>
  );
}
