import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/config';
import {
  Loader2, ArrowLeft, Play, Send, CheckCircle2, XCircle, Lightbulb,
  Code2, Bot, Target, Building2, BookOpen
} from 'lucide-react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';

export default function DsaProblem() {
  const { slug } = useParams();
  const { token, user, updateProgress } = useAuth();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solved, setSolved] = useState(false);

  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [activeHint, setActiveHint] = useState(0);
  const [showHints, setShowHints] = useState(false);

  const storageKey = `dsa_code_${slug}_${user?._id}`;

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(`${API_URL}/dsa/problem/${slug}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setProblem(data.problem);
          setSolved(data.solved);
          const saved = localStorage.getItem(storageKey);
          setCode(saved || data.problem.starterCode || '');
        }
      } catch {
        // silent — problem failed to load
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, token]);

  const handleCodeChange = (val) => {
    setCode(val || '');
    if (user) localStorage.setItem(storageKey, val || '');
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    setVerdict(null);
    try {
      const res = await fetch(`${API_URL}/compiler/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ language: 'java', code })
      });
      const data = await res.json();
      if (data.isError) setOutput({ error: data.output });
      else setOutput({ stdout: data.output });
    } catch {
      setOutput({ error: 'Failed to connect to execution server.' });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setVerdict(null);
    try {
      const res = await fetch(`${API_URL}/ai/grade-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          code,
          dayNumber: problem.order,
          dayTopic: problem.title,
          problemDescription: problem.description
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setVerdict({ passed: false, feedback: data.message });
        return;
      }
      setVerdict({ passed: data.passed, feedback: data.feedback });
      if (data.passed && !solved) {
        // Mark solved + update user progress
        const markRes = await fetch(`${API_URL}/dsa/mark-solved`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ slug })
        });
        const markData = await markRes.json();
        if (markRes.ok) {
          setSolved(true);
          if (user) updateProgress({ ...user, dsaProgress: markData.dsaProgress });
        }
      }
    } catch {
      setVerdict({ passed: false, feedback: 'Network error contacting AI grader.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-primary-500" size={40} />
        <p className="text-slate-500 font-medium">Loading problem...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <p className="text-red-600 font-bold mb-4">Problem not found.</p>
        <Link to="/dsa" className="text-primary-600 hover:underline">← Back to DSA track</Link>
      </div>
    );
  }

  const diffColor =
    problem.difficulty === 'Hard' ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50' :
    problem.difficulty === 'Medium' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50' :
    'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link to="/dsa" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-4">
        <ArrowLeft size={14} /> Back to DSA track
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: problem */}
        <aside className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={clsx('text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border', diffColor)}>
                {problem.difficulty}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{problem.topic}</span>
              {solved && (
                <span className="ml-auto flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800/50">
                  <CheckCircle2 size={12} /> Solved
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-3 break-words">{problem.title}</h1>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{problem.description}</ReactMarkdown>
            </div>

            {problem.constraints && (
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                  <Target size={10} /> Constraints
                </p>
                <pre className="text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{problem.constraints}</pre>
              </div>
            )}

            {problem.companies?.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1">
                  <Building2 size={10} /> Asked at
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {problem.companies.map((c) => (
                    <span key={c} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sample tests */}
          {problem.sampleTests?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="text-slate-500" size={14} />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Sample Tests</h3>
              </div>
              <div className="space-y-2">
                {problem.sampleTests.map((t, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-3 text-xs font-mono">
                    <div className="text-slate-500 dark:text-slate-400">Input: <span className="text-slate-700 dark:text-slate-200">{t.input}</span></div>
                    <div className="text-slate-500 dark:text-slate-400">Expected: <span className="text-emerald-600 dark:text-emerald-400">{t.expectedOutput}</span></div>
                    {t.explanation && <div className="text-slate-500 italic mt-1">{t.explanation}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hints */}
          {problem.hints?.length > 0 && (
            <div className="bg-amber-50/70 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/50 p-5">
              <button
                onClick={() => setShowHints((s) => !s)}
                className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold text-sm hover:underline"
              >
                <Lightbulb size={14} /> {showHints ? 'Hide hints' : `Show ${problem.hints.length} hint${problem.hints.length > 1 ? 's' : ''}`}
              </button>
              {showHints && (
                <div className="mt-3 space-y-2">
                  {problem.hints.slice(0, activeHint + 1).map((h, i) => (
                    <div key={i} className="text-xs text-amber-900 dark:text-amber-200 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 rounded-md p-2">
                      <span className="font-bold">Hint {i + 1}:</span> {h}
                    </div>
                  ))}
                  {activeHint < problem.hints.length - 1 && (
                    <button onClick={() => setActiveHint((a) => a + 1)} className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline">
                      Reveal next hint →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Right: editor */}
        <main className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Code2 className="text-slate-500" size={14} />
                <span className="font-bold text-slate-700 dark:text-slate-300">Main.java</span>
              </div>
              <span className="text-slate-400">Java 17</span>
            </div>

            <div className="h-[320px] sm:h-[380px] lg:h-[460px] bg-[#1e1e1e]">
              <Editor
                height="100%"
                defaultLanguage="java"
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  padding: { top: 12 },
                  scrollBeyondLastLine: false,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace"
                }}
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 grid grid-cols-2 gap-2">
              <button
                onClick={handleRun}
                disabled={running || submitting}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-md transition flex justify-center items-center gap-2 text-sm border border-slate-200 dark:border-slate-700 disabled:opacity-50"
              >
                {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || running}
                className={clsx(
                  'py-2.5 font-semibold rounded-md flex justify-center items-center gap-2 text-sm transition border',
                  solved
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-300'
                    : 'bg-slate-900 border-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:border-white dark:text-slate-900 dark:hover:bg-slate-200'
                )}
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {solved ? 'Resubmit (already solved)' : 'Submit for AI Grading'}
              </button>
              <div className="col-span-2 text-center mt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                  <Bot size={10} className="text-slate-500" /> Graded by Sprint-AI
                </span>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="mt-4 bg-slate-900 border border-slate-800 rounded-md overflow-hidden">
            <div className="bg-slate-800 px-3 py-1.5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex justify-between items-center">
              <span>Console Output</span>
              {running && <Loader2 size={12} className="animate-spin text-slate-300" />}
            </div>
            <div className="p-4 font-mono text-xs overflow-y-auto min-h-[100px] max-h-[200px] bg-black text-slate-300">
              {!output && !running && <span className="text-slate-600">Click Run to execute. Submit when ready for AI grading.</span>}
              {output?.error && <span className="text-red-400 break-words whitespace-pre-wrap">{output.error}</span>}
              {output?.stdout && <span className="text-emerald-400 break-words whitespace-pre-wrap">{output.stdout}</span>}
              {output && !output.error && !output.stdout && <span className="text-slate-500">Program exited with no output.</span>}
            </div>
          </div>

          {/* AI Verdict */}
          {verdict && (
            <div className={clsx(
              'mt-4 p-4 rounded-lg flex gap-3 items-start border',
              verdict.passed
                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
            )}>
              <div className="mt-0.5 shrink-0">
                {verdict.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              </div>
              <div>
                <h6 className="font-bold text-sm mb-1">{verdict.passed ? 'Accepted!' : 'Not yet correct'}</h6>
                <p className="text-xs leading-relaxed opacity-90 whitespace-pre-wrap">{verdict.feedback}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
