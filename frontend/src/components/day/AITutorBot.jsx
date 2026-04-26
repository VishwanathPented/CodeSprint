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
  const [rubberDuckMode, setRubberDuckMode] = useState(false);
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
          dayNumber,
          rubberDuckMode
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        setUsageCount(data.usageCount);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: `⚠️ ${data.message}`, isError: true }]);
      }
    } catch {
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end max-w-[calc(100vw-2rem)]">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[380px] md:w-[420px] h-[min(600px,calc(100vh-6rem))] bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden mb-4 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 relative text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center border border-slate-300 dark:border-slate-700">
                  <Bot size={24} className="text-slate-700 dark:text-slate-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Sprint-AI Tutor</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Interactive Guide</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 text-slate-500 dark:text-slate-400">
                <button 
                  onClick={clearChat}
                  title="Clear Chat"
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition hover:text-slate-900 dark:hover:text-white"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition hover:text-slate-900 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Context Breadcrumb */}
            <div className="mt-3 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] items-center flex gap-2 w-fit">
               <span className="text-slate-500 dark:text-slate-400 font-bold">CONTEXT:</span>
               <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">Day {dayNumber} / {dayTopic}</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white dark:bg-slate-900">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-md text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' 
                      : m.isError 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* Markdown Rendering */}
                  <div className={`prose prose-sm dark:prose-invert max-w-none ${m.role === 'user' ? 'text-white dark:text-slate-900 marker:text-white dark:marker:text-slate-900' : ''}`}>
                    <ReactMarkdown
                      components={{
                        p: ({children}) => <p className="mb-2 last:mb-0 leading-relaxed font-medium">{children}</p>,
                        strong: ({children}) => <strong className="font-black">{children}</strong>,
                        h3: ({children}) => <h3 className="text-[13px] font-bold mb-2 uppercase tracking-wide opacity-80 flex items-center gap-2">{children}</h3>,
                        ul: ({children}) => <ul className="list-disc ml-4 space-y-1 mb-2">{children}</ul>,
                        li: ({children}) => <li>{children}</li>,
                        code: ({children}) => <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-[11px] font-bold">{children}</code>
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
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                   <Loader2 size={14} className="animate-spin text-slate-500" />
                   <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
             
             {/* Rubber Duck Toggle */}
             <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-md border border-slate-200 dark:border-slate-700">
               <label className="flex items-center gap-2 cursor-pointer">
                 <div className="relative">
                   <input type="checkbox" className="sr-only" checked={rubberDuckMode} onChange={(e) => setRubberDuckMode(e.target.checked)} />
                   <div className={`block w-8 h-4 rounded-full transition ${rubberDuckMode ? 'bg-slate-800 dark:bg-slate-300' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                   <div className={`dot absolute left-1 top-1 bg-white dark:bg-slate-900 w-2 h-2 rounded-full transition transform ${rubberDuckMode ? 'translate-x-4' : ''}`}></div>
                 </div>
                 <span className={`text-[10px] font-bold uppercase tracking-wider ${rubberDuckMode ? 'text-slate-800 dark:text-slate-300' : 'text-slate-400'}`}>
                   Rubber Duck Mode
                 </span>
               </label>
               {rubberDuckMode && (
                 <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Socratic Only</span>
               )}
             </div>

             <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={rubberDuckMode ? "Explain your code..." : "Ask a question..."}
                  className="flex-grow px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-slate-500 dark:focus:border-slate-400 transition"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition flex items-center justify-center font-bold text-sm"
                >
                  <Send size={16} />
                </button>
             </form>
             
             {/* Footer Info */}
             <div className="mt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-2 group">
                   <div className="flex -space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                         <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i <= usageCount ? 'bg-slate-800 dark:bg-white scale-110' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      ))}
                   </div>
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      Uses: {usageCount}/5
                   </span>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg shadow-md border-2 border-slate-800 dark:border-white flex items-center justify-center transform hover:-translate-y-1 active:scale-95 transition-all group relative"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className="relative">
             <Bot size={24} />
             <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 dark:border-white animate-pulse" />
          </div>
        )}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-4 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest border border-slate-800 dark:border-slate-200 shadow-lg">
            Sprint-AI Tutor
          </div>
        )}
      </button>
    </div>
  );
}
