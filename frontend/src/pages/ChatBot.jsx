import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ChatBot() {
    const { userProfile, currentUser } = useAuth();
    const navigate = useNavigate();

    // Session State
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);

    // UI State
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
    const messagesEndRef = useRef(null);

    // Initial greeting message
    const initialMessage = {
        id: 1,
        text: "👋 Hi! I'm your AI job assistant. I can search our live database for you.\n\nFor best results, tell me the **Job Title** and **Location** you want.\nExample: \"Find me a **Waiter** job in **Jerusalem**\" or \"Show **Python** jobs in **Tel Aviv**\".",
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
                // Optional: Auto-select most recent session? For now, let user choose or start fresh.
                // If we want to restore last session:
                // if (data.length > 0) setCurrentSessionId(data[0].id);
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
                // Convert timestamp strings/objects to Date objects
                const formatted = data.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                // If history is empty (unlikely if session exists), show greeting? 
                // Better to just show history.
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
        setIsSidebarOpen(false); // Close sidebar on mobile after selection
    };

    const deleteSession = async (e, sessionId) => {
        e.stopPropagation(); // Prevent click from selecting the session
        if (!window.confirm("Delete this chat history?")) return;

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

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const timestamp = new Date();
        const userText = inputValue;

        // Optimistic UI update
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
                sessionId: currentSessionId // Send current ID (or null/undefined)
            };

            // Call backend API here
            // Call backend API here
            const response = await fetch(`/api/chatbot/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            // If we didn't have a session ID, the backend created one. Update state.
            if (!currentSessionId && data.sessionId) {
                setCurrentSessionId(data.sessionId);
                // Refresh sessions list to show the new one
                fetchSessions();
            } else if (currentSessionId) {
                // Just move this session to top of list visually (or re-fetch)
                fetchSessions();
            }

            const botMessage = {
                id: Date.now() + 1,
                text: data.response || "I'm sorry, I couldn't process that.",
                sender: 'bot',
                timestamp: new Date(),
                jobs: data.jobs || []
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: "Oops! connection failed.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSuggestedClick = (query) => {
        setInputValue(query.replace(/^[^\s]+\s/, '')); // Remove emoji
    };

    return (
        <div className="h-screen flex app-bg overflow-hidden relative">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 sm:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <div className={`
                fixed sm:relative z-30 h-full w-64 glass-panel border-r border-teal-400/20 transform transition-transform duration-300 ease-in-out flex flex-col
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
            `}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-teal-400/20">
                    <button
                        onClick={createNewSession}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                        <span>➕</span> New Chat
                    </button>
                </div>

                {/* Session List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sessions.length === 0 && (
                        <div className="text-center text-gray-500 text-sm mt-4 italic p-4">
                            No stored history yet. Start a conversation!
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
                                group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
                                ${currentSessionId === session.id
                                    ? 'bg-white/60 border border-teal-400/30 text-teal-900 shadow-sm'
                                    : 'hover:bg-white/30 text-gray-700'}
                            `}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-lg shrink-0">💬</span>
                                <div className="truncate">
                                    <div className="font-medium text-sm truncate">{session.title}</div>
                                    <div className="text-[10px] text-gray-500">
                                        {new Date(session.updatedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => deleteSession(e, session.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-all shrink-0"
                                title="Delete Chat"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>

                {/* Admin Link (Desktop Sidebar Location or Top?) 
                    User asked for a nav bar with past chats. 
                    The Admin button was previously in the Top Header.
                    I will keep it in the Top Header to separate concerns.
                */}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 relative w-full">

                {/* Header */}
                <div className="glass-panel border-b-2 border-teal-400/20 px-4 py-3 shrink-0 flex items-center gap-3">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="sm:hidden p-2 hover:bg-white/50 rounded-lg text-xl"
                    >
                        ☰
                    </button>

                    <div className="w-10 h-10 rounded-full theme-green-blue flex items-center justify-center shadow-lg animate-pulse-custom shrink-0">
                        <span className="text-xl">🤖</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold title-color truncate">AI Job Assistant</h1>
                        <div className="flex items-center gap-2 text-xs text-teal-600 font-medium">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span>Online</span>
                        </div>
                    </div>

                    {/* Admin Dashboard Button */}
                    {userProfile?.role === 'admin' && (
                        <Link
                            to="/admin"
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all shrink-0"
                        >
                            <span>⚙️</span>
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                    )}
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 min-h-0">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                            >
                                <div
                                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 ${message.sender === 'user'
                                        ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg'
                                        : 'glass-panel border-2 border-teal-400/20 text-gray-800'
                                        }`}
                                >
                                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>

                                    {message.jobs && message.jobs.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {message.jobs.map((job, idx) => (
                                                <div key={idx} className="bg-white/10 rounded-lg p-3 text-sm">
                                                    <div className="font-semibold">{job.title}</div>
                                                    <div className="text-xs opacity-90">{job.company} • {job.location}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className={`text-[10px] sm:text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start animate-fade-in-up">
                                <div className="glass-panel border-2 border-teal-400/20 rounded-2xl px-5 py-4">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Suggested Queries (Only show if new chat/empty) */}
                {messages.length <= 1 && !currentSessionId && (
                    <div className="shrink-0 px-2 sm:px-4 pb-3">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                                {[
                                    "💼 Find Python developer jobs",
                                    "💰 Average salary for data scientists",
                                    "🏢 Jobs at Google",
                                    "🔥 Remote React jobs",
                                    "📊 Tech jobs in Jerusalem"
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
                <div className="shrink-0 glass-panel border-t-2 border-teal-400/20 px-2 sm:px-4 py-3 sm:py-4 z-10">
                    <div className="max-w-4xl mx-auto flex gap-2 sm:gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything about jobs..."
                            className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-sm sm:text-base focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className="px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50"
                        >
                            <span className="hidden sm:inline">Send</span>
                            <span className="sm:hidden text-xl">📤</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
