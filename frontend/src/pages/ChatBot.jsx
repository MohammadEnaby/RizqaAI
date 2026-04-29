import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaLeaf, FaBrain, FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaPaperPlane, FaUser } from 'react-icons/fa';
import { FiPlus, FiMessageSquare, FiTrash2, FiMenu, FiLogOut, FiSettings, FiX, FiMoreVertical, FiSearch, FiArrowUpRight, FiBookmark, FiShare2, FiHelpCircle } from 'react-icons/fi';

export default function ChatBot() {
    const { userProfile, currentUser, logout } = useAuth();
    const navigate = useNavigate();

    // Session State
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);

    // UI State
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const messagesEndRef = useRef(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // Initial greeting message
    const initialMessage = {
        id: 1,
        text: "Welcome to RizqaAI! 🌟\n\nI'm your professional AI assistant dedicated to helping you find the perfect career opportunity. I can assist you fluently in English, Hebrew, or Arabic.\n\nHow can I help you today? You can try:\n\n📍 Find me a Waiter job in Jerusalem\n💼 דרוש מפתח תוכנה בתל אביב\n🔍 ابحث عن وظائف هندسة في حيفا",
        sender: 'bot',
        timestamp: new Date()
    };

    // Load sessions on mount
    useEffect(() => {
        if (currentUser?.uid) {
            fetchSessions();
        }
    }, [currentUser]);

    // Load messages when session changes
    useEffect(() => {
        if (currentSessionId) {
            fetchMessages(currentSessionId);
        } else {
            setMessages([initialMessage]);
        }
    }, [currentSessionId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const fetchSessions = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/chatbot/sessions?userId=${currentUser.uid}`);
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
        }
    };

    const fetchMessages = async (sessionId) => {
        try {
            const res = await fetch(`${apiUrl}/api/chatbot/sessions/${sessionId}/messages?userId=${currentUser.uid}`);
            if (res.ok) {
                const data = await res.json();
                const formatted = data.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                if (formatted.length === 0) {
                    setMessages([initialMessage]);
                } else {
                    setMessages(formatted);
                }
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    const createNewSession = () => {
        setCurrentSessionId(null);
        setMessages([initialMessage]);
        setIsSidebarOpen(false);
    };

    const deleteSession = async (e, sessionId) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this conversation?")) return;

        try {
            const res = await fetch(`${apiUrl}/api/chatbot/sessions/${sessionId}?userId=${currentUser.uid}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setSessions(prev => prev.filter(s => s.id !== sessionId));
                if (currentSessionId === sessionId) {
                    createNewSession();
                }
            }
        } catch (error) {
            console.error("Failed to delete session", error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    };

    const handleSend = async (overrideText = null) => {
        const textToSend = typeof overrideText === 'string' ? overrideText : inputValue;
        if (!textToSend.trim()) return;

        const timestamp = new Date();
        const userText = textToSend;

        const userMessage = {
            id: Date.now(),
            text: userText,
            sender: 'user',
            timestamp: timestamp
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const payload = {
                message: userText,
                userId: currentUser.uid,
                sessionId: currentSessionId
            };

            // Call backend API here
            // Call backend API here
            const response = await fetch(`${apiUrl}/api/chatbot/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!currentSessionId && data.sessionId) {
                setCurrentSessionId(data.sessionId);
                fetchSessions();
            } else if (currentSessionId) {
                fetchSessions();
            }

            const botMessage = {
                id: Date.now() + 1,
                text: data.response || "I apologize, but I encountered an error processing your request.",
                sender: 'bot',
                timestamp: new Date(),
                jobs: data.jobs || []
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: "Connection failed. Please check your internet connection and try again.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSuggestedClick = (query) => {
        handleSend(query);
    };

    return (
        <div className="h-screen flex app-bg overflow-hidden relative font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
                fixed md:relative z-30 h-full w-80 backdrop-blur-xl text-white border-r transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Sidebar Header */}
                <div className="py-4 border-b" style={{ borderColor: 'rgba(52,232,158,0.15)' }}>
                    <button
                        onClick={createNewSession}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all active:scale-95 group" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}
                    >
                        <FiPlus className="text-xl group-hover:rotate-90 transition-transform" />
                        <span>New Conversation</span>
                    </button>
                </div>

                {/* Session List */}
                <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-hide">
                    {sessions.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm px-8 text-center">
                            <FiMessageSquare className="text-3xl mb-3 opacity-30" />
                            <p>No chat history.</p>
                            <p>Start a new conversation to begin.</p>
                        </div>
                    )}
                    {sessions.map(session => (
                        <div
                            key={session.id}
                            onClick={() => {
                                setCurrentSessionId(session.id);
                                setIsSidebarOpen(false);
                            }}
                            className={`group flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${currentSessionId === session.id
                                    ? 'border shadow-sm' : 'border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <FiMessageSquare className={`shrink-0 ${currentSessionId === session.id ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                <div className="truncate flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{session.title}</div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                        {new Date(session.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => deleteSession(e, session.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100/50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                                title="Delete Chat"
                            >
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* User Profile / Lower Sidebar */}
                <div className="p-5 border-t" style={{ borderColor: 'rgba(52,232,158,0.15)', background: 'rgba(7,24,37,0.4)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}>
                            {(userProfile?.name || currentUser?.displayName || currentUser?.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate" style={{ color: '#e2f8f0' }}>
                                {userProfile?.name || currentUser?.displayName || 'User'}
                            </div>
                            <div className="text-xs truncate" style={{ color: 'rgba(226,248,240,0.5)' }}>
                                {currentUser?.email}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col h-full min-w-0 relative w-full bg-transparent z-40">

                {/* Header */}
                <header className="backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0" style={{ background: 'rgba(7,24,37,0.85)', borderColor: 'rgba(52,232,158,0.15)' }}>
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
                        >
                            <FiMenu size={24} />
                        </button>

                        <div
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => navigate('/')}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}>
                                <FaLeaf size={20} />
                            </div>
                            <div>
                                <h1 className="text-lg font-extrabold leading-tight">
                                    <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #34e89e, #1aad72)' }}>Rizqa</span>
                                    <span style={{ color: '#e2f8f0' }}>AI</span>
                                </h1>
                                <div className="flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#34e89e' }}>Online</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Admin Dashboard Button */}
                        {userProfile?.role === 'admin' && (
                            <Link
                                to="/admin"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all" style={{ color: 'rgba(226,248,240,0.7)' }}
                            >
                                <FiSettings className="text-lg" />
                                <span className="hidden md:inline">Dashboard</span>
                            </Link>
                        )}

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:shadow-md transition-all shrink-0" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
                            title="Sign Out"
                        >
                            <FiLogOut className="text-lg" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </header>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth min-h-0">
                    <div className="w-full max-w-[95%] xl:max-w-[1600px] mx-auto space-y-6">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group animate-fade-in-up`}
                            >
                                {/* Bot Icon for Bot Messages */}
                                {message.sender === 'bot' && (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 shrink-0 shadow-sm border" style={{ background: 'rgba(52,232,158,0.15)', color: '#34e89e', borderColor: 'rgba(52,232,158,0.3)' }}>
                                        <FaBrain size={14} />
                                    </div>
                                )}

                                <div className={`flex flex-col max-w-[90%] md:max-w-[75%] lg:max-w-[60%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`
                                        p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap
                                        ${message.sender === 'user'
                                            ? 'rounded-br-sm text-[#071825]' : 'rounded-bl-sm border'
                                        }
                                    `}
                                    style={message.sender === 'user' ? { background: 'linear-gradient(135deg, #34e89e, #1aad72)' } : { background: 'rgba(15,52,67,0.85)', borderColor: 'rgba(52,232,158,0.2)', color: '#e2f8f0' }}
                                    >
                                        {message.text}
                                    </div>

                                    {/* Jobs Display */}
                                    {message.jobs && message.jobs.length > 0 && (
                                        <div className="mt-4 w-full space-y-3">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-1" style={{ color: '#34e89e' }}>
                                                <FiSearch />
                                                <span>{message.jobs.length} Found</span>
                                            </div>
                                            {message.jobs.map((job, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedJob(job)}
                                                    className="backdrop-blur-md rounded-xl p-4 shadow-md border hover:shadow-lg transition-all cursor-pointer group/job relative overflow-hidden" style={{ background: 'rgba(15,52,67,0.8)', borderColor: 'rgba(52,232,158,0.2)' }}
                                                >
                                                    <div className="absolute top-0 right-0 p-3">
                                                        <div className="text-[10px] font-bold px-2 py-1 rounded-full shadow-sm" style={{ background: 'rgba(52,232,158,0.15)', color: '#34e89e', border: '1px solid rgba(52,232,158,0.3)' }}>
                                                            {(90 + (idx * 2))}% Match
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0 pr-16">
                                                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 group-hover/job:text-teal-600 dark:group-hover/job:text-teal-400 transition-colors line-clamp-1">
                                                                {job.title}
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                                                                    <FaBuilding className="text-gray-400 dark:text-gray-500" />
                                                                    <span className="truncate max-w-[120px] font-medium">{job.company}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                                                                    <FaMapMarkerAlt className="text-gray-400 dark:text-gray-500" />
                                                                    <span className="truncate max-w-[100px] font-medium">{job.location}</span>
                                                                </div>
                                                                {job.salary && job.salary !== 'Not specified' && (
                                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md font-bold" style={{ background: 'rgba(52,232,158,0.1)', color: '#34e89e' }}>
                                                                        <FaMoneyBillWave />
                                                                        <span>{job.salary}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className={`text-[10px] mt-1.5 px-1 font-medium ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm border" style={{ background: 'rgba(52,232,158,0.15)', color: '#34e89e', borderColor: 'rgba(52,232,158,0.3)' }}>
                                    <FaBrain size={14} />
                                </div>
                                <div className="glass-panel border border-teal-400/20 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center">
                                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Suggested Queries */}
                {messages.length <= 1 && !currentSessionId && (
                    <div className="shrink-0 px-4 sm:px-6 pb-3 z-10 w-full">
                        <div className="w-full max-w-[95%] xl:max-w-[1600px] mx-auto">
                            <div className="flex gap-2 overflow-x-auto pb-2 justify-center hide-scrollbar flex-wrap">
                                {[
                                    "Waiter in Jerusalem",
                                    "דרוש נהג בתל אביב",
                                    "مطور برامج في حيفا",
                                    "Student Job",
                                    "עבודה במשרה חלקית"
                                ].map((query, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestedClick(query)}
                                        className="px-3 sm:px-4 py-2 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap hover:scale-105 shadow-sm" style={{ background: 'rgba(15,52,67,0.8)', border: '1px solid rgba(52,232,158,0.2)', color: '#34e89e' }}
                                    >
                                        {query}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Input Area (Floating Style) */}
                <div className="shrink-0 px-4 sm:px-8 pb-6 pt-2 z-20">
                    <div className="w-full max-w-[95%] xl:max-w-[1200px] mx-auto flex gap-3 relative backdrop-blur-xl p-2 rounded-2xl border" style={{ background: 'rgba(15,52,67,0.9)', boxShadow: '0 8px 30px -10px rgba(52,232,158,0.15)', borderColor: 'rgba(52,232,158,0.2)' }}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1 px-5 py-3.5 bg-transparent text-sm md:text-base focus:outline-none transition-all pl-5" style={{ color: '#e2f8f0' }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className="px-5 md:px-8 py-3.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #34e89e, #1aad72)', color: '#071825' }}
                        >
                            <span className="hidden md:inline">Send</span>
                            <FaPaperPlane className="transform -rotate-0 translate-y-[1px]" />
                        </button>
                    </div>
                </div>
            </main>

            {/* Job Details Modal */}
            {selectedJob && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex items-center justify-center p-4 md:p-6 animate-fade-in-up"
                    onClick={() => setSelectedJob(null)}
                >
                    <div
                        className="glass-panel rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-[#064e3b] text-white px-6 py-5 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    Job Details
                                    <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/30">95% Match</span>
                                </h2>
                                <p className="text-xs text-green-50 uppercase tracking-wider mt-1">✨ RizqaAI Recommended</p>
                            </div>
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-2 transition-all backdrop-blur-sm"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            <h3 className="text-2xl font-extrabold text-[#064e3b] dark:text-teal-400 mb-6 leading-tight">
                                {selectedJob.title}
                            </h3>

                            <div className="grid gap-4">
                                <div className="flex items-start gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/50 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-300 shadow-inner border border-white/50 dark:border-gray-600">
                                        <FaBuilding size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Company</div>
                                        <div className="text-base font-bold text-gray-900 dark:text-white">{selectedJob.company}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/50 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-300 shadow-inner border border-white/50 dark:border-gray-600">
                                        <FaMapMarkerAlt size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Location</div>
                                        <div className="text-base font-bold text-gray-900 dark:text-white">{selectedJob.location}</div>
                                    </div>
                                </div>

                                {selectedJob.salary && selectedJob.salary !== 'Not specified' && (
                                    <div className="flex items-start gap-4 p-4 bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm rounded-xl border border-green-200/50 dark:border-green-800/50 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 flex items-center justify-center text-green-600 dark:text-green-400 shadow-inner border border-green-300/50 dark:border-green-700">
                                            <FaMoneyBillWave size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs text-green-600 dark:text-green-500 uppercase font-bold mb-1">Salary Range</div>
                                            <div className="text-base font-bold text-green-700 dark:text-green-400">{selectedJob.salary}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-white/40 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-md shrink-0 flex flex-col gap-3">
                            <div className="flex gap-2">
                                <button className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-white/60 dark:bg-gray-700/60 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-all border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <FiBookmark size={16} />
                                    <span className="text-[10px] font-bold">Save</span>
                                </button>
                                <button className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-white/60 dark:bg-gray-700/60 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-all border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <FiShare2 size={16} />
                                    <span className="text-[10px] font-bold">Share</span>
                                </button>
                                <button className="flex-[2] flex flex-col items-center justify-center gap-1 py-2 bg-teal-50/80 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded-lg text-teal-700 dark:text-teal-400 transition-all border border-teal-200 dark:border-teal-800 shadow-sm">
                                    <FiHelpCircle size={16} />
                                    <span className="text-[10px] font-bold">Ask AI About This</span>
                                </button>
                            </div>
                            <a
                                href={selectedJob.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative flex items-center justify-center gap-2 w-full py-4 bg-[#064e3b] text-white font-bold rounded-xl hover:bg-[#085a44] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 overflow-hidden group"
                            >
                                <div className="absolute inset-0 w-full h-full animate-shimmer pointer-events-none opacity-50"></div>
                                <span className="relative z-10">Apply Now</span>
                                <FiArrowUpRight size={20} className="relative z-10 group-hover:rotate-12 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
