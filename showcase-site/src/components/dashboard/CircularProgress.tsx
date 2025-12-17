import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
    value: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color?: 'blue' | 'purple' | 'emerald' | 'amber';
    label?: string;
    showValue?: boolean;
}

const colorMap = {
    blue: {
        stroke: '#3B82F6',
        gradient: ['#3B82F6', '#2563EB'],
    },
    purple: {
        stroke: '#8B5CF6',
        gradient: ['#8B5CF6', '#7C3AED'],
    },
    emerald: {
        stroke: '#10B981',
        gradient: ['#10B981', '#059669'],
    },
    amber: {
        stroke: '#F59E0B',
        gradient: ['#F59E0B', '#D97706'],
    },
};

export const CircularProgress: React.FC<CircularProgressProps> = ({
    value,
    size = 120,
    strokeWidth = 8,
    color = 'blue',
    label,
    showValue = true,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    const colors = colorMap[color];

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <defs>
                    <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colors.gradient[0]} />
                        <stop offset="100%" stopColor={colors.gradient[1]} />
                    </linearGradient>
                </defs>

                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-gray-200 dark:text-gray-700"
                />

                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={`url(#gradient-${color})`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{
                        duration: 1,
                        ease: [0.25, 0.1, 0.25, 1.0],
                    }}
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showValue && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        className="text-2xl font-bold text-gray-900 dark:text-white"
                    >
                        {Math.round(value)}%
                    </motion.span>
                )}
                {label && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {label}
                    </span>
                )}
            </div>
        </div>
    );
};
