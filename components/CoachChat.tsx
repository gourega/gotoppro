import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createCoachChat } from '../services/geminiService';
import { MessageCircle, Send, X, Minus, ChevronUp } from 'lucide-react';
import { COACH_KITA_AVATAR } from '../constants';

const CoachChat: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    if (!isOpen && !chatRef.current) {
      chatRef.current = createCoachChat();
    }
    setIsOpen(!isOpen);
  };

  /**
   * Handles sending a message to the Gemini 3 Pro model.
   * Pro model provides better advice for complex salon management queries.
   */
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      if (!chatRef.current) chatRef.current = createCoachChat();
      
      // Sending message using the property .text of the response
      const response = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "Désolé, j'ai eu un petit souci. Peux-tu reformuler ?" }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Oups, ma connexion a sauté. Je suis toujours là pour toi !" }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Chat Window */}
      {isOpen ? (
        <div className="bg-white w-[350px] md:w-[400px] h-[550px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="bg-brand-900 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/20">
                <img src={COACH_KITA_AVATAR} alt="Coach" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-brand-400">Assistant Coach Kita</p>
                <p className="font-serif font-bold">Le Mentor Privé</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-5 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <div className="h-16 w-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <p className="text-slate-500 font-medium text-sm px-6">
                  "Bonjour {user.firstName}! Je suis ton mentor. Pose-moi n'importe quelle question sur ton salon."
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {["Comment fixer mes prix ?", "Motiver mon équipe", "Vendre plus de soins"].map(q => (
                    <button 
                      key={q} 
                      onClick={() => { setInput(q); }} 
                      className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-brand-500 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-brand-500 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Votre question..."
              className="flex-grow bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none font-medium"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-brand-600 text-white p-3 rounded-2xl hover:bg-brand-700 transition disabled:opacity-50 shadow-lg shadow-brand-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Button */
        <button 
          onClick={toggleChat}
          className="bg-brand-900 text-white h-16 w-16 rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 transition-all group overflow-hidden border-4 border-white"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <img src={COACH_KITA_AVATAR} alt="Coach Kita" className="w-full h-full object-cover" />
          </div>
          <MessageCircle className="w-7 h-7 group-hover:opacity-0 transition-opacity" />
        </button>
      )}
    </div>
  );
};

export default CoachChat;