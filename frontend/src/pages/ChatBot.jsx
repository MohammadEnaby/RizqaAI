import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ChatBot() {
    const { userProfile } = useAuth();
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "👋 Hi! I'm your AI job assistant. Ask me anything about jobs, salaries, companies, or skills!",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const suggestedQueries = [
        "💼 Find Python developer jobs",
        "💰 Average salary for data scientists",
        "🏢 Jobs at Google",
        "🔥 Remote React jobs",
        "📊 Tech jobs in Jerusalem"
    ];

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Call backend API here
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/chatbot/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: inputValue, userId: userProfile?.uid })
            });

            const data = await response.json();

            const botMessage = {
                id: Date.now() + 1,
                text: data.response || "I'm sorry, I couldn't process that. Please try again.",
                sender: 'bot',
                timestamp: new Date(),
                jobs: data.jobs || []
            };

            setTimeout(() => {
                setMessages(prev => [...prev, botMessage]);
                setIsTyping(false);
            }, 1000);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: "Oops! Something went wrong. Please try again.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsTyping(false);
        }
    };

    const handleSuggestedClick = (query) => {
        setInputValue(query.replace(/^[^\s]+\s/, '')); // Remove emoji
    };

    return (
        <div className="h-screen flex flex-col app-bg overflow-hidden">
            {/* Header */}
            <div className="glass-panel border-b-2 border-teal-400/20 px-4 sm:px-6 py-4 shrink-0">
                <div className="max-w-4xl mx-auto flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full theme-green-blue flex items-center justify-center shadow-lg animate-pulse-custom">
                        <span className="text-xl sm:text-2xl">🤖</span>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-lg sm:text-xl font-bold title-color">AI Job Assistant</h1>
                        <p className="text-xs sm:text-sm text-teal-600 font-medium flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Online & Ready to Help
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 sm:py-6 min-h-0">
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

                                <div className={`text-[10px] sm:text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                                    }`}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start animate-fade-in-up">
                            <div className="glass-panel border-2 border-teal-400/20 rounded-2xl px-5 py-4">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Suggested Queries */}
            <div className="shrink-0 px-2 sm:px-4 pb-3">
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                        {suggestedQueries.map((query, idx) => (
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

            {/* Input Area */}
            <div className="shrink-0 glass-panel border-t-2 border-teal-400/20 px-2 sm:px-4 py-3 sm:py-4">
                <div className="max-w-4xl mx-auto flex gap-2 sm:gap-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me anything about jobs..."
                        className="flex-1 px-4 sm:px-5 py-3 sm:py-4 bg-white border-2 border-gray-300 rounded-xl sm:rounded-2xl text-sm sm:text-base text-gray-900 placeholder-gray-400 font-medium focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                        className="px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <span className="hidden sm:inline">Send</span>
                        <span className="sm:hidden text-xl">📤</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
