import React from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
            <DashboardSidebar />
            <main className="flex-1 ml-72 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
                    className="p-8 lg:p-12 max-w-6xl mx-auto"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
};
