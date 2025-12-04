import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {

    return (
        <div className="flex flex-row items-start h-screen app-bg gap-8">
            <div className="bg-blob green"></div>
            <div className="bg-blob teal"></div>
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-col overflow-auto mr-10">
                {children}
            </div>
        </div>
    );
};

export default Layout;
