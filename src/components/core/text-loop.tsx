'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface TextLoopProps {
  children: string[];
  interval?: number;
  className?: string;
}

export function TextLoop({ children, interval = 3000, className = '' }: TextLoopProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % children.length);
    }, interval);
    return () => clearInterval(timer);
  }, [children.length, interval]);

  return (
    <div className={`relative inline-block overflow-hidden ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="whitespace-nowrap"
        >
          {children[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
