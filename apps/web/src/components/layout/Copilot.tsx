'use client';

import { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, Brain, Bot } from 'lucide-react';

export function Copilot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hola, soy GMM Copilot. ¿En qué puedo ayudarte hoy con la gestión de siniestros?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/copilot', {
                method: 'POST',
                body: JSON.stringify({ message: input })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, perdí conexión con el OS. Intenta de nuevo más tarde.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-8 z-[100]">
            {isOpen ? (
                <div className="w-[380px] h-[550px] bg-slate-900 border border-medical-cyan/20 rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Chat Header */}
                    <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-medical-cyan/10 border border-medical-cyan/20">
                                <Bot className="w-5 h-5 text-medical-cyan" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white italic">GMM Copilot</h3>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-medical-emerald animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Link Active</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium ${
                                    m.role === 'user' 
                                    ? 'bg-medical-cyan text-slate-950 rounded-tr-none font-bold' 
                                    : 'bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-none leading-relaxed'}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl rounded-tl-none">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-medical-cyan rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-medical-cyan rounded-full animate-bounce delay-75" />
                                        <div className="w-1.5 h-1.5 bg-medical-cyan rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-6 bg-slate-950 border-t border-slate-800">
                        <div className="relative">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Pregúntame sobre tus siniestros..." 
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-medical-cyan/50 transition-all placeholder:text-slate-600 font-medium"
                            />
                            <button 
                                onClick={handleSend}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-medical-cyan text-slate-950 rounded-xl hover:scale-105 transition-all shadow-lg"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <p className="text-[9px] text-center text-slate-600 mt-4 font-black uppercase tracking-widest opacity-50">Inteligencia Artificial de GMM OS</p>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-medical-cyan text-slate-950 rounded-full flex items-center justify-center shadow-2xl shadow-medical-cyan/30 hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <MessageSquare size={28} className="relative z-10" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-medical-emerald rounded-full border-4 border-slate-950 animate-pulse" />
                </button>
            )}
        </div>
    );
}
