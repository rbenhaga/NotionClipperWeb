import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface UsageChartProps {
    data?: Array<{ day: string; clips: number }>;
}

export const UsageChart: React.FC<UsageChartProps> = ({ data }) => {
    const chartData = data || [];
    const hasData = chartData.length > 0;
    const maxValue = hasData ? Math.max(...chartData.map(d => d.clips)) : 0;

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-200/50">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        Weekly Activity
                    </h2>
                    <p className="text-sm text-gray-500">
                        Clips created per day
                    </p>
                </div>
            </div>

            {!hasData ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                    <BarChart3 className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-gray-500 mb-1">
                        No weekly data available yet
                    </p>
                    <p className="text-xs text-gray-400">
                        Start clipping to see your activity
                    </p>
                </div>
            ) : (
                <>
                    <div className="flex items-end justify-between gap-2 h-48">
                        {chartData.map((item, index) => {
                            const heightPercentage = (item.clips / maxValue) * 100;

                            return (
                                <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full relative group flex items-end justify-center"
                                        style={{ height: '100%' }}
                                    >
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: `${heightPercentage}%`, opacity: 1 }}
                                            transition={{
                                                duration: 0.6,
                                                delay: index * 0.1,
                                                ease: [0.25, 0.1, 0.25, 1.0],
                                            }}
                                            className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg hover:from-purple-600 hover:to-blue-600 transition-colors cursor-pointer shadow-sm relative"
                                            style={{ minHeight: heightPercentage < 10 ? '8px' : undefined }}
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg">
                                                    {item.clips} clips
                                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    <span className="text-xs font-medium text-gray-500">
                                        {item.day}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {hasData && (
                        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between text-sm">
                            <div>
                                <span className="text-gray-500">Average: </span>
                                <span className="font-semibold text-gray-900">
                                    {Math.round(chartData.reduce((acc, curr) => acc + curr.clips, 0) / chartData.length)} clips/day
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Total: </span>
                                <span className="font-semibold text-gray-900">
                                    {chartData.reduce((acc, curr) => acc + curr.clips, 0)} clips
                                </span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
