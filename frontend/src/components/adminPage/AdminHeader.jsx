import React, { useState, useEffect } from 'react';
import { FaPlay, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AdminHeader = ({ groupId, setGroupId, maxScrolls, setMaxScrolls, handleRunPipeline, isRunning }) => {
    const [pastGroups, setPastGroups] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchPastGroups = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/last-seen-groups');
                const data = await response.json();
                if (data.groups) {
                    setPastGroups(data.groups);
                }
            } catch (error) {
                console.error("Failed to fetch past groups:", error);
            }
        };

        fetchPastGroups();
    }, []);

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
            <div className="flex flex-col lg:flex-col items-start gap-4 w-full lg:w-auto p-4 rounded-2xl">
                <div className="flex flex-col space-y-1 w-full sm:w-auto relative">
                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Group ID</label>
                    <input
                        type="text"
                        placeholder="Enter Group ID"
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        className="theme-input rounded-xl px-4 py-2.5 text-s font-medium w-full sm:w-48"
                    />
                    {showDropdown && pastGroups.length > 0 && (
                        <div className="absolute top-full left-0 mt-1 w-full sm:w-64 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50">
                            <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                                {pastGroups.map((id) => (
                                    <div
                                        key={id}
                                        className="px-3 py-2 hover:bg-green-50 rounded-lg cursor-pointer text-sm text-gray-700 font-medium transition-colors"
                                        onClick={() => {
                                            setGroupId(id);
                                            setShowDropdown(false);
                                        }}
                                    >
                                        {id}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col space-y-1 w-full sm:w-auto">
                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Scrolls</label>
                    <input
                        type="number"
                        placeholder="Enter Scroll Count"
                        value={maxScrolls}
                        onChange={(e) => setMaxScrolls(e.target.value)}
                        className="theme-input rounded-xl px-4 py-2.5 text-s font-medium w-full sm:w-48"
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
