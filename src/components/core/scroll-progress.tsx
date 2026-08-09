'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 20,
    restDelta: 0.001
  });

  return (
    <motion.div
      className={className}
      style={{
        scaleX,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        backgroundColor: '#007BFF',
        transformOrigin: '0%',
        zIndex: 9999,
      }}
    />
  );
}
