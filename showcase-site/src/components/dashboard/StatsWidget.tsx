import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsWidgetProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'blue' | 'purple' | 'amber' | 'emerald';
    delay?: number;
}

const colorMap = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
};

export const StatsWidget: React.FC<StatsWidgetProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    color = 'blue',
    delay = 0,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1.0] }}
            whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            className="bg-white dark:bg-notion-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <motion.div
                    className={`p-3 rounded-xl ${colorMap[color]}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                    <Icon className="w-6 h-6" />
                </motion.div>
                {trend && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: delay + 0.2 }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${trend.isPositive
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}
                    >
                        <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={trend.isPositive ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"}
                            />
                        </svg>
                        <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                    </motion.div>
                )}
            </div>

            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {title}
                </h3>
                <motion.div
                    className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: delay + 0.3, type: 'spring', stiffness: 200 }}
                >
                    {value}
                </motion.div>
            </div>
        </motion.div>
    );
};
