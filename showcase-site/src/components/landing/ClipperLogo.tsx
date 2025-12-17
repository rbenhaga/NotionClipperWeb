import { Sparkles } from 'lucide-react';

interface ClipperLogoProps {
  size?: number;
  className?: string;
}

// Logo principal - Sparkles avec dégradé violet/indigo (identique à l'UI principale)
export const ClipperLogo = ({ size = 32, className = '' }: ClipperLogoProps) => (
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
