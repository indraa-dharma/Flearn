'use client';

import React from 'react';

interface BorderTrailProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function BorderTrail({ children, className = '', color = '#007BFF' }: BorderTrailProps) {
  return (
    <div className={`relative rounded-[4px] overflow-hidden p-[1px] ${className}`}>
      <style>{`
        @keyframes border-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div 
        className="absolute inset-[-100%] w-[300%] h-[300%] z-0"
        style={{
          background: `conic-gradient(from 0deg, transparent 70%, ${color} 100%)`,
          animation: 'border-spin 4s linear infinite',
          top: '-100%',
          left: '-100%',
        }}
      />
      <div className="relative z-10 w-full h-full bg-white dark:bg-black rounded-[4px]">
        {children}
      </div>
    </div>
  );
}
