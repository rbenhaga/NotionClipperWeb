import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'green' | 'yellow' | 'red';
  showLabel?: boolean;
  label?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  variant,
  showLabel = false,
  label,
  className = '',
  ...props
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  // Auto-determine variant based on percentage if not provided
  const finalVariant =
    variant ||
    (percentage >= 90 ? 'red' : percentage >= 70 ? 'yellow' : 'green');

  const variantClasses = {
    green: 'progress-fill-green',
    yellow: 'progress-fill-yellow',
    red: 'progress-fill-red',
  };

  return (
    <div className={className} {...props}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {value} / {max === Number.MAX_SAFE_INTEGER ? '∞' : max}
          </span>
        </div>
      )}
      <div className="progress-bar">
        <motion.div
          className={variantClasses[finalVariant]}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
