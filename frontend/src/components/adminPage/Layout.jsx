import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {

    return (
        <div className="flex flex-row items-start h-screen app-bg gap-8 overflow-hidden">
            <div className="bg-blob green"></div>
            <div className="bg-blob teal"></div>
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-col flex-1 h-full overflow-y-auto pr-10 pb-4">
                {children}
            </div>
        </div>
    );
};

export default Layout;
