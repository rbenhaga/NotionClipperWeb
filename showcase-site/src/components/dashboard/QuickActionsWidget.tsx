import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, FolderPlus, Zap } from 'lucide-react';

interface QuickAction {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string;
    onClick: () => void;
}

export const QuickActionsWidget: React.FC = () => {
    const quickActions: QuickAction[] = [
        {
            id: 'new-clip',
            label: 'New Clip',
            icon: Plus,
            color: 'blue',
            onClick: () => console.log('New clip'),
        },
        {
            id: 'upload',
            label: 'Upload',
            icon: Upload,
            color: 'purple',
            onClick: () => console.log('Upload'),
        },
        {
            id: 'new-folder',
            label: 'New Folder',
            icon: FolderPlus,
            color: 'emerald',
            onClick: () => console.log('New folder'),
        },
        {
            id: 'quick-capture',
            label: 'Quick Capture',
            icon: Zap,
            color: 'amber',
            onClick: () => console.log('Quick capture'),
        },
    ];

    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30',
    };

    return (
        <div className="bg-white dark:bg-notion-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
            </h2>

            <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <motion.button
                            key={action.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.3,
                                delay: index * 0.1,
                                ease: [0.25, 0.1, 0.25, 1.0],
                            }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={action.onClick}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all ${colorClasses[action.color as keyof typeof colorClasses]
                                }`}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-sm font-medium">{action.label}</span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
