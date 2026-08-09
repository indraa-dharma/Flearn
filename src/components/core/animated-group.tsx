'use client';

import { motion, Variants } from 'framer-motion';
import React from 'react';

interface AnimatedGroupProps {
  children: React.ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
}

const defaultContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const defaultItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 20 }
  },
};

export function AnimatedGroup({ children, className = '', variants }: AnimatedGroupProps) {
  const containerVariants = variants?.container || defaultContainer;
  const itemVariants = variants?.item || defaultItem;

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants} className="h-full">
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
