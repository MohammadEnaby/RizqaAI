import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaCogs, FaSignOutAlt, FaLeaf, FaDatabase, FaClock, FaUsers, FaRobot } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import ThemeToggle from '../ThemeToggle';

const Sidebar = () => {
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
        }
    };

    return (
        <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-72 min-h-screen bg-transparent backdrop-blur-xl shadow-2xl flex flex-col sticky"
            onClick={handleSidebarClick}
        >
            {/* ✅ LOGO HEADER */}
            <Link to="/admin" className="p-8 flex items-center gap-4 border-b border-white/20 hover:opacity-80 transition-opacity">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center theme-btn-primary text-white">
                    <FaLeaf size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold title-color dark:text-teal-400 tracking-tight">
                        Rizqa
                    </h1>
                    <p className="text-[11px] uppercase tracking-widest text-green-500 font-bold">
                        Automation
                    </p>
                </div>
            </Link>

            {/* ✅ NAVIGATION */}
            <nav className="flex-1 px-6 py-8 space-y-3">
                <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                    System
                </p>

                {/* ✅ DASHBOARD */}
                <Link
                    to="/admin/dashboard"
                    className={`relative flex items-center gap-3 pl-8 pr-5 py-4 rounded-2xl transition-all duration-300 font-medium
            ${isActive('/admin/dashboard')
                            ? 'bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 text-[#134e4a] dark:text-teal-400 shadow-lg'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
                        }`}
                >
                    <FaHome
                        className={`${isActive('/admin/dashboard') ? 'text-green-500' : 'text-gray-400'
                            }`}
                    />
                    <span>Dashboard</span>
                </Link>

                {/* ✅ USERS MANAGEMENT */}
                <Link
                    to="/admin/users"
                    className={`relative flex items-center gap-3 pl-8 pr-5 py-4 rounded-2xl transition-all duration-300 font-medium
            ${isActive('/admin/users')
                            ? 'bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 text-[#134e4a] dark:text-teal-400 shadow-lg'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
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
                    className={`relative flex items-center gap-3 pl-8 pr-5 py-4 rounded-2xl transition-all duration-300 font-medium
            ${isActive('/admin/pipeline')
                            ? 'bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 text-[#134e4a] dark:text-teal-400 shadow-lg'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
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
                    className={`relative flex items-center gap-3 pl-8 pr-5 py-4 rounded-2xl transition-all duration-300 font-medium
            ${isActive('/admin/datasources')
                            ? 'bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 text-[#134e4a] dark:text-teal-400 shadow-lg'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
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
                    className={`relative flex items-center gap-3 pl-8 pr-5 py-4 rounded-2xl transition-all duration-300 font-medium
            ${isActive('/admin/schedules')
                            ? 'bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 text-[#134e4a] dark:text-teal-400 shadow-lg'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
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
                    className={`relative flex items-center gap-3 pl-8 pr-5 py-4 rounded-2xl transition-all duration-300 font-medium
            ${isActive('/chatbot')
                            ? 'bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 text-[#134e4a] dark:text-teal-400 shadow-lg'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
                        }`}
                >
                    <FaRobot
                        className={`${isActive('/chatbot') ? 'text-green-500' : 'text-gray-400'
                            }`}
                    />
                    <span>Chatbot</span>
                </Link>

                {/* ✅ ACCOUNT */}
                <div className="pt-10 mt-10 border-t border-white/20">
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

            {/* ✅ USER CARD */}
            <div className="p-6 border-t border-white/20 dark:border-gray-700/30">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        Preference
                    </p>
                    <ThemeToggle />
                </div>
                <div className="flex items-center gap-3 glass-panel dark:bg-gray-800/50 p-4 rounded-2xl">
                    <div className="w-11 h-11 rounded-full theme-btn-primary flex items-center justify-center text-white font-bold text-sm">
                        AD
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#134e4a] dark:text-teal-300">Admin</p>
                        <p className="text-xs text-gray-400">admin@rizqa.com</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;
