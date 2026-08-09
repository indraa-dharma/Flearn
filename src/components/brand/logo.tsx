'use client';

import React from 'react';

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  /** Size in pixels for width & height (defaults to 32) */
  size?: number;
  /** Primary accent color for mortarboard cap (defaults to #007BFF corporate blue) */
  color?: string;
  /** Secondary accent color for AI data nodes & connecting lines (defaults to #343A40 dark charcoal) */
  secondaryColor?: string;
  /** Additional CSS class names for SVG element */
  className?: string;
}

export interface LogoWithTextProps extends LogoProps {
  /** Additional CSS class names for outer wrapper container */
  containerClassName?: string;
  /** Additional CSS class names for 'FLearn' brand text */
  textClassName?: string;
  /** Optional subtitle line below brand name (e.g. 'AI Study Planner') */
  subtitle?: string;
  /** Additional CSS class names for subtitle text */
  subtitleClassName?: string;
}

/**
 * Corporate Flat Brand Logo for FLearn.
 * Renders an inline SVG combining a geometric graduation cap (mortarboard)
 * with an integrated AI/data node connectivity element.
 */
export function Logo({
  size = 32,
  color = '#007BFF',
  secondaryColor = '#343A40',
  className = '',
  ...props
}: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="FLearn Logo"
      {...props}
    >
      {/* Mortarboard Base Crown */}
      <path
        d="M9.5 12.5V17C9.5 20.2 22.5 20.2 22.5 17V12.5L16 15.2Z"
        fill={color}
      />
      {/* Mortarboard Diamond Top */}
      <polygon
        points="16,4 28,9.5 16,15 4,9.5"
        fill={color}
      />
      {/* Primary AI Data Line (Tassel connection to primary node) */}
      <path
        d="M16 9.5H26V19"
        stroke={secondaryColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Secondary AI Data Line (Node interconnect) */}
      <line
        x1="26"
        y1="19"
        x2="20.5"
        y2="24.5"
        stroke={secondaryColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Center Pivot Cap Node */}
      <circle cx="16" cy="9.5" r="1.5" fill={secondaryColor} />
      {/* Primary AI Data Node Circle */}
      <circle cx="26" cy="19" r="2.2" fill={secondaryColor} />
      {/* Secondary AI Data Node Circle */}
      <circle cx="20.5" cy="24.5" r="1.8" fill={color} />
    </svg>
  );
}

/**
 * Brand Logo with 'FLearn' text variant.
 * Renders the SVG logo inline alongside bold, tight-tracked corporate text.
 */
export function LogoWithText({
  size = 32,
  color = '#007BFF',
  secondaryColor = '#343A40',
  className = '',
  containerClassName = '',
  textClassName = '',
  subtitle,
  subtitleClassName = '',
  ...props
}: LogoWithTextProps) {
  // Calculate responsive font size based on SVG size prop
  const fontSizeRem = `${Math.max(1.125, size * 0.045)}rem`;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${containerClassName}`.trim()}>
      <Logo
        size={size}
        color={color}
        secondaryColor={secondaryColor}
        className={className}
        {...props}
      />
      <div className="flex flex-col justify-center leading-none">
        <span
          className={`font-sans font-bold tracking-tight text-[#343A40] dark:text-white ${textClassName}`.trim()}
          style={{ fontSize: fontSizeRem }}
        >
          FLearn
        </span>
        {subtitle && (
          <span
            className={`text-xs text-slate-500 dark:text-slate-400 font-medium tracking-normal mt-1 ${subtitleClassName}`.trim()}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

export default Logo;
