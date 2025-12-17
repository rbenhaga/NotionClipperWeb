import React from 'react';
import { Sparkles } from 'lucide-react';

export interface LogoProps {
  size?: number;
  className?: string;
}

// Logo principal - Sparkles avec dégradé purple → indigo
export const ClipperProLogo: React.FC<LogoProps> = ({ size = 32, className }) => (
  <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
    {/* Définition du dégradé SVG */}
    <svg width="0" height="0" className="absolute">
      <defs>
        <linearGradient id={`sparklesGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" /> {/* Purple-500 */}
          <stop offset="100%" stopColor="#6366f1" /> {/* Indigo-500 */}
        </linearGradient>
      </defs>
    </svg>

    {/* Icône Sparkles avec dégradé */}
    <Sparkles
      size={size}
      strokeWidth={2}
      style={{
        stroke: `url(#sparklesGradient-${size})`,
        filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.2))'
      }}
    />
  </div>
);

// Logo avec texte
export const ClipperProLogoWithText: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' }
  };

  const config = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <ClipperProLogo size={config.icon} />
      <span className={`font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent ${config.text}`}>
        Clipper Pro
      </span>
    </div>
  );
};
