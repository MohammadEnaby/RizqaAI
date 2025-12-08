import React from 'react';
import { FaPlay, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AdminHeader = ({ groupId, setGroupId, maxScrolls, setMaxScrolls, handleRunPipeline, isRunning }) => {
    return (
        <div className="flex lg:flex-row items-start justify-between">
            <div className="">
                <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-[48px] font-extrabold title-color tracking-tight leading-none">
                        Pipeline Overview
                    </h1>
                </div>
                <p className="text-[#6b7280] text-[14px] max-w-lg">
                    Control center for automated job scraping, structuring, and database synchronization.
                </p>
            </div>
            {/* Controls Panel */}
                <div className="flex flex-col lg:flex-col items-start bg-transparent gap-4 w-full lg:w-auto p-4 rounded-2xl">
                <div className="flex flex-col space-y-1 w-full sm:w-auto">
                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Group ID</label>
                    <input
                        type="text"
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        className="theme-input rounded-xl px-4 py-2.5 text-s font-medium w-full sm:w-48"
                    />
                </div>

                <div className="flex flex-col space-y-1 w-full sm:w-auto">
                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Scrolls</label>
                    <input
                        type="number"
                        value={maxScrolls}
                        onChange={(e) => setMaxScrolls(e.target.value)}
                        className="theme-input rounded-xl px-4 py-2.5 text-sm font-medium w-full sm:w-24"
                    />
                </div>

                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRunPipeline}
                    disabled={isRunning}
                    className={`h-[42px] px-6 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all flex items-center justify-center space-x-2 w-full sm:w-auto ${isRunning
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'theme-btn-primary'
                        }`}
                >
                    {isRunning ? <FaSpinner className="animate-spin" /> : <FaPlay size={12} />}
                    <span>{isRunning ? 'RUNNING...' : 'SIMULATE RUN'}</span>
                </motion.button>
            </div>
        </div>
    );
};

export default AdminHeader;
