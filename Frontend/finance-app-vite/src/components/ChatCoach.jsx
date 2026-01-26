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
                <div className="absolute bottom-20 right-0 w-[380px] h-[500px] bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    
                    {/* Header */}
                    <div className="p-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                <SparklesIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Financial Coach</h4>
                                <p className="text-[10px] text-blue-100 uppercase tracking-widest font-bold">Powered by AI</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-gray-50/50 dark:bg-gray-900/50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`mt-1 shrink-0`}>
                                        {m.role === 'assistant' ? 
                                            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                                <CpuChipIcon className="h-5 w-5" />
                                            </div> : 
                                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                                <UserCircleIcon className="h-5 w-5" />
                                            </div>
                                        }
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm ${
                                        m.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/20' 
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                                    }`}>
                                        {m.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 flex gap-1">
                                    <div className="h-1.5 w-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"></div>
                                    <div className="h-1.5 w-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce delay-75"></div>
                                    <div className="h-1.5 w-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-[#111827] border-t border-gray-100 dark:border-gray-800">
                        <div className="flex gap-2">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your question..."
                                className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                            />
                            <button 
                                type="submit"
                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                            >
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TOGGLE BUTTON */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isOpen 
                        ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900 rotate-90' 
                        : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                }`}
            >
                {isOpen ? <XMarkIcon className="h-8 w-8" /> : <ChatBubbleLeftRightIcon className="h-8 w-8" />}
                
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white dark:border-gray-900"></span>
                    </span>
                )}
            </button>
        </div>
    );
}
