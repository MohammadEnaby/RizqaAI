import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaDatabase, FaFacebook, FaLinkedin, FaGlobe, FaSearch, FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

const Datasources = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        groupID: '',
        name: '',
        platformType: 'Facebook Group',
        lastPostId: ''
    });

    // Define apiUrl helper or variable
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/platform-groups`);
            if (response.ok) {
                const data = await response.json();
                setGroups(data);
            }
        } catch (error) {
            console.error("Failed to fetch groups:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/api/platform-groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                fetchGroups();
                setIsAddModalOpen(false);
                setFormData({ groupID: '', name: '', platformType: 'Facebook Group', lastPostId: '' });
            } else {
                alert("Failed to create group. ID might already exist.");
            }
        } catch (error) {
            console.error("Error creating group:", error);
        }
    };

    const handleEditClick = (group) => {
        setCurrentGroup(group);
        setFormData({
            groupID: group.groupID,
            name: group.name,
            platformType: group.platformType || 'Facebook Group',
            lastPostId: group.lastPostId || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/api/platform-groups/${currentGroup.groupID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    platformType: formData.platformType,
                    lastPostId: formData.lastPostId
                })
            });
            if (response.ok) {
                fetchGroups();
                setIsEditModalOpen(false);
                setCurrentGroup(null);
            }
        } catch (error) {
            console.error("Error updating group:", error);
        }
    };

    const handleDelete = async (groupId) => {
        if (window.confirm("Are you sure you want to delete this datasource?")) {
            try {
                const response = await fetch(`${apiUrl}/api/platform-groups/${groupId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    fetchGroups();
                }
            } catch (error) {
                console.error("Error deleting group:", error);
            }
        }
    };

    const getPlatformIcon = (type) => {
        switch (type) {
            case 'Facebook Group': return <FaFacebook className="text-blue-600" />;
            case 'LinkedIn': return <FaLinkedin className="text-blue-700" />;
            default: return <FaGlobe className="text-gray-500" />;
        }
    };

    const filteredGroups = groups.filter(g =>
        g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.groupID?.includes(searchTerm)
    );

    return (
        <div className="min-h-screen p-6 md:p-12 font-sans text-[#0f172a]">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight mb-2">Datasources</h1>
                        <p className="text-gray-500 font-medium">Manage your data extraction targets and configuration.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-[#0f172a] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                        <FaPlus size={14} />
                        <span>Add Source</span>
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="glass-panel p-4 rounded-2xl mb-6 flex items-center gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search sources..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500/20 font-medium text-gray-600 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="glass-panel rounded-2xl overflow-hidden shadow-sm border border-white/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Group Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Platform</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Group ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Last Post ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading datasources...</td></tr>
                                ) : filteredGroups.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No datasources found.</td></tr>
                                ) : (
                                    filteredGroups.map((group) => (
                                        <tr key={group.groupID} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-gray-800">{group.name || "Unnamed Group"}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-lg w-fit shadow-sm">
                                                    {getPlatformIcon(group.platformType)}
                                                    {group.platformType || "Unknown"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded w-fit">{group.groupID}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{group.lastPostId || "-"}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEditClick(group)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <FaEdit />
                                                    </button>
                                                    <button onClick={() => handleDelete(group.groupID)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Modal */}
                <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Datasource">
                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Group ID</label>
                            <input required name="groupID" value={formData.groupID} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-green-500/30 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-sm font-medium" placeholder="e.g. 1942419502675158" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Name</label>
                            <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-green-500/30 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-sm font-medium" placeholder="e.g. Remote Jobs Group" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Platform</label>
                            <select name="platformType" value={formData.platformType} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-green-500/30 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-sm font-medium">
                                <option>Facebook Group</option>
                                <option>LinkedIn</option>
                                <option>Website</option>
                            </select>
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#0f172a] to-[#334155] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Create Source</button>
                        </div>
                    </form>
                </Modal>

                {/* Edit Modal */}
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Datasource">
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider text-[10px]">Group ID (Read-only)</label>
                            <input disabled value={formData.groupID} className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-transparent text-gray-400 cursor-not-allowed font-mono text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Name</label>
                            <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-green-500/30 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-sm font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Platform</label>
                            <select name="platformType" value={formData.platformType} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-green-500/30 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-sm font-medium">
                                <option>Facebook Group</option>
                                <option>LinkedIn</option>
                                <option>Website</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Last Post ID (Manual Override)</label>
                            <input name="lastPostId" value={formData.lastPostId} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-green-500/30 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-sm font-medium font-mono" />
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-teal-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Save Changes</button>
                        </div>
                    </form>
                </Modal>

            </div>
        </div>
    );
};

export default Datasources;
