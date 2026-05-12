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
        <div className="min-h-screen relative overflow-hidden font-sans" style={{ background: 'linear-gradient(135deg, #071825 0%, #0f3443 50%, #071825 100%)' }}>
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px]" style={{ background: 'rgba(52,232,158,0.08)' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px]" style={{ background: 'rgba(15,52,67,0.6)' }} />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}>
                        <FaLeaf size={20} />
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight" style={{ color: '#34e89e' }}>
                        Rizqa<span style={{ color: '#e2f8f0' }}>AI</span>
                    </span>
                </div>
                <div>
                    <Link
                        to="/login"
                        className="px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all border"
                        style={{ background: 'rgba(15,52,67,0.8)', color: '#34e89e', borderColor: 'rgba(52,232,158,0.3)' }}
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
                    <span className="inline-block px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest mb-6 border" style={{ background: 'rgba(52,232,158,0.1)', color: '#34e89e', borderColor: 'rgba(52,232,158,0.25)' }}>
                        The Future of Job Hunting
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight" style={{ color: '#e2f8f0' }}>
                        Automate Your <br className="hidden md:block" />
                        <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #34e89e, #1aad72)' }}>
                            Career Growth
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(226,248,240,0.65)' }}>
                        RizqaAI is your intelligent assistant that autonomously finds, analyzes, and applies to jobs that match your profile. Stop searching, start working.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/signup"
                            className="px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-all flex items-center gap-2 group"
                            style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825', boxShadow: '0 20px 40px -12px rgba(52,232,158,0.35)' }}
                        >
                            Get Started Free
                            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all border"
                            style={{ background: 'rgba(15,52,67,0.7)', color: '#e2f8f0', borderColor: 'rgba(52,232,158,0.2)' }}
                        >
                            Access Dashboard
                        </Link>
                    </div>
                </motion.div>
            </header>

            {/* How It Works Section */}
            <section className="relative z-10 px-6 py-20 border-t" style={{ background: 'rgba(7,24,37,0.5)', backdropFilter: 'blur(8px)', borderColor: 'rgba(52,232,158,0.1)' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: '#e2f8f0' }}>How RizqaAI Works</h2>
                        <p className="max-w-xl mx-auto" style={{ color: 'rgba(226,248,240,0.55)' }}>
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
                            className="p-8 rounded-3xl border hover:-translate-y-1 transition-all"
                            style={{ background: 'rgba(15,52,67,0.6)', borderColor: 'rgba(52,232,158,0.15)', backdropFilter: 'blur(12px)' }}
                        >
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-2xl" style={{ background: 'rgba(52,232,158,0.12)', color: '#34e89e' }}>
                                <FaSearch />
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: '#e2f8f0' }}>1. Smart Discovery</h3>
                            <p className="leading-relaxed" style={{ color: 'rgba(226,248,240,0.55)' }}>
                                Our AI constantly scans multiple platforms to find job openings that perfectly match your skills and preferences.
                            </p>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="p-8 rounded-3xl border hover:-translate-y-1 transition-all"
                            style={{ background: 'rgba(15,52,67,0.6)', borderColor: 'rgba(52,232,158,0.15)', backdropFilter: 'blur(12px)' }}
                        >
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-2xl" style={{ background: 'rgba(52,232,158,0.12)', color: '#34e89e' }}>
                                <FaRobot />
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: '#e2f8f0' }}>2. AI Analysis</h3>
                            <p className="leading-relaxed" style={{ color: 'rgba(226,248,240,0.55)' }}>
                                Each job is analyzed and scored. We customize your resume and cover letter for every single application to maximize success.
                            </p>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="p-8 rounded-3xl border hover:-translate-y-1 transition-all"
                            style={{ background: 'rgba(15,52,67,0.6)', borderColor: 'rgba(52,232,158,0.15)', backdropFilter: 'blur(12px)' }}
                        >
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-2xl" style={{ background: 'rgba(52,232,158,0.12)', color: '#34e89e' }}>
                                <FaPaperPlane />
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: '#e2f8f0' }}>3. Automated Success</h3>
                            <p className="leading-relaxed" style={{ color: 'rgba(226,248,240,0.55)' }}>
                                RizqaAI submits applications on your behalf. Track everything from your dashboard and watch the interviews roll in.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-12 px-6 border-t" style={{ background: 'rgba(7,24,37,0.8)', borderColor: 'rgba(52,232,158,0.1)' }}>
                <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2 mb-6 opacity-60 hover:opacity-100 transition-all">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}>
                            <FaLeaf size={14} />
                        </div>
                        <span className="text-xl font-bold" style={{ color: '#e2f8f0' }}>RizqaAI</span>
                    </div>

                    <p className="text-sm md:text-base font-medium max-w-2xl leading-relaxed" style={{ color: 'rgba(226,248,240,0.5)' }}>
                        Created by <span style={{ color: '#34e89e', fontWeight: 700 }}>Nazieh Sayegh</span> and <span style={{ color: '#34e89e', fontWeight: 700 }}>Mohammad Enaby</span>
                    </p>
                    <p className="text-xs md:text-sm mt-2" style={{ color: 'rgba(226,248,240,0.3)' }}>
                        Students of Azrieli College of Engineering - Graduation Project
                    </p>

                    <div className="mt-8 text-xs" style={{ color: 'rgba(226,248,240,0.2)' }}>
                        &copy; {new Date().getFullYear()} RizqaAI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};


export default MainPage;
