'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import useMeasure from 'react-use-measure';

interface TransitionPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function TransitionPanel({ children, className = '' }: TransitionPanelProps) {
  const [ref, { height }] = useMeasure();

  return (
    <motion.div
      animate={{ height: height > 0 ? height : 'auto' }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className={`overflow-hidden ${className}`}
    >
      <div ref={ref}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={React.isValidElement(children) ? children.key : 'content'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
