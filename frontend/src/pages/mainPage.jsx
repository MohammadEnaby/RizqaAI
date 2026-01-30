import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRobot, FaSearch, FaPaperPlane, FaArrowRight, FaLeaf } from 'react-icons/fa';

const MainPage = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 relative overflow-hidden font-sans text-gray-800">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-200/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-200/30 rounded-full blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                        <FaLeaf size={20} />
                    </div>
                    <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600 tracking-tight">
                        Rizqa<span className="text-gray-700">AI</span>
                    </span>
                </div>
                <div>
                    <Link
                        to="/login"
                        className="px-6 py-2.5 rounded-full bg-white text-green-700 font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all border border-green-100"
                    >
                        Login
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative z-10 px-6 pt-10 pb-20 md:pt-20 md:pb-32 max-w-7xl mx-auto text-center">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6 }}
                    variants={fadeIn}
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 font-bold text-xs uppercase tracking-widest mb-6 border border-green-200">
                        The Future of Job Hunting
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight text-gray-900">
                        Automate Your <br className="hidden md:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-teal-500">
                            Career Growth
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                        RizqaAI is your intelligent assistant that autonomously finds, analyzes, and applies to jobs that match your profile. Stop searching, start working.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/signup"
                            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-lg shadow-xl shadow-green-500/30 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/40 transition-all flex items-center gap-2 group"
                        >
                            Get Started Free
                            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 rounded-2xl bg-white text-gray-700 font-bold text-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all border border-gray-100"
                        >
                            Access Dashboard
                        </Link>
                    </div>
                </motion.div>
            </header>

            {/* How It Works Section */}
            <section className="relative z-10 px-6 py-20 bg-white/50 backdrop-blur-sm border-t border-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">How RizqaAI Works</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            Our advanced pipeline handles the tedious parts of job hunting, so you can focus on the interviews.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6 text-2xl">
                                <FaSearch />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Smart Discovery</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Our AI constantly scans multiple platforms to find job openings that perfectly match your skills and preferences.
                            </p>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 mb-6 text-2xl">
                                <FaRobot />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">2. AI Analysis</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Each job is analyzed and scored. We customize your resume and cover letter for every single application to maximize success.
                            </p>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 mb-6 text-2xl">
                                <FaPaperPlane />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Automated Success</h3>
                            <p className="text-gray-500 leading-relaxed">
                                RizqaAI submits applications on your behalf. Track everything from your dashboard and watch the interviews roll in.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer / Credits */}
            <footer className="relative z-10 py-12 px-6 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2 mb-6 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-green-500 to-teal-500 flex items-center justify-center text-white">
                            <FaLeaf size={14} />
                        </div>
                        <span className="text-xl font-bold text-gray-700">RizqaAI</span>
                    </div>

                    <p className="text-sm md:text-base font-medium text-gray-500 max-w-2xl leading-relaxed">
                        Created by <span className="text-gray-900 font-bold">Nazieh Sayegh</span> and <span className="text-gray-900 font-bold">Mohammad Enaby</span>
                    </p>
                    <p className="text-xs md:text-sm text-gray-400 mt-2">
                        Students of Azrieli College of Engineering - Graduation Project
                    </p>

                    <div className="mt-8 text-xs text-gray-300">
                        &copy; {new Date().getFullYear()} RizqaAI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainPage;
