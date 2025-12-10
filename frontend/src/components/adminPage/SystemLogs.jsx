import React from 'react';
import { FaTerminal } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SystemLogs = ({ logs, logsEndRef, isRunning }) => {
    return (
        <div className="glass-panel-dark rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-2.5 h-96 bg-[#131723] overflow-y-auto font-mono text-[13px] leading-relaxed custom-scrollbar">
                <div className="h-9 sticky top-0 z-10 bg-gradient-to-r from-[#107884] via-[#58de7c] to-[#107884] rounded-full px-4 py-3 flex items-center border-gray-800/50">
                <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div>
                </div>
                <div className="flex items-center mx-auto w-64 space-x-1.5">
                    <FaTerminal className="text-[#131723]" size={16} />
                    <span className="text-[#131723] text-[16px] text-center font-mono font-bold tracking-widest uppercase">
                        SYSTEM LOGS
                    </span>
                </div>
            </div>
                {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-700">
                        <p className="opacity-50">Waiting for pipeline initiation...</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {logs.map((log, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex"
                            >
                                <span className="text-gray-600 mr-3 select-none w-[80px] shrink-0">
                                    {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                <span className={`${log.includes("[ERROR]") ? "text-[#ef4444]" :
                                    log.includes("[SUCCESS]") ? "text-[#22c55e]" :
                                        log.includes("[WARNING]") ? "text-[#facc15]" :
                                            log.includes("[DEBUG]") ? "text-[#3b82f6]" :
                                                "text-gray-300"
                                    } break-all`}>
                                    {log}
                                </span>
                            </motion.div>
                        ))}
                        <div ref={logsEndRef} />
                        {isRunning && (
                            <motion.div
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-2 h-4 bg-[#22c55e] mt-1"
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemLogs;
