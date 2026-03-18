import { useState } from 'react';
import { Github, ExternalLink, CheckCircle2, Copy, AlertCircle, Info, Loader2, Bot, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/config';

export default function GithubSubmissionModule({ problem, dayNumber, dayTopic, onComplete, isCompleted, existingLink }) {
  const { token } = useAuth();
  const [githubLink, setGithubLink] = useState(existingLink || '');
  const [loading, setLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);

  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(problem.starterCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!githubLink.includes('github.com')) {
      setAiFeedback({ passed: false, text: 'Please enter a valid github.com domain URL.' });
      return;
    }
    
    setLoading(true);
    setAiFeedback(null);

    try {
      const res = await fetch(`${API_URL}/ai/grade-github`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          githubUrl: githubLink,
          dayNumber,
          dayTopic,
          problemDescription: problem.description
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setAiFeedback({ passed: false, text: data.message });
      } else {
        setAiFeedback({ passed: data.passed, text: data.feedback });
        if (data.passed) {
          onComplete(githubLink);
        }
      }
    } catch (err) {
      setAiFeedback({ passed: false, text: 'Network error verifying the link. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Github className="text-slate-700 dark:text-slate-300" size={20} />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Coding Challenge</h3>
        </div>
        {isCompleted && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
            <CheckCircle2 size={14} /> Submitted
          </span>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Problem Description */}
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{problem.title}</h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
            {problem.description}
          </p>
          
          <div className="bg-slate-900 rounded-xl p-4 relative group">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
              <button 
                onClick={handleCopy}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md flex items-center gap-1 text-[10px] font-bold uppercase transition"
              >
                {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
            <pre className="text-emerald-400 font-mono text-xs overflow-x-auto">
              <code>{problem.starterCode}</code>
            </pre>
          </div>
        </div>

        {/* Action Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="space-y-4">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Info size={16} className="text-primary-500" /> Instructions
            </h5>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc pl-4">
              <li>Copy the starter code to your IDE (VS Code/IntelliJ).</li>
              <li>Complete the challenge and verify the output locally.</li>
              <li>Push your solution to your GitHub repository.</li>
              <li>Paste the link to the <strong>Main.java</strong> file below.</li>
            </ul>
            <button 
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-xs font-bold text-primary-600 hover:underline"
            >
              {showInstructions ? 'Hide Git Tutorial' : 'Show Help: How to use Git?'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <h5 className="font-bold text-slate-800 dark:text-slate-200">Submit Solution</h5>
            <div className="relative">
              <input 
                type="url"
                required
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                disabled={isCompleted}
                placeholder="https://github.com/user/repo/blob/main/Day1/Main.java"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition"
              />
              <Github className="absolute right-3 top-3 text-slate-400" size={18} />
            </div>
            <button 
              type="submit"
              disabled={isCompleted || loading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${isCompleted || loading ? 'bg-slate-100 dark:bg-slate-700 text-slate-400' : 'bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800'}`}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ExternalLink size={18} />}
              {isCompleted ? 'AI Verified & Locked' : loading ? 'AI Validator Grading...' : 'Verify Code Logic & Submit'}
            </button>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1"><Bot size={12} className="text-indigo-500"/> Verified by Sprint-AI</span>
            </div>
            
            {/* AI Feedback Display */}
            {aiFeedback && !isCompleted && (
              <div className={`p-4 rounded-xl flex gap-3 items-start animate-in slide-in-from-bottom-2 ${aiFeedback.passed ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'}`}>
                <div className="mt-0.5 mt-1 shrink-0">
                  {aiFeedback.passed ? <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400"/> : <XCircle size={18} className="text-red-600 dark:text-red-400"/>}
                </div>
                <div>
                  <h6 className="font-bold text-sm mb-1">{aiFeedback.passed ? 'Code Approved!' : 'Verification Failed'}</h6>
                  <p className="text-xs leading-relaxed opacity-90">{aiFeedback.text}</p>
                </div>
              </div>
            )}

            {/* Completed state message */}
            {isCompleted && !aiFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-sm font-bold animate-in fade-in">
                <CheckCircle2 size={16} /> Solution previously verified.
              </div>
            )}
          </form>
        </div>

        {/* Simple Git Tutorial Modal/Section */}
        {showInstructions && (
          <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl animate-in fade-in slide-in-from-top-2">
            <h6 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
              <AlertCircle size={16} /> Git Quick Start
            </h6>
            <div className="space-y-3 font-mono text-[11px] text-blue-700 dark:text-blue-400">
              <p>1. Initialize repo (first time only):<br/> <code className="bg-blue-100 dark:bg-slate-800 px-1 rounded">git init</code></p>
              <p>2. Add your files:<br/> <code className="bg-blue-100 dark:bg-slate-800 px-1 rounded">git add Day1/Main.java</code></p>
              <p>3. Commit changes:<br/> <code className="bg-blue-100 dark:bg-slate-800 px-1 rounded">git commit -m "Day 1 Complete"</code></p>
              <p>4. Push to GitHub:<br/> <code className="bg-blue-100 dark:bg-slate-800 px-1 rounded">git push origin main</code></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
