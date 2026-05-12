import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaDatabase, FaFacebook, FaLinkedin, FaGlobe, FaSearch, FaTimes } from 'react-icons/fa';
import { auth, db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';


const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border" style={{ background: 'rgba(10,30,46,0.98)', borderColor: 'rgba(52,232,158,0.2)' }}
            >
                <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: 'rgba(52,232,158,0.15)', background: 'rgba(7,24,37,0.4)' }}>
                    <h3 className="text-lg font-bold" style={{ color: '#e2f8f0' }}>{title}</h3>
                    <button onClick={onClose} className="transition-colors hover:text-white" style={{ color: 'rgba(226,248,240,0.5)' }}>
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
        APIFY_API_TOKEN: ''
    });

    // Define apiUrl helper or variable
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'platformGroups'));
            const groupsData = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                groupID: doc.id
            }));
            setGroups(groupsData);
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
            let headers = { 'Content-Type': 'application/json' };
            if (auth.currentUser) {
                const token = await auth.currentUser.getIdToken();
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${apiUrl}/api/platform-groups`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                fetchGroups();
                setIsAddModalOpen(false);
                setIsAddModalOpen(false);
                setFormData({ groupID: '', name: '', platformType: 'Facebook Group', APIFY_API_TOKEN: '' });
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
            APIFY_API_TOKEN: group.APIFY_API_TOKEN || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            let headers = { 'Content-Type': 'application/json' };
            if (auth.currentUser) {
                const token = await auth.currentUser.getIdToken();
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${apiUrl}/api/platform-groups/${currentGroup.groupID}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({
                    name: formData.name,
                    platformType: formData.platformType,
                    APIFY_API_TOKEN: formData.APIFY_API_TOKEN
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
                let headers = {};
                if (auth.currentUser) {
                    const token = await auth.currentUser.getIdToken();
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(`${apiUrl}/api/platform-groups/${groupId}`, {
                    method: 'DELETE',
                    headers: headers
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
            default: return <FaGlobe className="text-gray-400" />;
        }
    };

    const filteredGroups = groups.filter(g =>
        g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.groupID?.includes(searchTerm)
    );

    return (
        <div className="min-h-screen p-4 md:p-12 font-sans" style={{ color: '#e2f8f0' }}>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl md:text-[42px] font-extrabold title-color tracking-tight leading-none mb-3">Datasources</h1>
                    <p className="font-medium" style={{ color: 'rgba(226,248,240,0.5)' }}>Manage your data extraction targets and configuration.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all duration-300" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}
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
                        className="w-full pl-10 pr-4 py-3 rounded-xl font-medium outline-none transition-all border" style={{ background: 'rgba(7,24,37,0.6)', borderColor: 'rgba(52,232,158,0.15)', color: '#e2f8f0' }}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="glass-panel rounded-2xl overflow-hidden shadow-sm border border-white/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'rgba(52,232,158,0.08)' }}>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(226,248,240,0.4)' }}>Group Name</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(226,248,240,0.4)' }}>Platform</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(226,248,240,0.4)' }}>Group ID</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right" style={{ color: 'rgba(226,248,240,0.4)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center" style={{ color: 'rgba(226,248,240,0.5)' }}>Loading datasources...</td></tr>
                            ) : filteredGroups.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center" style={{ color: 'rgba(226,248,240,0.5)' }}>No datasources found.</td></tr>
                            ) : (
                                filteredGroups.map((group) => (
                                    <tr key={group.groupID} className="transition-colors group" style={{ borderBottom: '1px solid rgba(52,232,158,0.08)' }}>
                                        <td className="px-6 py-4 font-bold" style={{ color: '#e2f8f0' }}>{group.name || "Unnamed Group"}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-lg w-fit shadow-sm border" style={{ background: 'rgba(15,52,67,0.6)', color: '#34e89e', borderColor: 'rgba(52,232,158,0.2)' }}>
                                                {getPlatformIcon(group.platformType)}
                                                {group.platformType || "Unknown"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs" style={{ color: 'rgba(226,248,240,0.5)' }}>{group.groupID}</td>
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
                        <label className="block text-sm font-bold mb-1" style={{ color: 'rgba(226,248,240,0.7)' }}>Group ID</label>
                        <input required name="groupID" value={formData.groupID} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all" style={{ background: 'rgba(7,24,37,0.7)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }} placeholder="e.g. 1942419502675158" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: 'rgba(226,248,240,0.7)' }}>Name</label>
                        <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all" style={{ background: 'rgba(7,24,37,0.7)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }} placeholder="e.g. Remote Jobs Group" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: 'rgba(226,248,240,0.7)' }}>Platform</label>
                        <select name="platformType" value={formData.platformType} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all" style={{ background: 'rgba(7,24,37,0.7)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}>
                            <option>Facebook Group</option>
                            <option>LinkedIn</option>
                            <option>Website</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: 'rgba(226,248,240,0.7)' }}>Apify API Token</label>
                        <input name="APIFY_API_TOKEN" value={formData.APIFY_API_TOKEN} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all" style={{ background: 'rgba(7,24,37,0.7)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }} placeholder="Optional: Override global token" />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold transition-colors" style={{ color: 'rgba(226,248,240,0.5)' }}>Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}>Create Source</button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Datasource">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 uppercase tracking-wider text-[10px]" style={{ color: 'rgba(226,248,240,0.5)' }}>Group ID (Read-only)</label>
                        <input disabled value={formData.groupID} className="w-full px-4 py-3 rounded-xl cursor-not-allowed font-mono text-sm" style={{ background: 'rgba(7,24,37,0.4)', border: '1px solid rgba(52,232,158,0.1)', color: 'rgba(226,248,240,0.4)' }} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: 'rgba(226,248,240,0.7)' }}>Name</label>
                        <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all" style={{ background: 'rgba(7,24,37,0.7)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: 'rgba(226,248,240,0.7)' }}>Platform</label>
                        <select name="platformType" value={formData.platformType} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all" style={{ background: 'rgba(7,24,37,0.7)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }}>
                            <option>Facebook Group</option>
                            <option>LinkedIn</option>
                            <option>Website</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: 'rgba(226,248,240,0.7)' }}>Apify API Token</label>
                        <input name="APIFY_API_TOKEN" value={formData.APIFY_API_TOKEN} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all" style={{ background: 'rgba(7,24,37,0.7)', border: '1px solid rgba(52,232,158,0.2)', color: '#e2f8f0' }} placeholder="Optional: Override global token" />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold transition-colors hover:bg-white/5" style={{ color: 'rgba(226,248,240,0.5)' }}>Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}>Save Changes</button>
                    </div>
                </form>
            </Modal>

        </div >
    );
};

export default Datasources;
