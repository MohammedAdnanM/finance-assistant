/**
 * ChatCoach Component
 * Process: Interactive floating AI assistant that provides personalized financial coaching.
 *
 * Updated Functionality:
 *  - AI Brain: Upgraded from rule-based response to Google Gemini Flash for deep intelligence.
 *  - Premium UI: Floating glassmorphic interface with pulsating status indicators.
 *  - Contextual Awareness: Sends user's real financial summaries to the AI for expert advice.
 */
import React, { useState, useRef, useEffect } from "react";
import { 
    ChatBubbleLeftRightIcon, 
    XMarkIcon, 
    PaperAirplaneIcon,
    SparklesIcon,
    UserCircleIcon,
    CpuChipIcon
} from "@heroicons/react/24/outline";
import { api } from "../utils/api";

export default function ChatCoach() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { 
            role: "assistant", 
            content: "Hi! I'm your AI Financial Coach. Ask me anything about your spending, like 'How much did I spend on Food?' or 'Am I over budget?'",
            time: new Date()
        }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    async function sendMessage(e) {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: "user", content: input, time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await api.post("/chat", { message: input });
            if (res && res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { 
                    role: "assistant", 
                    content: data.response, 
                    time: new Date() 
                }]);
            } else {
                throw new Error("Failed");
            }
        } catch (err) {
            setMessages(prev => [...prev, { 
                role: "assistant", 
                content: "Sorry, I'm having trouble connecting to my brain right now. Is the backend running?", 
                time: new Date() 
            }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {/* CHAT WINDOW */}
            {isOpen && (
                <div className="absolute bottom-24 right-0 w-[400px] h-[600px] glass rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-entry">
                    
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner">
                                <SparklesIcon className="h-6 w-6 text-indigo-200" />
                            </div>
                            <div>
                                <h4 className="font-black text-base tracking-tight italic">AI Financial Coach</h4>
                                <div className="flex items-center gap-1.5 opacity-80">
                                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-indigo-100">Intelligent Active</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar dark:bg-obsidian/80">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group animate-entry stagger-${(i % 4) + 1}`}>
                                <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className="mt-1 shrink-0">
                                        {m.role === 'assistant' ? 
                                            <div className="h-9 w-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                                <CpuChipIcon className="h-5 w-5" />
                                            </div> : 
                                            <div className="h-9 w-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                                <UserCircleIcon className="h-5 w-5" />
                                            </div>
                                        }
                                    </div>
                                    <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed ${
                                        m.role === 'user' 
                                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-xl shadow-indigo-500/10' 
                                            : 'bg-white dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-white/5 shadow-sm'
                                    }`}>
                                        {m.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5 flex gap-1.5">
                                    <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.5s]"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={sendMessage} className="p-6 bg-white/50 dark:bg-obsidian/90 backdrop-blur-2xl border-t border-gray-100 dark:border-white/5">
                        <div className="flex gap-3">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your budget..."
                                className="flex-1 bg-gray-100 dark:bg-white/5 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white dark:placeholder:text-gray-500 outline-none"
                            />
                            <button 
                                type="submit"
                                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all active:scale-90 shadow-xl shadow-indigo-500/30"
                            >
                                <PaperAirplaneIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TOGGLE BUTTON */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-20 w-20 rounded-[2rem] flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-105 active:scale-90 relative group ${
                    isOpen 
                        ? 'bg-obsidian-light text-white rotate-180' 
                        : 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white animate-pulse-slow'
                }`}
            >
                {isOpen ? <XMarkIcon className="h-10 w-10 text-indigo-300" /> : <ChatBubbleLeftRightIcon className="h-10 w-10 drop-shadow-lg" />}
                
                {!isOpen && (
                    <div className="absolute inset-0 rounded-[2rem] ring-4 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all"></div>
                )}
            </button>
        </div>
    );
}
