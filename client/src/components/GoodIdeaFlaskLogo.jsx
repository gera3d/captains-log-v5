import React from 'react';

/**
 * GoodIdea Vector Flask Logo
 * Crisp SVG beaker with amber gradient liquid, bubbles, and glowing highlights
 */
export default function GoodIdeaFlaskLogo({ className = "w-9 h-9" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Amber liquid gradient */}
        <linearGradient id="flaskLiquidGrad" x1="12" y1="20" x2="36" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Flask glass shine gradient */}
        <linearGradient id="flaskShineGrad" x1="16" y1="6" x2="32" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="flaskGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Background Liquid in Flask */}
      <path
        d="M19 22L10 37C8.5 39.5 10.3 43 13.2 43H34.8C37.7 43 39.5 39.5 38 37L29 22H19Z"
        fill="url(#flaskLiquidGrad)"
        filter="url(#flaskGlow)"
      />

      {/* Liquid surface wave / meniscus */}
      <ellipse cx="24" cy="22" rx="5" ry="1.5" fill="#FDE68A" />

      {/* Floating carbonation bubbles inside liquid */}
      <circle cx="21" cy="34" r="2.2" fill="#FFFFFF" fillOpacity="0.8" />
      <circle cx="27" cy="31" r="1.5" fill="#FFFFFF" fillOpacity="0.9" />
      <circle cx="23" cy="27" r="1" fill="#FFFFFF" fillOpacity="0.75" />
      <circle cx="30" cy="37" r="1.8" fill="#FFFFFF" fillOpacity="0.6" />

      {/* Flask Glass Outline */}
      <path
        d="M19 6V18L9 36C7 39.5 9.5 44 13.5 44H34.5C38.5 44 41 39.5 39 36L29 18V6"
        stroke="url(#flaskShineGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Flask Rim / Lip */}
      <rect
        x="16"
        y="4"
        width="16"
        height="3"
        rx="1.5"
        fill="#FFFFFF"
        stroke="#E2E8F0"
        strokeWidth="0.8"
      />

      {/* Glass reflections along left edge */}
      <path
        d="M13 37L21 22V10"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />

      {/* Subtle idea spark / star above the flask */}
      <path
        d="M37 7L38 10L41 11L38 12L37 15L36 12L33 11L36 10L37 7Z"
        fill="#FDE68A"
        opacity="0.9"
      />
    </svg>
  );
}
