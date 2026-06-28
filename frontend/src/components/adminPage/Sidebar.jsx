import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaCogs, FaSignOutAlt, FaLeaf, FaDatabase, FaClock, FaUsers, FaRobot, FaTimes, FaBriefcase } from 'react-icons/fa';
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
        if (e.target === e.currentTarget || e.target.tagName === 'NAV') {
            navigate('/admin');
            if (setIsOpen) setIsOpen(false);
        }
    };

    const handleLinkClick = () => {
        if (setIsOpen) setIsOpen(false);
    };

    const NavItem = ({ to, icon: Icon, label }) => {
        const active = isActive(to);
        return (
            <Link
                to={to}
                onClick={handleLinkClick}
                className="relative flex items-center gap-3.5 pl-5 pr-4 py-3 mx-4 rounded-xl transition-all duration-300 font-semibold text-sm group overflow-hidden"
                style={{
                    background: active ? 'rgba(52,232,158,0.1)' : 'transparent',
                    color: active ? '#34e89e' : 'rgba(226,248,240,0.55)',
                    border: active ? '1px solid rgba(52,232,158,0.2)' : '1px solid transparent',
                    boxShadow: active ? '0 4px 12px rgba(52,232,158,0.05)' : 'none'
                }}
                onMouseEnter={(e) => {
                    if (!active) {
                        e.currentTarget.style.background = 'rgba(226,248,240,0.03)';
                        e.currentTarget.style.color = '#e2f8f0';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(226,248,240,0.55)';
                    }
                }}
            >
                {active && (
                    <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ background: '#34e89e', borderRadius: '0 4px 4px 0' }}
                    />
                )}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 8,
                    background: active ? 'linear-gradient(135deg, #34e89e, #1aad72)' : 'rgba(226,248,240,0.05)',
                    color: active ? '#071825' : 'inherit'
                }}>
                    <Icon size={16} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                </div>
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={`w-72 h-screen backdrop-blur-xl flex flex-col fixed md:sticky top-0 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 overflow-y-auto custom-scrollbar`} 
            style={{ background: 'rgba(7,24,37,0.97)', borderRight: '1px solid rgba(52,232,158,0.12)' }}
            onClick={handleSidebarClick}
        >
            {/* ✅ LOGO HEADER */}
            <div className="p-7 flex items-center justify-between border-b" style={{ borderColor: 'rgba(52,232,158,0.12)' }}>
                <Link to="/admin" onClick={handleLinkClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: "linear-gradient(135deg, #34e89e, #1aad72)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#071825", boxShadow: "0 4px 18px rgba(52,232,158,0.25)",
                    }}>
                        <FaLeaf size={18} />
                    </div>
                    <div>
                        <span style={{ fontSize: 22, fontWeight: 800, color: "#34e89e", letterSpacing: "-0.5px" }}>
                            Rizqa<span style={{ color: "#e2f8f0" }}>AI</span>
                        </span>
                        <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(52,232,158,0.5)', marginTop: '-4px' }}>
                            Admin Portal
                        </p>
                    </div>
                </Link>
                <button 
                    className="md:hidden p-2 -mr-2 transition-colors rounded-lg hover:bg-white/5" style={{ color: 'rgba(226,248,240,0.5)' }}
                    onClick={() => setIsOpen && setIsOpen(false)}
                >
                    <FaTimes size={18} />
                </button>
            </div>

            {/* ✅ NAVIGATION */}
            <nav className="flex-1 py-6 flex flex-col gap-2">
                <p className="px-7 text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(226,248,240,0.35)' }}>
                    Management
                </p>

                <NavItem to="/admin/users" icon={FaUsers} label="Users" />
                <NavItem to="/admin/publish-requests" icon={FaBriefcase} label="Publish Requests" />

                <div className="my-2 border-t" style={{ borderColor: 'rgba(52,232,158,0.08)' }} />

                <p className="px-7 text-[11px] font-bold uppercase tracking-widest mb-2 mt-2" style={{ color: 'rgba(226,248,240,0.35)' }}>
                    System
                </p>

                <NavItem to="/admin/pipeline" icon={FaCogs} label="Pipeline" />
                <NavItem to="/admin/datasources" icon={FaDatabase} label="Datasources" />
                <NavItem to="/admin/schedules" icon={FaClock} label="Schedules" />

                <div className="my-2 border-t" style={{ borderColor: 'rgba(52,232,158,0.08)' }} />

                <p className="px-7 text-[11px] font-bold uppercase tracking-widest mb-2 mt-2" style={{ color: 'rgba(226,248,240,0.35)' }}>
                    Tools
                </p>

                <NavItem to="/chatbot" icon={FaRobot} label="Chatbot" />

                {/* ✅ ACCOUNT */}
                <div className="mt-auto pt-4 px-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm transition-colors border" 
                        style={{ color: '#f87171', background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.05)';
                        }}
                    >
                        <FaSignOutAlt size={16} />
                        <span>Sign Out</span>
                    </motion.button>
                </div>
            </nav>
        </motion.div>
    );
};

export default Sidebar;
