import React from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, Image, Link2, Inbox } from 'lucide-react';

interface Activity {
    id: string;
    title: string;
    date: string;
    type: 'clip' | 'file' | 'image' | 'link';
}

interface RecentActivityWidgetProps {
    activities?: Activity[];
}

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ activities = [] }) => {
    const getIcon = (type: Activity['type']) => {
        switch (type) {
            case 'clip': return FileText;
            case 'file': return FileText;
            case 'image': return Image;
            case 'link': return Link2;
            default: return FileText;
        }
    };

    const getIconColor = (type: Activity['type']) => {
        switch (type) {
            case 'clip': return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
            case 'file': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
            case 'image': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
            case 'link': return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
        }
    };

    const hasActivities = activities.length > 0;

    return (
        <div className="bg-white dark:bg-notion-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Activity
                    </h2>
                </div>
                {hasActivities && (
                    <button className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                        View all
                    </button>
                )}
            </div>

            {!hasActivities ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        No recent activity
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Your clips will appear here
                    </p>
                </div>
            ) : (
                <div className="space-y-1">
                    {activities.map((activity, index) => {
                        const Icon = getIcon(activity.type);
                        const iconColor = getIconColor(activity.type);

                        return (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index * 0.1,
                                    ease: [0.25, 0.1, 0.25, 1.0],
                                }}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer group"
                            >
                                <div className={`p-2.5 rounded-lg ${iconColor}`}>
                                    <Icon className="w-4 h-4" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {activity.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {activity.date}
                                    </p>
                                </div>

                                <svg
                                    className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
