import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { FaBars, FaLeaf } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex flex-col md:flex-row items-start h-screen app-bg md:gap-8 overflow-hidden relative">
            <div className="bg-blob green"></div>
            <div className="bg-blob teal"></div>
            
            {/* Mobile Header */}
            <div className="md:hidden w-full flex items-center justify-between p-4 bg-white/50 backdrop-blur-md border-b border-white/20 z-30 relative shadow-sm">
                <Link to="/admin" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center theme-btn-primary text-white">
                        <FaLeaf size={14} />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold title-color tracking-tight leading-none">Rizqa</h1>
                    </div>
                </Link>
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-[#134e4a] hover:bg-white/50 rounded-lg transition-colors"
                >
                    <FaBars size={20} />
                </button>
            </div>

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex flex-col flex-1 w-full h-full overflow-y-auto px-0 md:px-0 md:pr-10 pb-4 relative z-10">
                {children}
            </div>
        </div>
    );
};

export default Layout;
