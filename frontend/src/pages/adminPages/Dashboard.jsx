import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { FaTrash, FaBriefcase, FaExternalLinkAlt, FaCheck, FaTimes, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const COLUMN_TYPES = {
    NEW: { id: 'new', label: 'New / Unsorted', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    SHORTLISTED: { id: 'shortlisted', label: 'Shortlisted', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    CONTACTED: { id: 'contacted', label: 'Contacted', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    REJECTED: { id: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' },
};

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, new: 0 });

    useEffect(() => {
        // Subscribe to jobs collection
        const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
            const fetchedJobs = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Default status to 'new' if missing
                    status: data.status ? data.status.toLowerCase() : 'new'
                };
            });

            // Sort by posted time (newest first)
            fetchedJobs.sort((a, b) => {
                const timeA = a.post_time?.seconds || 0;
                const timeB = b.post_time?.seconds || 0;
                return timeB - timeA;
            });

            setJobs(fetchedJobs);
            setStats({
                total: fetchedJobs.length,
                new: fetchedJobs.filter(j => !j.status || j.status === 'new').length
            });
            setLoading(false);
        }, (error) => {
            console.error("Error fetching jobs:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (jobId, newStatus) => {
        try {
            await updateDoc(doc(db, "jobs", jobId), {
                status: newStatus,
                lastUpdated: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to move job");
        }
    };

    const handleDelete = async (jobId) => {
        if (window.confirm("Delete this job permanently?")) {
            try {
                await deleteDoc(doc(db, "jobs", jobId));
            } catch (error) {
                console.error("Error deleting job:", error);
                alert("Failed to delete job");
            }
        }
    };

    const renderColumn = (columnKey) => {
        const column = COLUMN_TYPES[columnKey];
        const statusId = column.id;
        const columnJobs = jobs.filter(job => job.status === statusId);

        return (
            <div className="flex flex-col h-full bg-gray-50/50 rounded-2xl border border-gray-100 min-h-[500px]">
                {/* Column Header */}
                <div className={`p-4 rounded-t-2xl border-b ${column.color} bg-opacity-50 flex justify-between items-center`}>
                    <h3 className="font-bold text-sm uppercase tracking-wider">{column.label}</h3>
                    <span className="text-xs font-bold bg-white/60 px-2 py-1 rounded-full shadow-sm">
                        {columnJobs.length}
                    </span>
                </div>

                {/* Jobs List */}
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                    {columnJobs.map(job => (
                        <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative animate-fadeIn">

                            {/* Header: Title & Location */}
                            <div className="mb-3 pr-8">
                                <h4 className="font-extrabold text-[#0f172a] text-sm leading-tight mb-1" title={job.job_title}>
                                    {job.job_title || "Untitled Job"}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <FaMapMarkerAlt size={10} className="text-gray-400" />
                                        {job.location || "Remote / Unspecified"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaClock size={10} className="text-gray-400" />
                                        {job.post_time?.seconds
                                            ? new Date(job.post_time.seconds * 1000).toLocaleDateString()
                                            : "Recent"}
                                    </span>
                                </div>
                            </div>

                            {/* Tags: Wage & Shifts */}
                            {(job.wage_per_hour || job.shifts) && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {job.wage_per_hour && (
                                        <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[10px] font-bold border border-green-100">
                                            {job.wage_per_hour}
                                        </span>
                                    )}
                                    {job.shifts && (
                                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                                            {job.shifts}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Requirements Snippet */}
                            {job.requirements && (
                                <div className="mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    <p className="text-[10px] text-gray-600 line-clamp-3 leading-relaxed">
                                        <span className="font-bold text-gray-700">Reqs: </span>
                                        {job.requirements}
                                    </p>
                                </div>
                            )}

                            {/* Contact Info (Highlighted) */}
                            {job.contact_info && (
                                <div className="mb-3 flex items-start gap-2 text-xs bg-amber-50 p-2 rounded-lg text-amber-900 border border-amber-100">
                                    <FaPhone className="mt-0.5 text-amber-600" size={10} />
                                    <span className="font-mono break-all font-medium selection:bg-amber-200">
                                        {job.contact_info}
                                    </span>
                                </div>
                            )}

                            {/* Actions Footer */}
                            <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                                <a
                                    href={job.post_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] uppercase font-bold text-[#134e4a] hover:underline flex items-center gap-1 tracking-wider"
                                >
                                    Original Post <FaExternalLinkAlt size={8} />
                                </a>

                                {/* Status Controls */}
                                <div className="flex items-center gap-1">
                                    {statusId !== 'shortlisted' && statusId !== 'rejected' && (
                                        <button
                                            onClick={() => handleStatusChange(job.id, 'shortlisted')}
                                            className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-amber-500 hover:border-amber-500 transition-colors flex items-center justify-center"
                                            title="Shortlist"
                                        >
                                            <FaCheck size={10} />
                                        </button>
                                    )}
                                    {statusId === 'shortlisted' && (
                                        <button
                                            onClick={() => handleStatusChange(job.id, 'contacted')}
                                            className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-purple-500 hover:border-purple-500 transition-colors flex items-center justify-center"
                                            title="Mark Contacted"
                                        >
                                            <FaPhone size={10} />
                                        </button>
                                    )}
                                    {statusId !== 'new' && (
                                        <button
                                            onClick={() => handleStatusChange(job.id, 'new')}
                                            className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-colors flex items-center justify-center"
                                            title="Move to New"
                                        >
                                            <span className="text-[10px] font-bold">N</span>
                                        </button>
                                    )}
                                    {statusId !== 'rejected' && (
                                        <button
                                            onClick={() => handleStatusChange(job.id, 'rejected')}
                                            className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-500 transition-colors flex items-center justify-center"
                                            title="Reject"
                                        >
                                            <FaTimes size={10} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Delete Button (Always Visible or prominent hover) */}
                            <button
                                onClick={() => handleDelete(job.id)}
                                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                                title="Delete Job"
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    ))}
                    {columnJobs.length === 0 && (
                        <div className="min-h-[100px] flex flex-col items-center justify-center text-gray-300 gap-2 border-2 border-dashed border-gray-100 rounded-xl m-2">
                            <span className="text-xs italic">No jobs in this stage</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen p-6 md:p-8 font-sans text-[#0f172a] h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-none mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold title-color tracking-tight leading-none mb-1">
                        Recruitment CRM
                    </h1>
                    <p className="text-[#6b7280] text-sm max-w-xl">
                        Manage scraped job leads. Move candidates through the pipeline.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="glass-panel px-4 py-2 rounded-xl flex flex-col items-center justify-center min-w-[100px]">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Leads</span>
                        <span className="text-xl font-bold text-[#134e4a]">{stats.total}</span>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#134e4a]"></div>
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                    <div className="flex gap-4 h-full min-w-[1000px] px-1">
                        <div className="flex-1 min-w-[280px]">
                            {renderColumn('NEW')}
                        </div>
                        <div className="flex-1 min-w-[280px]">
                            {renderColumn('SHORTLISTED')}
                        </div>
                        <div className="flex-1 min-w-[280px]">
                            {renderColumn('CONTACTED')}
                        </div>
                        <div className="flex-1 min-w-[280px]">
                            {renderColumn('REJECTED')}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
