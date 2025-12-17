import React, { useState, useEffect } from 'react';
import { FaPlay, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AdminHeader = ({ groupId, setGroupId, maxScrolls, setMaxScrolls, timeInterval, setTimeInterval, handleRunPipeline, isRunning }) => {
    const [pastGroups, setPastGroups] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeMode, setActiveMode] = useState(null); // 'auto', 'manual', or null

    useEffect(() => {
        const fetchPastGroups = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/api/last-seen-groups`);
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

    const toggleMode = (mode) => {
        setActiveMode(activeMode === mode ? null : mode);
    };

    return (
        <div className="flex flex-col gap-6 mb-8">
            {/* Header Section */}
            <div className="flex lg:flex-row items-center justify-between">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-[48px] font-extrabold title-color tracking-tight leading-none">
                            Pipeline Overview
                        </h1>
                    </div>
                    <p className="text-[#6b7280] text-[14px] max-w-lg">
                        Control center for automated job scraping, structuring, and database synchronization.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => toggleMode('auto')}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${activeMode === 'auto'
                            ? 'theme-btn-primary shadow-lg scale-105'
                            : 'bg-white/80 text-[#134e4a] hover:bg-white border border-gray-100'
                            }`}
                    >
                        Run Automatically
                    </button>
                    <button
                        onClick={() => toggleMode('manual')}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${activeMode === 'manual'
                            ? 'theme-btn-primary shadow-lg scale-105'
                            : 'bg-white/80 text-[#134e4a] hover:bg-white border border-gray-100'
                            }`}
                    >
                        Run Manually
                    </button>
                </div>
            </div>

            {/* Controls Panel */}
            {activeMode && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row items-end gap-4 w-full p-6 glass-panel rounded-2xl shadow-sm relative z-50"
                >
                    <div className="flex flex-col space-y-1 w-full sm:w-auto relative z-50">
                        <label className="text-[10px] font-bold text-[#134e4a] uppercase tracking-widest">Group ID</label>
                        <input
                            type="text"
                            placeholder="Enter Group ID"
                            value={groupId}
                            onChange={(e) => setGroupId(e.target.value)}
                            onFocus={() => setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            className="theme-input rounded-xl px-4 py-2.5 text-sm font-medium w-full sm:w-64 border border-gray-200 focus:border-[#107884] transition-colors outline-none text-[#134e4a]"
                        />
                        {showDropdown && pastGroups.length > 0 && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50">
                                <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                                    {pastGroups.map((group) => (
                                        <div
                                            key={group.id}
                                            className="px-3 py-2 hover:bg-[#dcfce7] rounded-lg cursor-pointer text-sm text-[#134e4a] font-medium transition-colors border-b border-gray-50 last:border-0"
                                            onClick={() => {
                                                setGroupId(group.id);
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <div className="font-bold">{group.name || group.id}</div>
                                            {group.name && <div className="text-[10px] text-gray-500">{group.id}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col space-y-1 w-full sm:w-auto">
                        <label className="text-[10px] font-bold text-[#134e4a] uppercase tracking-widest">Max Scrolls</label>
                        <input
                            type="number"
                            placeholder="Count"
                            value={maxScrolls}
                            onChange={(e) => setMaxScrolls(e.target.value)}
                            className="theme-input rounded-xl px-4 py-2.5 text-sm font-medium w-full sm:w-32 border border-gray-200 focus:border-[#107884] transition-colors outline-none text-[#134e4a]"
                        />
                    </div>

                    {activeMode === 'auto' && (
                        <div className="flex flex-col space-y-1 w-full sm:w-auto">
                            <label className="text-[10px] font-bold text-[#134e4a] uppercase tracking-widest">Interval</label>
                            <select
                                value={timeInterval}
                                onChange={(e) => setTimeInterval(e.target.value)}
                                className="theme-input rounded-xl px-4 py-2.5 text-sm font-medium w-full sm:w-40 border border-gray-200 focus:border-[#107884] transition-colors outline-none text-[#134e4a] appearance-none cursor-pointer"
                            >
                                <option value="1440">Daily</option>
                                <option value="10080">Weekly</option>
                                <option value="720">Every 12h</option>
                                <option value="480">Every 8h</option>
                                <option value="360">Every 6h</option>
                            </select>
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleRunPipeline(activeMode)}
                        disabled={isRunning}
                        className={`h-[42px] px-8 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all flex items-center justify-center space-x-2 ml-auto ${isRunning
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'theme-btn-primary'
                            }`}
                    >
                        {isRunning ? <FaSpinner className="animate-spin" /> : <FaPlay size={10} />}
                        <span>{isRunning ? 'Running...' : activeMode === 'auto' ? 'Start Schedule' : 'Run Now'}</span>
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
};

export default AdminHeader;
