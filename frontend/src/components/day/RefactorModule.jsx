import { useState } from 'react';
import { Sparkles, Github, Code2, ShieldAlert, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { API_URL } from '../../utils/config';

export default function RefactorModule({ problem, dayTopic, onComplete, isCompleted }) {
  const [githubUrl, setGithubUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [passed, setPassed] = useState(false);
  const [error, setError] = useState('');

  if (!problem) return null;
  if (isCompleted || passed) {
    return (
      <div className="bg-amber-900/10 rounded-2xl p-6 border border-amber-500/20 text-center">
         <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500/50">
           <Sparkles size={32} className="text-amber-500" />
         </div>
         <h3 className="text-xl font-black text-amber-500 mb-2">Clean Code Master!</h3>
         <p className="text-slate-400">You successfully refactored the messy code to professional standards.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;

    setLoading(true);
    setError('');
    setFeedback(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/ai/grade-refactor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          githubUrl,
          targetTopic: dayTopic,
          refactorDescription: problem.description,
          messyCode: problem.messyCode
        })
      });

      const data = await res.json();

      if (res.ok) {
        setPassed(data.passed);
        setFeedback(data.feedback);
        if (data.passed) {
          onComplete(githubUrl);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to reach Sprint-AI Grader. Are you connected to the internet?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex items-center gap-3 text-white mb-2 relative z-10">
           <ShieldAlert size={28} className="text-amber-200" />
           <h2 className="text-2xl font-black">Fix The Bug: Clean Code Challenge</h2>
        </div>
        <p className="text-amber-100 font-medium relative z-10 opacity-90">{problem.title}</p>
      </div>

      <div className="p-6 md:p-8">
        {/* The Messy Code block */}
        <div className="mb-8">
          <h3 className="text-slate-200 font-bold mb-3 flex items-center gap-2">
            <Code2 size={18} className="text-amber-500" />
            The Messy Code
          </h3>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">{problem.description}</p>
          <div className="relative group">
            <pre className="bg-black/80 text-amber-500 font-mono text-sm p-5 rounded-xl border border-red-900/50 overflow-x-auto">
              <code>{problem.messyCode}</code>
            </pre>
          </div>
        </div>

        <div className="h-px bg-slate-800 w-full mb-8"></div>

        {/* Action Area */}
        <div>
           <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
            <Github size={18} />
            Submit Your Refactor
          </h3>
          <ul className="text-sm text-slate-400 space-y-2 mb-6 ml-2 border-l-2 border-slate-700 pl-4">
             <li>1. Copy the messy code into a new <code className="text-primary-400 font-bold">Main.java</code> file.</li>
             <li>2. Refactor it using better naming, DRY logic, and readability.</li>
             <li>3. Push your cleaned-up code to GitHub.</li>
             <li>4. Paste the direct raw link here for Sprint-AI review.</li>
          </ul>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="url"
                required
                placeholder="https://github.com/yourname/repo/blob/main/Main.java"
                value={githubUrl}
                onChange={(e) => {
                  setGithubUrl(e.target.value);
                  setError('');
                }}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-mono text-sm"
              />
              <button 
                type="submit"
                disabled={loading || !githubUrl.trim()}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-xl transition flex text-center items-center justify-center min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-amber-900/40"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'AI Review'}
              </button>
            </div>
          </form>

          {/* Feedback Blocks */}
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-400 text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          {feedback && !passed && (
             <div className="mt-4 p-4 bg-orange-900/20 border border-orange-900/50 rounded-xl">
               <div className="flex items-center gap-2 text-orange-400 font-bold mb-2">
                 <span>Code Review Failed</span>
               </div>
               <p className="text-orange-200 text-sm">{feedback}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
