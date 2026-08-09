'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface AnimatedBackgroundProps {
  children: React.ReactElement[];
  className?: string;
  activeId: string;
}

export function AnimatedBackground({ children, className = '', activeId }: AnimatedBackgroundProps) {
  return (
    <div className={`flex relative ${className}`}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<{id?: string}>(child)) return child;
        
        const childId = child.props.id || child.key;
        const isActive = childId === activeId;

        return (
          <div className="relative" key={childId}>
            {isActive && (
              <motion.div
                layoutId="active-bg"
                className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-[4px] z-0"
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            )}
            <div className="relative z-10">
              {child}
            </div>
          </div>
        );
      })}
    </div>
  );
}
