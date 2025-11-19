import { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export default function Skeleton({
  width,
  height,
  circle = false,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const styles = {
    width: width,
    height: height,
    ...style,
  };

  return (
    <div
      className={`skeleton ${circle ? 'rounded-full' : ''} ${className}`}
      style={styles}
      {...props}
    />
  );
}
