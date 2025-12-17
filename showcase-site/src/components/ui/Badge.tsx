import { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'gray' | 'purple' | 'green' | 'yellow' | 'red' | 'secondary' | 'gradient' | 'blue' | 'success';
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Badge({
  children,
  variant = 'gray',
  icon,
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const variantClasses = {
    gray: 'badge-gray',
    purple: 'badge-purple',
    green: 'badge-green',
    yellow: 'badge-yellow',
    red: 'badge-red',
    secondary: 'badge-gray', // Map secondary to gray
    gradient: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white', // Gradient variant
    blue: 'badge-purple', // Map blue to purple (similar color)
    success: 'badge-green', // Map success to green
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {icon && icon}
      {children}
    </span>
  );
}
