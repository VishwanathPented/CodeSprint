import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Loader2, Sparkles, MinusCircle, AlertCircle } from 'lucide-react';
import { API_URL } from '../../utils/config';

export default function AITutorBot({ dayNumber, dayTopic, token }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi there! I'm your **Sprint-AI Tutor**. Stuck on "Day ${dayNumber}: ${dayTopic}"? Ask me for a logic hint!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          dayTopic,
          dayNumber
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        setUsageCount(data.usageCount);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: `⚠️ ${data.message}`, isError: true }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I lost connection to the matrix. Try again in a second!', isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Bot size={24} />
               </div>
               <div>
                  <h3 className="font-bold leading-none">Sprint-AI Tutor</h3>
                  <p className="text-[10px] text-primary-100 uppercase tracking-widest mt-1 font-bold">Logic Helper Mode</p>
               </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/20">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-none' 
                      : m.isError 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                   <Loader2 size={16} className="animate-spin text-primary-500" />
                   <span className="text-xs text-slate-400 font-medium tracking-tight">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
             <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for a logic hint..."
                  className="flex-grow px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500 dark:text-white"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl transition shadow-md"
                >
                  <Send size={18} />
                </button>
             </form>
             <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                   <Sparkles size={12} className="text-amber-500" />
                   AI Daily Hints: {usageCount}/5
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                   Powered by Gemini
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Launcher Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-primary-600 to-indigo-600 text-white rounded-2xl shadow-xl shadow-primary-500/30 flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all group relative"
      >
        {isOpen ? <MinusCircle size={28} /> : <MessageSquare size={28} />}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none uppercase tracking-widest shadow-xl">
            Need a Hint? Ask AI
          </div>
        )}
      </button>
    </div>
  );
}
