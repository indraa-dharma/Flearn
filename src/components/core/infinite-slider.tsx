'use client';

import React from 'react';

interface InfiniteSliderProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
}

export function InfiniteSlider({
  children,
  speed = 30,
  direction = 'left',
  className = '',
}: InfiniteSliderProps) {
  const isLeft = direction === 'left';
  
  return (
    <div className={`overflow-hidden flex w-full ${className}`}>
      <style>{`
        @keyframes infinite-slide-${direction} {
          0% { transform: translateX(${isLeft ? '0' : '-50%'}); }
          100% { transform: translateX(${isLeft ? '-50%' : '0'}); }
        }
      `}</style>
      <div
        className="flex whitespace-nowrap w-max"
        style={{
          animation: `infinite-slide-${direction} ${speed}s linear infinite`,
          gap: '2rem',
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
