import React from 'react';
import { FaSearch, FaFileAlt, FaCloudUploadAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const StatCard = ({ title, description, icon: Icon, value, subtext, progressValue, isActive, isLive }) => (
    <motion.div
        whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        className={`glass-panel z-0 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 flex flex-col h-full ${isActive ? 'ring-2 ring-[#14b8a6]' : ''}`}
    >
        {isLive && (
            <div className="absolute top-4 right-4 flex items-center space-x-2 px-3 py-1 rounded-full border" style={{ background: 'rgba(52,232,158,0.1)', borderColor: 'rgba(52,232,158,0.3)' }}>
                <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-[#22c55e]"
                />
                <span className="text-[10px] font-bold tracking-wider" style={{ color: '#34e89e' }}>LIVE</span>
            </div>
        )}

        <div className={`w-12 h-12 rounded-xl theme-green-blue flex items-center justify-center mb-4 ${isActive ? 'theme-btn-primary' : 'border'}`} style={!isActive ? { background: 'rgba(15,52,67,0.6)', borderColor: 'rgba(52,232,158,0.15)' } : {}}>
            <Icon size={20} color="white" />
        </div>

        <h3 className="text-[16px] font-bold mb-2" style={{ color: '#e2f8f0' }}>{title}</h3>
        <p className="text-[13px] leading-relaxed mb-6 flex-grow" style={{ color: 'rgba(226,248,240,0.5)' }}>{description}</p>

        <div className="flex justify-between items-end mb-3">
            <div className="text-[32px] font-extrabold tracking-tight leading-none" style={{ color: '#e2f8f0' }}>
                {value.toLocaleString()}
            </div>
            {progressValue > 0 && (
                <span className="text-xs font-bold text-[#14b8a6] mb-1">{progressValue}%</span>
            )}
        </div>

        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(52,232,158,0.1)' }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressValue}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full bg-[#14b8a6]"
            />
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-3">{subtext}</p>
    </motion.div>
);

const PipelineGrid = ({ stats, progress, activeStep }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
                title="SCRAPE POSTS"
                description="Crawls target Facebook groups to identify and extract raw job post data."
                icon={FaSearch}
                value={stats.postsFound}
                subtext="POSTS FOUND"
                progressValue={progress.scrape}
                isActive={activeStep >= 1}
                isLive={activeStep === 1}
            />
            <StatCard
                title="STRUCTURE JOBS"
                description="Parses raw text using NLP to extract structured fields like salary and location."
                icon={FaFileAlt}
                value={stats.jobsExtracted}
                subtext="JOBS STRUCTURED"
                progressValue={progress.structure}
                isActive={activeStep >= 2}
                isLive={activeStep === 2}
            />
            <StatCard
                title="FIREBASE UPLOAD"
                description="Syncs structured job records to the production Firestore database."
                icon={FaCloudUploadAlt}
                value={stats.jobsUploaded}
                subtext="RECORDS UPLOADED"
                progressValue={progress.upload}
                isActive={activeStep >= 3}
                isLive={activeStep === 3}
            />
        </div>
    );
};

export default PipelineGrid;
