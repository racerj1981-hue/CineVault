import React from 'react';

export const MovieIcon = ({ className = 'w-6 h-6', ...props }) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="movieIconGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Clapperboard Lower Slate */}
      <rect
        x="6"
        y="18"
        width="36"
        height="24"
        rx="3"
        fill="#18181b"
        stroke="#3f3f46"
        strokeWidth="1.5"
      />

      {/* Film Strip Holes on Side */}
      <rect x="8.5" y="21" width="2" height="3" rx="0.5" fill="#f59e0b" />
      <rect x="8.5" y="26" width="2" height="3" rx="0.5" fill="#f59e0b" />
      <rect x="8.5" y="31" width="2" height="3" rx="0.5" fill="#f59e0b" />
      <rect x="8.5" y="36" width="2" height="3" rx="0.5" fill="#f59e0b" />

      {/* Center Play Button Circle & Triangle */}
      <circle cx="26" cy="30" r="8" fill="#27272a" stroke="#3f3f46" strokeWidth="1" />
      <polygon points="23.5,25.5 31,30 23.5,34.5" fill="url(#movieIconGold)" />

      {/* Top Clapper Slate with Diagonal Striping */}
      <g transform="rotate(-7 6 15)">
        <rect
          x="6"
          y="8"
          width="36"
          height="8.5"
          rx="2"
          fill="#09090b"
          stroke="#52525b"
          strokeWidth="1.2"
        />
        <clipPath id="slateClip">
          <rect x="6" y="8" width="36" height="8.5" rx="2" />
        </clipPath>
        <g clipPath="url(#slateClip)">
          <polygon points="9,7 13.5,7 7.5,17 3,17" fill="#ffffff" />
          <polygon points="18,7 22.5,7 16.5,17 12,17" fill="#ffffff" />
          <polygon points="27,7 31.5,7 25.5,17 21,17" fill="#ffffff" />
          <polygon points="36,7 40.5,7 34.5,17 30,17" fill="#ffffff" />
        </g>
      </g>

      {/* Metal Hinge Bolt */}
      <circle cx="7" cy="16" r="2" fill="#a1a1aa" stroke="#27272a" strokeWidth="0.8" />
    </svg>
  );
};
