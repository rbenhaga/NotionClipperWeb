import { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'gray' | 'purple' | 'green' | 'yellow' | 'red';
  icon?: React.ReactNode;
}

export default function Badge({
  children,
  variant = 'gray',
  icon,
  className = '',
  ...props
}: BadgeProps) {
  const variantClasses = {
    gray: 'badge-gray',
    purple: 'badge-purple',
    green: 'badge-green',
    yellow: 'badge-yellow',
    red: 'badge-red',
  };

  return (
    <span className={`${variantClasses[variant]} ${className}`} {...props}>
      {icon && icon}
      {children}
    </span>
  );
}
