import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { FaTrash, FaClock, FaLayerGroup, FaHistory, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

// Helper to format minutes to label
const formatInterval = (minutes) => {
    if (minutes === 1440) return "Daily";
    if (minutes === 10080) return "Weekly";
    if (minutes === 720) return "Every 12h";
    if (minutes === 480) return "Every 8h";
    if (minutes === 360) return "Every 6h";
    return `${minutes} Mins`;
};

const ScheduledPipelines = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupNames, setGroupNames] = useState({});

    // Editing state
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");

    useEffect(() => {
        // Subscribe to schedules
        const unsubscribeSchedules = onSnapshot(collection(db, "schedulingPipelines"), (snapshot) => {
            const fetchedSchedules = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            fetchedSchedules.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
            setSchedules(fetchedSchedules);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching schedules:", error);
            setLoading(false);
        });

        // Subscribe to group names (platformGroups)
        const unsubscribeGroups = onSnapshot(collection(db, "platformGroups"), (snapshot) => {
            const namesMap = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                namesMap[doc.id] = data.name || doc.id;
            });
            setGroupNames(namesMap);
        });

        return () => {
            unsubscribeSchedules();
            unsubscribeGroups();
        };
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this schedule?")) {
            try {
                await deleteDoc(doc(db, "schedulingPipelines", id));
            } catch (error) {
                console.error("Error deleting schedule:", error);
                alert("Failed to delete schedule");
            }
        }
    };

    const startEditing = (schedule) => {
        setEditingId(schedule.id);
        setEditValue(schedule.interval);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditValue("");
    };

    const saveEditing = async (id) => {
        try {
            await updateDoc(doc(db, "schedulingPipelines", id), {
                interval: parseInt(editValue)
            });
            setEditingId(null);
        } catch (error) {
            console.error("Error updating schedule:", error);
            alert("Failed to update interval");
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 font-sans text-[#0f172a]">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-[42px] font-extrabold title-color tracking-tight leading-none mb-3">
                        Scheduled Pipelines
                    </h1>
                    <p className="text-[#6b7280] text-[16px] max-w-2xl">
                        Monitor and manage your automated job scraping schedules. Inspect results and track performance.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#134e4a]"></div>
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-3xl p-10">
                        <FaLayerGroup size={64} className="text-gray-200 mb-6" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No Active Schedules</h3>
                        <p className="text-gray-500">Go to the main Admin page to create a new automatic pipeline schedule.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {schedules.map((schedule) => (
                            <div key={schedule.id} className="glass-panel rounded-2xl p-6 relative group hover:shadow-lg transition-all border border-transparent hover:border-green-100">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(schedule.id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Schedule"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>

                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-green-50 text-green-700 mb-2">
                                            Active
                                        </span>
                                        <h3 className="text-xl font-bold text-[#134e4a] truncate max-w-[200px]" title={groupNames[schedule.groupID] || schedule.groupID}>
                                            {groupNames[schedule.groupID] || schedule.groupID}
                                        </h3>
                                        {(groupNames[schedule.groupID] && groupNames[schedule.groupID] !== schedule.groupID) && (
                                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{schedule.groupID}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white/50 p-3 rounded-xl border border-gray-100 relative group/edit">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <FaClock size={10} />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">Interval</span>
                                        </div>

                                        {editingId === schedule.id ? (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full text-xs p-1 rounded border border-green-200 outline-none focus:border-green-500"
                                                    autoFocus
                                                >
                                                    <option value="1440">Daily</option>
                                                    <option value="10080">Weekly</option>
                                                    <option value="720">Every 12h</option>
                                                    <option value="480">Every 8h</option>
                                                    <option value="360">Every 6h</option>
                                                </select>
                                                <button onClick={() => saveEditing(schedule.id)} className="text-green-600 hover:text-green-800"><FaCheck size={12} /></button>
                                                <button onClick={cancelEditing} className="text-red-400 hover:text-red-600"><FaTimes size={12} /></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-gray-700">{formatInterval(schedule.interval)}</p>
                                                <button
                                                    onClick={() => startEditing(schedule)}
                                                    className="opacity-0 group-hover/edit:opacity-100 transition-opacity text-gray-400 hover:text-[#134e4a]"
                                                    title="Edit Interval"
                                                >
                                                    <FaEdit size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white/50 p-3 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <FaLayerGroup size={10} />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">Max Scrolls</span>
                                        </div>
                                        <p className="font-semibold text-gray-700">{schedule.maxScrolls}</p>
                                    </div>
                                </div>

                                {/* Results Section */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FaHistory className="text-[#107884]" size={12} />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Last Run Results</span>
                                    </div>

                                    {schedule.lastRunStats ? (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-600">Total Jobs Found</span>
                                                <span className="text-lg font-bold text-[#134e4a]">{schedule.lastRunStats.totalJobs || 0}</span>
                                            </div>

                                            {schedule.lastRunStats.breakdown && (
                                                <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                                    {Object.entries(schedule.lastRunStats.breakdown).map(([title, count]) => (
                                                        <div key={title} className="flex justify-between items-center text-xs">
                                                            <span className="text-gray-500 truncate max-w-[150px]" title={title}>{title}</span>
                                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">{count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-3 text-[10px] text-right text-gray-400">
                                                {schedule.lastRunStats.timestamp ? new Date(schedule.lastRunStats.timestamp).toLocaleString() : 'Just now'}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                            <span className="text-xs text-gray-400 italic">Waiting for first execution...</span>
                                        </div>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduledPipelines;
