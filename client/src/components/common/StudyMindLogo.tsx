import React from 'react';

interface StudyMindLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon-only' | 'badge';
}

export const StudyMindLogo: React.FC<StudyMindLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'badge',
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8 rounded-lg', icon: 'w-5 h-5' },
    md: { box: 'w-10 h-10 rounded-xl', icon: 'w-6 h-6' },
    lg: { box: 'w-12 h-12 rounded-2xl', icon: 'w-7 h-7' },
    xl: { box: 'w-16 h-16 rounded-3xl', icon: 'w-10 h-10' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const svgIcon = (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${variant === 'icon-only' ? className : currentSize.icon}`}
    >
      {/* Central Vertical Spine / Divider */}
      <line
        x1="24"
        y1="8"
        x2="24"
        y2="40"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Left Brain Hemisphere (Convoluted Lobes) */}
      <path
        d="M24 9.5 C19.5 9.5 16 12 14.5 15.5 C12 15 9.5 16.5 8.5 19 C7.5 21.5 8 24.5 9.5 26.5 C8 28.5 8 31.5 9.5 33.5 C11 36 14 38 17.5 38 C20 38 22.5 37 24 35.5"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Brain Sulcus / Neural Fold */}
      <path
        d="M16.5 25 C16.5 21.5 19.5 20.5 24 20"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Top Circuit Branch */}
      <path
        d="M24 16 H30.5 V12 H33"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="36" cy="12" r="2.8" fill="currentColor" />

      {/* Middle Circuit Branch */}
      <path
        d="M24 25 H33"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="36" cy="25" r="2.8" fill="currentColor" />

      {/* Bottom Circuit Branch */}
      <path
        d="M24 33 H29 V37 H32"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="35" cy="37" r="2.8" fill="currentColor" />
    </svg>
  );

  if (variant === 'icon-only') {
    return svgIcon;
  }

  return (
    <div
      className={`${currentSize.box} bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#6366F1] flex items-center justify-center p-1.5 shadow-lg shadow-purple-600/30 text-white shrink-0 group-hover:scale-105 transition-transform duration-300 ${className}`}
    >
      {svgIcon}
    </div>
  );
};
