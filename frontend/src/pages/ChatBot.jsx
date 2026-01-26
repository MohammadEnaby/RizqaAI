import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaLeaf, FaRobot, FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaPaperPlane, FaUser } from 'react-icons/fa';
import { FiPlus, FiMessageSquare, FiTrash2, FiMenu, FiLogOut, FiSettings, FiX, FiMoreVertical, FiSearch, FiArrowUpRight } from 'react-icons/fi';

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

    // Initial greeting message
    const initialMessage = {
        id: 1,
        text: "Hello! I'm RizqaAI, your intelligent job assistant.\n\nI can help you find the perfect job from our live database. Try asking for specific roles and locations.\n\nExamples:\n• \"Find me a Waiter job in Jerusalem\"\n• \"Show Python developer roles in Tel Aviv\"",
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
            const res = await fetch(`/api/chatbot/sessions?userId=${currentUser.uid}`);
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
            const res = await fetch(`/api/chatbot/sessions/${sessionId}/messages?userId=${currentUser.uid}`);
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
            const res = await fetch(`/api/chatbot/sessions/${sessionId}?userId=${currentUser.uid}`, {
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

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const timestamp = new Date();
        const userText = inputValue;

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

            const response = await fetch(`/api/chatbot/query`, {
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
        const cleanQuery = query.replace(/^[^a-zA-Z0-9]+/, '');
        setInputValue(query);
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
                fixed md:relative z-30 h-full w-80 glass-panel border-r border-teal-400/20 transform transition-transform duration-300 ease-in-out flex flex-col
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-teal-400/20">
                    <button
                        onClick={createNewSession}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 group"
                    >
                        <FiPlus className="text-xl group-hover:rotate-90 transition-transform" />
                        <span>New Conversation</span>
                    </button>
                </div>

                {/* Session List */}
                <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 custom-scrollbar">
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
                            className={`
                                group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border
                                ${currentSessionId === session.id
                                    ? 'bg-white/60 border-teal-400/30 text-teal-900 shadow-sm'
                                    : 'border-transparent hover:bg-white/30 text-gray-700'}
                            `}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <FiMessageSquare className={`shrink-0 ${currentSessionId === session.id ? 'text-teal-600' : 'text-gray-400'}`} />
                                <div className="truncate flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{session.title}</div>
                                    <div className="text-[10px] text-gray-500">
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
                <div className="p-4 border-t border-teal-400/20 bg-white/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-sm">
                            {userProfile?.fullName?.[0] || currentUser?.email?.[0] || <FaUser />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                                {userProfile?.fullName || 'User'}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                                {currentUser?.email}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col h-full min-w-0 relative w-full">

                {/* Header */}
                <header className="glass-panel border-b-2 border-teal-400/20 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shrink-0">
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
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-green-500/30 group-hover:scale-105 transition-transform duration-300">
                                <FaLeaf size={20} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">Rizqa</span>
                                    <span className="text-gray-700">AI</span>
                                </h1>
                                <div className="flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-[10px] font-medium text-teal-600 uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Admin Dashboard Button */}
                        {userProfile?.role === 'admin' && (
                            <Link
                                to="/admin"
                                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-lg text-sm font-medium transition-all"
                            >
                                <FiSettings className="text-lg" />
                                <span className="hidden md:inline">Dashboard</span>
                            </Link>
                        )}

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border-2 border-red-100 text-red-500 rounded-xl text-xs sm:text-sm font-semibold hover:bg-red-50 hover:border-red-200 hover:shadow-md transition-all shrink-0"
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
                                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-3 mt-1 shrink-0 shadow-sm border border-teal-200">
                                        <FaRobot size={14} />
                                    </div>
                                )}

                                <div className={`flex flex-col max-w-[90%] md:max-w-[75%] lg:max-w-[60%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`rounded-2xl px-5 py-4 shadow-md text-sm md:text-base leading-relaxed whitespace-pre-wrap ${message.sender === 'user'
                                            ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-br-none'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                            }`}
                                    >
                                        {message.text}
                                    </div>

                                    {/* Jobs Display */}
                                    {message.jobs && message.jobs.length > 0 && (
                                        <div className="mt-4 w-full space-y-3">
                                            <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider px-1">
                                                <FiSearch />
                                                <span>{message.jobs.length} Found</span>
                                            </div>
                                            {message.jobs.map((job, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedJob(job)}
                                                    className="bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all cursor-pointer group/job relative overflow-hidden"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-gray-900 mb-1 group-hover/job:text-teal-600 transition-colors line-clamp-1">
                                                                {job.title}
                                                            </h4>
                                                            <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-gray-600">
                                                                <div className="flex items-center gap-1.5">
                                                                    <FaBuilding className="text-gray-400" />
                                                                    <span className="truncate max-w-[150px]">{job.company}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <FaMapMarkerAlt className="text-gray-400" />
                                                                    <span className="truncate max-w-[150px]">{job.location}</span>
                                                                </div>
                                                                {job.salary && job.salary !== 'Not specified' && (
                                                                    <div className="flex items-center gap-1.5 text-green-600 font-medium">
                                                                        <FaMoneyBillWave />
                                                                        <span>{job.salary}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover/job:bg-teal-50 group-hover/job:text-teal-600 transition-colors shrink-0">
                                                            <FiMoreVertical />
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
                                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mt-1 shadow-sm border border-teal-200">
                                    <FaRobot size={14} />
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
                                    "Driver in Tel Aviv",
                                    "Student Job",
                                    "Full Stack Developer",
                                    "Part time retail"
                                ].map((query, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestedClick(query)}
                                        className="px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-teal-400/30 rounded-full text-xs sm:text-sm font-semibold text-teal-700 hover:bg-white hover:border-teal-400 transition-all whitespace-nowrap hover:scale-105"
                                    >
                                        {query}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="shrink-0 glass-panel border-t-2 border-teal-400/20 px-4 py-4 sm:px-6 sm:py-5 z-20">
                    <div className="w-full max-w-[95%] xl:max-w-[1600px] mx-auto flex gap-3 relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your message..."
                            className="flex-1 px-5 py-3.5 bg-white border-2 border-gray-300 rounded-xl text-sm md:text-base focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm pl-5"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className="px-5 md:px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center gap-2"
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
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 md:p-6"
                    onClick={() => setSelectedJob(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-5 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-lg font-bold">Job Details</h2>
                                <p className="text-xs text-green-100 uppercase tracking-wider mt-0.5">RizqaAI Verified</p>
                            </div>
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="text-white/60 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                                {selectedJob.title}
                            </h3>

                            <div className="grid gap-4">
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-gray-600 shadow-sm border border-gray-100">
                                        <FaBuilding size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase font-bold mb-1">Company</div>
                                        <div className="text-base font-semibold text-gray-900">{selectedJob.company}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-gray-600 shadow-sm border border-gray-100">
                                        <FaMapMarkerAlt size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase font-bold mb-1">Location</div>
                                        <div className="text-base font-semibold text-gray-900">{selectedJob.location}</div>
                                    </div>
                                </div>

                                {selectedJob.salary && selectedJob.salary !== 'Not specified' && (
                                    <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-green-600 shadow-sm border border-green-100">
                                            <FaMoneyBillWave size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-green-600 uppercase font-bold mb-1">Salary Range</div>
                                            <div className="text-base font-bold text-green-700">{selectedJob.salary}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                            <a
                                href={selectedJob.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <span>Apply Now</span>
                                <FiArrowUpRight size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
