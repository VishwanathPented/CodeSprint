import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Loader2, Sparkles, MinusCircle, Trash2, ArrowDownCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { API_URL } from '../../utils/config';

export default function AITutorBot({ dayNumber, dayTopic, token }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: `### 🤖 Welcome to Day ${dayNumber}!\n\nI'm your **Sprint-AI Tutor**. Stuck on "${dayTopic}"? Ask me for a logic hint or an analogy! Remember, I can't give you direct code solutions, but I'll guide you to the answer. ✨` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
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

  const clearChat = () => {
    if (window.confirm('Clear your chat history with Sprint-AI?')) {
      setMessages([
        { role: 'ai', text: `### 🤖 Session Reset\n\nI'm ready for more questions on **Day ${dayNumber}: ${dayTopic}**. What's on your mind?` }
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] sm:w-[420px] h-[600px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden mb-4 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-br from-indigo-600 via-primary-600 to-violet-600 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                  <Bot size={28} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Sprint-AI Tutor</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                    <p className="text-[10px] text-primary-100 uppercase tracking-widest font-black">Interactive Logic Guide</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={clearChat}
                  title="Clear Chat"
                  className="p-2 hover:bg-white/10 rounded-xl transition text-white/70 hover:text-white"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Context Breadcrumb */}
            <div className="mt-4 px-3 py-1.5 bg-white/10 rounded-lg text-[10px] items-center flex gap-2 w-fit backdrop-blur-sm border border-white/5">
               <span className="opacity-70 font-medium">CONTEXT:</span>
               <span className="font-black">Day {dayNumber} / {dayTopic}</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[90%] p-4 rounded-3xl shadow-sm text-sm leading-relaxed relative ${
                    m.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-none shadow-primary-500/20' 
                      : m.isError 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-slate-200/50'
                  }`}
                >
                  {/* Markdown Rendering */}
                  <div className={`prose prose-sm dark:prose-invert max-w-none ${m.role === 'user' ? 'text-white' : ''}`}>
                    <ReactMarkdown
                      components={{
                        p: ({children}) => <p className="mb-2 last:mb-0 leading-relaxed font-medium">{children}</p>,
                        strong: ({children}) => <strong className="font-black text-primary-800 dark:text-primary-300">{children}</strong>,
                        h3: ({children}) => <h3 className="text-base font-black mb-3 text-slate-900 dark:text-white flex items-center gap-2">{children}</h3>,
                        ul: ({children}) => <ul className="list-disc ml-4 space-y-1 mb-2">{children}</ul>,
                        li: ({children}) => <li className="text-slate-600 dark:text-slate-400">{children}</li>,
                        code: ({children}) => <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-primary-600 dark:text-primary-400 font-mono text-[12px]">{children}</code>
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] rounded-tl-none border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-xl">
                   <div className="relative">
                      <Loader2 size={18} className="animate-spin text-primary-500" />
                      <div className="absolute inset-0 bg-primary-500 blur-md opacity-20 animate-pulse" />
                   </div>
                   <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Bot is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
             <form onSubmit={handleSubmit} className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Need a hint on today's logic?"
                  className="w-full pl-5 pr-14 py-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800/80 transition-all font-medium text-sm text-slate-900 dark:text-white outline-none"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-2 p-3 bg-gradient-to-br from-primary-600 to-indigo-600 disabled:from-slate-400 disabled:to-slate-400 text-white rounded-xl transition transform hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/30"
                >
                  <Send size={20} />
                </button>
             </form>
             
             {/* Footer Info */}
             <div className="mt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-2 group">
                   <div className="flex -space-x-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                         <div key={i} className={`w-1.5 h-1.5 rounded-full border border-white dark:border-slate-900 transition-all ${i <= usageCount ? 'bg-primary-500 scale-110 shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      ))}
                   </div>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      Hints Used: {usageCount}/5
                   </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                   <Sparkles size={10} className="text-amber-500" />
                   <span className="text-[9px] font-bold text-slate-500 uppercase">Premium AI</span>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-primary-600 to-violet-600 text-white rounded-3xl shadow-[0_15px_30px_rgba(79,70,229,0.3)] flex items-center justify-center transform hover:scale-110 hover:-translate-y-1 active:scale-90 transition-all group relative border-4 border-white/20 dark:border-slate-900/20"
      >
        {isOpen ? (
          <MinusCircle size={32} className="text-white/90" />
        ) : (
          <div className="relative">
             <Bot size={32} />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-primary-600 animate-bounce" />
          </div>
        )}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-5 px-4 py-2 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-black rounded-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 pointer-events-none uppercase tracking-[0.2em] shadow-2xl border border-white/10">
            Ask Logic Bot
          </div>
        )}
      </button>
    </div>
  );
}
