import React from 'react';
import { motion } from 'framer-motion';

const Welcome = () => {
    return (
        <div className="flex-1 p-8 space-y-6 overflow-y-auto h-screen bg-transparent">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-[#134e4a] mb-4">
                        Welcome to Rizqa Admin
                    </h1>
                    <p className="text-gray-500 text-lg">
                        Select a module from the sidebar to get started.
                    </p>
                </div>

                {/* Quick Stats or Intro Cards could go here */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="glass-panel p-6 rounded-2xl border-white/40 shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-[#134e4a] mb-2">Pipeline</h3>
                        <p className="text-gray-500 text-sm">
                            Manage and monitor your data extraction pipelines.
                        </p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="glass-panel p-6 rounded-2xl border-white/40 shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-[#134e4a] mb-2">Dashboard</h3>
                        <p className="text-gray-500 text-sm">
                            View system analytics and performance metrics.
                        </p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="glass-panel p-6 rounded-2xl border-white/40 shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-[#134e4a] mb-2">Datasources</h3>
                        <p className="text-gray-500 text-sm">
                            Configure and manage your data sources and groups.
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Welcome;
