import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaCheck, FaTimes, FaSpinner, FaUsers, FaLeaf } from 'react-icons/fa';
import AdminHeader from '../../components/adminPage/AdminHeader';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState({ text: '', type: '' });

    // Fetch users from Firestore
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                if (!db) {
                    throw new Error("Database not initialized");
                }
                const usersCollection = collection(db, 'users');
                const userSnapshot = await getDocs(usersCollection);
                const userList = userSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Default values for new fields if they don't exist
                    appliedJobs: doc.data().appliedJobs || 0,
                    satisfaction: doc.data().satisfaction || 0,
                    enhancementSuggestions: doc.data().enhancementSuggestions || '',
                    role: doc.data().role || 'user'
                }));
                // Filter out obviously invalid entries if any
                setUsers(userList);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching users: ", error);
                setMessage({ text: 'Failed to load users. ' + error.message, type: 'error' });
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on search
    const filteredUsers = users.filter(user =>
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteDoc(doc(db, 'users', userId));
                setUsers(users.filter(user => user.id !== userId));
                setMessage({ text: 'User deleted successfully', type: 'success' });
            } catch (error) {
                console.error("Error deleting user: ", error);
                setMessage({ text: 'Failed to delete user', type: 'error' });
            }
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setFormData({
            role: user.role,
            appliedJobs: user.appliedJobs,
            satisfaction: user.satisfaction,
            enhancementSuggestions: user.enhancementSuggestions
        });
        setIsEditModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const userRef = doc(db, 'users', selectedUser.id);
            await updateDoc(userRef, {
                role: formData.role,
                appliedJobs: parseInt(formData.appliedJobs) || 0,
                satisfaction: parseInt(formData.satisfaction) || 0,
                enhancementSuggestions: formData.enhancementSuggestions
            });

            // Update local state
            setUsers(users.map(user =>
                user.id === selectedUser.id ? { ...user, ...formData } : user
            ));

            setIsEditModalOpen(false);
            setMessage({ text: 'User updated successfully', type: 'success' });
        } catch (error) {
            console.error("Error updating user: ", error);
            setMessage({ text: 'Failed to update user', type: 'error' });
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 font-sans text-[#0f172a]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-[42px] font-extrabold title-color tracking-tight leading-none mb-3">Users Management</h1>
                    <p className="text-gray-500 font-medium">Manage platform users, roles, and view their activity stats.</p>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
                            <p className="text-3xl font-extrabold text-[#134e4a] mt-1">{users.length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <FaUsers size={24} />
                        </div>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {message.type === 'success' ? <FaCheck /> : <FaTimes />}
                        {message.text}
                        <button className="ml-auto" onClick={() => setMessage({ text: '', type: '' })}>
                            <FaTimes />
                        </button>
                    </div>
                )}

                <div className="glass-panel rounded-2xl overflow-hidden shadow-sm border border-white/40">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50">
                        <div className="relative flex-1 max-w-md">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users by name, email..."
                                className="w-full pl-11 pr-4 py-3 bg-white border-0 rounded-xl focus:ring-2 focus:ring-green-500/20 shadow-sm text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Applied Jobs</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Satisfaction</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Suggestions</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <FaSpinner className="animate-spin text-green-500" size={24} />
                                                <p>Loading users...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/60 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                        {user.name ? user.name.substring(0, 2).toUpperCase() : '??'}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">{user.name || 'Unknown Name'}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.appliedJobs}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <span className={`font-bold ${user.satisfaction >= 8 ? 'text-green-600' :
                                                        user.satisfaction >= 5 ? 'text-yellow-600' : 'text-red-600'
                                                        }`}>{user.satisfaction}</span>
                                                    <span className="text-gray-400 text-xs ml-1">/ 10</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={user.enhancementSuggestions}>
                                                {user.enhancementSuggestions || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors mr-2"
                                                    title="Edit"
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">Edit User</h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border-gray-300 bg-gray-50/50 focus:border-green-500 focus:ring-green-500/20 py-2.5"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Applied Jobs Count</label>
                                <input
                                    type="number"
                                    name="appliedJobs"
                                    value={formData.appliedJobs}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full rounded-xl border-gray-300 bg-gray-50/50 focus:border-green-500 focus:ring-green-500/20 py-2.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Satisfaction (0-10)</label>
                                <input
                                    type="number"
                                    name="satisfaction"
                                    value={formData.satisfaction}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="10"
                                    className="w-full rounded-xl border-gray-300 bg-gray-50/50 focus:border-green-500 focus:ring-green-500/20 py-2.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enhancement Suggestions</label>
                                <textarea
                                    name="enhancementSuggestions"
                                    value={formData.enhancementSuggestions}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full rounded-xl border-gray-300 bg-gray-50/50 focus:border-green-500 focus:ring-green-500/20 py-2.5"
                                    placeholder="Enter suggestions..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm shadow-green-600/20"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersManagement;
