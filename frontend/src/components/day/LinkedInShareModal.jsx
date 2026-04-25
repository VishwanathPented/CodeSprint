import { useEffect, useState } from 'react';
import { X, Loader2, RefreshCw, Copy, CheckCircle2, ExternalLink } from 'lucide-react';

const LinkedInIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 18.34V10H5.67v8.34h2.67ZM7 8.83a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1Zm11.34 9.51v-4.57c0-2.45-1.31-3.6-3.06-3.6-1.41 0-2.04.78-2.39 1.32V10h-2.66c.04.75 0 8.34 0 8.34h2.66v-4.66c0-.24.02-.48.09-.65.18-.48.62-.97 1.36-.97.96 0 1.34.73 1.34 1.79v4.49h2.66Z" />
  </svg>
);
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/config';

export default function LinkedInShareModal({ isOpen, onClose, dayContext }) {
  const { token, user } = useAuth();
  const [post, setPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError('');
    setCopied(false);
    try {
      const res = await fetch(`${API_URL}/ai/linkedin-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          dayNumber: dayContext.dayNumber,
          dayTopic: dayContext.topicTitle,
          dayDescription: dayContext.description,
          mcqScore: dayContext.mcqScore,
          totalMcqs: dayContext.totalMcqs,
          codeAttempted: dayContext.codeAttempted,
          refactorPassed: dayContext.refactorPassed,
          streak: user?.streak
        })
      });
      const data = await res.json();
      if (res.ok) setPost(data.post);
      else setError(data.message || 'Failed to draft post.');
    } catch (e) {
      console.error(e);
      setError('Could not connect to the AI service.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate the first time the modal opens
  useEffect(() => {
    if (isOpen && !post && !loading) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  const handleOpenLinkedIn = async () => {
    // Best-effort UX: copy text, then open LinkedIn's compose page so the
    // user can paste. LinkedIn's share endpoints don't accept prefilled text,
    // so the copy-and-paste flow is the standard pattern.
    if (post) {
      try { await navigator.clipboard.writeText(post); } catch { /* ignore */ }
    }
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/50">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-50 to-sky-50 dark:from-slate-800 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center">
              <LinkedInIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white leading-tight">Share to LinkedIn</h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Day {dayContext.dayNumber} · {dayContext.topicTitle}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition rounded-full hover:bg-white dark:hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {loading && !post ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="animate-spin text-blue-500" size={28} />
              <p className="text-sm text-slate-500 font-medium">Drafting a post from today's progress...</p>
            </div>
          ) : (
            <>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Edit before sharing
              </label>
              <textarea
                value={post}
                onChange={(e) => setPost(e.target.value)}
                rows={12}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Your LinkedIn post will appear here..."
              />
              {error && (
                <p className="mt-3 text-sm text-rose-600 dark:text-rose-400 font-medium">{error}</p>
              )}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>{post.length} chars</span>
                <button
                  onClick={generate}
                  disabled={loading}
                  className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  Regenerate
                </button>
              </div>
            </>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={handleCopy}
            disabled={!post || loading}
            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy text'}
          </button>
          <button
            onClick={handleOpenLinkedIn}
            disabled={!post || loading}
            className="px-4 py-3 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition shadow-md shadow-blue-500/20"
          >
            <ExternalLink size={16} />
            Copy & Open LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
}
