import { ReactNode } from 'react';

/**
 * Card - Composant réutilisable pour les cards de la landing page
 * Standardise les border-radius, backgrounds et borders
 */

type CardVariant = 'default' | 'premium' | 'feature' | 'glass';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  className?: string;
  hover?: boolean;
  as?: 'div' | 'article' | 'section';
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10',
  premium:
    'bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border-violet-500/50 shadow-2xl shadow-violet-500/10',
  feature:
    'bg-white dark:bg-[#111] border-gray-200 dark:border-white/10 shadow-sm',
  glass:
    'bg-white/60 dark:bg-white/5 backdrop-blur-md border-gray-200/50 dark:border-white/5',
};

const sizeStyles: Record<CardSize, string> = {
  sm: 'p-4 rounded-2xl',
  md: 'p-6 rounded-[24px]',
  lg: 'p-8 md:p-10 rounded-[32px]',
};

const hoverStyles =
  'hover:-translate-y-1 hover:shadow-lg transition-all duration-300';

export const Card = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  hover = false,
  as: Component = 'div',
}: CardProps) => {
  return (
    <Component
      className={`
        border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${hover ? hoverStyles : ''}
        ${className}
      `.trim()}
    >
      {children}
    </Component>
  );
};

/**
 * CardHeader - En-tête de card avec icône et badge optionnel
 */
interface CardHeaderProps {
  icon?: ReactNode;
  badge?: string;
  badgeColor?: string;
  className?: string;
}

export const CardHeader = ({
  icon,
  badge,
  badgeColor = 'text-gray-500 dark:text-gray-400',
  className = '',
}: CardHeaderProps) => (
  <div className={`flex justify-between items-start mb-4 ${className}`}>
    {icon && (
      <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 ring-1 ring-inset ring-black/5 dark:ring-white/10">
        {icon}
      </div>
    )}
    {badge && (
      <span
        className={`text-[10px] font-bold uppercase tracking-widest ${badgeColor} bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/5`}
      >
        {badge}
      </span>
    )}
  </div>
);

/**
 * CardContent - Contenu principal de la card
 */
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent = ({ children, className = '' }: CardContentProps) => (
  <div className={`relative z-10 ${className}`}>{children}</div>
);

/**
 * CardMetric - Affichage d'une métrique avec description
 */
interface CardMetricProps {
  value: string;
  label: string;
  sublabel?: string;
  className?: string;
}

export const CardMetric = ({
  value,
  label,
  sublabel,
  className = '',
}: CardMetricProps) => (
  <div className={className}>
    <div className="flex items-baseline gap-1 mb-2">
      <span className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">
        {value}
      </span>
    </div>
    <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
      {label}
    </p>
    {sublabel && (
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {sublabel}
      </p>
    )}
  </div>
);
