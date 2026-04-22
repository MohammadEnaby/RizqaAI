import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaCogs, FaSignOutAlt, FaLeaf, FaDatabase, FaClock, FaUsers, FaRobot, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleSidebarClick = (e) => {
        // Only navigate if clicking the empty background, not interactive elements
        if (e.target === e.currentTarget || e.target.tagName === 'NAV') {
            navigate('/admin');
            if (setIsOpen) setIsOpen(false);
        }
    };

    const handleLinkClick = () => {
        if (setIsOpen) setIsOpen(false);
    };

    return (
        <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={`w-72 h-screen bg-white/95 md:bg-transparent backdrop-blur-xl shadow-2xl flex flex-col fixed md:sticky top-0 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 overflow-y-auto`}
            onClick={handleSidebarClick}
        >
            {/* ✅ LOGO HEADER */}
            <div className="p-8 flex items-center justify-between border-b border-white/20">
                <Link to="/admin" onClick={handleLinkClick} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center theme-btn-primary text-white">
                        <FaLeaf size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold title-color tracking-tight">
                            Rizqa
                        </h1>
                        <p className="text-[11px] uppercase tracking-widest text-green-500 font-bold">
                            Automation
                        </p>
                    </div>
                </Link>
                <button 
                    className="md:hidden text-gray-400 hover:text-gray-600 p-2 -mr-2"
                    onClick={() => setIsOpen && setIsOpen(false)}
                >
                    <FaTimes size={20} />
                </button>
            </div>

            {/* ✅ NAVIGATION */}
            <nav className="flex-1 px-6 py-8 space-y-3">
                <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                    System
                </p>

                {/* ✅ USERS MANAGEMENT */}
                <Link
                    to="/admin/users"
                    onClick={handleLinkClick}
                    className={`relative flex items-center gap-3 pl-8 pr-5 py-4 rounded-2xl transition-all duration-300 font-medium
            ${isActive('/admin/users')
                            ? 'bg-gradient-to-r from-green-100 to-teal-100 text-[#134e4a] shadow-lg'
                            : 'text-gray-500 hover:bg-white hover:shadow-md'
                        }`}
                >
                    <FaUsers
                        className={`${isActive('/admin/users') ? 'text-green-500' : 'text-gray-400'
                            }`}
                    />
                    <span>Users</span>
                </Link>

                {/* ✅ PIPELINE */}
                <Link
                    to="/admin/pipeline"
                    onClick={handleLinkClick}
                    className={`relative flex items-center gap-3 pl-8 pr-5 py-4 rounded-2xl transition-all duration-300 font-medium
            ${isActive('/admin/pipeline')
                            ? 'bg-gradient-to-r from-green-100 to-teal-100 text-[#134e4a] shadow-lg'
                            : 'text-gray-500 hover:bg-white hover:shadow-md'
                        }`}
                >
                    <FaCogs
                        className={`${isActive('/admin/pipeline') ? 'text-green-500' : 'text-gray-400'
                            }`}
                    />
                    <span>Pipeline</span>
                </Link>

                {/* ✅ DATASOURCES */}
                <Link
                    to="/admin/datasources"
                    onClick={handleLinkClick}
                    className={`relative flex items-center gap-3 pl-8 pr-5 py-4 rounded-2xl transition-all duration-300 font-medium
            ${isActive('/admin/datasources')
                            ? 'bg-gradient-to-r from-green-100 to-teal-100 text-[#134e4a] shadow-lg'
                            : 'text-gray-500 hover:bg-white hover:shadow-md'
                        }`}
                >
                    <FaDatabase
                        className={`${isActive('/admin/datasources') ? 'text-green-500' : 'text-gray-400'
                            }`}
                    />
                    <span>Datasources</span>
                </Link>

                {/* ✅ SCHEDULED PIPELINES */}
                <Link
                    to="/admin/schedules"
                    onClick={handleLinkClick}
                    className={`relative flex items-center gap-3 pl-8 pr-5 py-4 rounded-2xl transition-all duration-300 font-medium
            ${isActive('/admin/schedules')
                            ? 'bg-gradient-to-r from-green-100 to-teal-100 text-[#134e4a] shadow-lg'
                            : 'text-gray-500 hover:bg-white hover:shadow-md'
                        }`}
                >
                    <FaClock
                        className={`${isActive('/admin/schedules') ? 'text-green-500' : 'text-gray-400'
                            }`}
                    />
                    <span>Schedules</span>
                </Link>

                {/* ✅ CHATBOT */}
                <Link
                    to="/chatbot"
                    onClick={handleLinkClick}
                    className={`relative flex items-center gap-3 pl-8 pr-5 py-4 rounded-2xl transition-all duration-300 font-medium
            ${isActive('/chatbot')
                            ? 'bg-gradient-to-r from-green-100 to-teal-100 text-[#134e4a] shadow-lg'
                            : 'text-gray-500 hover:bg-white hover:shadow-md'
                        }`}
                >
                    <FaRobot
                        className={`${isActive('/chatbot') ? 'text-green-500' : 'text-gray-400'
                            }`}
                    />
                    <span>Chatbot</span>
                </Link>

                {/* ✅ ACCOUNT */}
                <div className="pt-7 mt-7 border-t border-white/20">
                    <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                        Account
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 pl-8 pr-5 py-4 rounded-2xl font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition"
                    >
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </motion.button>
                </div>
            </nav>
        </motion.div>
    );
};

export default Sidebar;
