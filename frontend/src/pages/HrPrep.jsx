import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/config';
import {
  MessageSquareText, Loader2, Sparkles, Lightbulb, Eye, EyeOff, Send,
  CheckCircle2, XCircle, Target, TrendingUp, Volume2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';

const CATEGORY_LABEL = {
  introduction: 'Introduction',
  behavioral: 'Behavioral (STAR)',
  strengths: 'Strengths & Weaknesses',
  career: 'Career & Motivation',
  situational: 'Situational',
  closing: 'Closing'
};

const CATEGORY_COLORS = {
  introduction: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50',
  behavioral: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
  strengths: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
  career: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800/50',
  situational: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800/50',
  closing: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50'
};

export default function HrPrep() {
  const { token } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');

  const [answerDrafts, setAnswerDrafts] = useState({});
  const [showSample, setShowSample] = useState(false);
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [gradeError, setGradeError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_URL}/hr/questions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setQuestions(data.questions);
          if (data.questions.length && !selectedId) setSelectedId(data.questions[0]._id);
        }
      } catch {
        // silent — questions failed to load
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = useMemo(() => {
    if (filter === 'all') return questions;
    return questions.filter((q) => q.category === filter);
  }, [filter, questions]);

  const selected = useMemo(() => questions.find((q) => q._id === selectedId), [questions, selectedId]);
  const draft = selected ? (answerDrafts[selected._id] ?? '') : '';

  const selectQuestion = (id) => {
    setSelectedId(id);
    setShowSample(false);
    setFeedback(null);
    setGradeError(null);
  };

  const handleDraftChange = (val) => {
    setAnswerDrafts((prev) => ({ ...prev, [selected._id]: val }));
  };

  const handleGrade = async () => {
    if (!selected || !draft.trim()) return;
    setGrading(true);
    setGradeError(null);
    setFeedback(null);
    try {
      const res = await fetch(`${API_URL}/ai/hr-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question: selected.question,
          answer: draft,
          framework: selected.framework
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setGradeError(data.message || 'Failed to grade.');
        return;
      }
      setFeedback(data);
      // Persist practice record
      fetch(`${API_URL}/hr/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          questionId: selected._id,
          question: selected.question,
          answer: draft,
          feedback: data.verdict,
          score: data.score
        })
      }).catch(() => {});
    } catch {
      setGradeError('Network error contacting AI.');
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-primary-500" size={40} />
        <p className="text-slate-500 font-medium">Loading HR prep...</p>
      </div>
    );
  }

  const practicedCount = questions.filter((q) => q.practiced).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 border border-slate-800 p-8 mb-8">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-rose-500/10 blur-3xl rounded-full" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-4">
            <MessageSquareText className="text-rose-300" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">HR Interview Prep</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Practice your answers. Get AI feedback.
          </h1>
          <p className="text-slate-300 max-w-2xl">
            15 of the most-asked HR questions. Write your answer, then let Sprint-AI grade you on structure, specificity, authenticity, and impact.
          </p>
          <div className="mt-5 inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <Target className="text-emerald-400" size={16} />
            <span className="text-sm font-bold text-white">{practicedCount} / {questions.length} practiced</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: question list */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-20 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <FilterPill label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
              {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                <FilterPill key={key} label={label} active={filter === key} onClick={() => setFilter(key)} />
              ))}
            </div>
            <div className="space-y-1 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
              {filtered.map((q) => (
                <button
                  key={q._id}
                  onClick={() => selectQuestion(q._id)}
                  className={clsx(
                    'w-full text-left p-3 rounded-lg border transition group',
                    selectedId === q._id
                      ? 'bg-white dark:bg-slate-900 border-primary-400 dark:border-primary-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <span className={clsx(
                      'text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0',
                      CATEGORY_COLORS[q.category]
                    )}>
                      {CATEGORY_LABEL[q.category]}
                    </span>
                    {q.practiced && (
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className={clsx('text-xs font-semibold leading-snug line-clamp-2', selectedId === q._id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300')}>
                    {q.question}
                  </p>
                  {q.lastScore !== null && q.lastScore !== undefined && (
                    <p className="text-[10px] font-bold text-slate-400 mt-1">Last: {q.lastScore}/100</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right: detail */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-5">
          {!selected ? (
            <p className="text-center text-slate-500 p-10">Select a question to begin practicing.</p>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <span className={clsx('text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border inline-block mb-3', CATEGORY_COLORS[selected.category])}>
                  {CATEGORY_LABEL[selected.category]}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-snug mb-4">
                  {selected.question}
                </h2>

                <div className="bg-amber-50/70 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="text-amber-600 dark:text-amber-400" size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">Framework</span>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-strong:text-amber-900 dark:prose-strong:text-amber-200">
                    <ReactMarkdown>{selected.framework}</ReactMarkdown>
                  </div>
                </div>

                {selected.tips?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Interviewer tells</p>
                    <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      {selected.tips.map((t, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-slate-400">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Answer area */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Volume2 size={16} /> Your Answer
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{draft.length} chars · aim for 400–900</span>
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => handleDraftChange(e.target.value)}
                  placeholder="Type your answer here. Pretend you're speaking it out loud."
                  className="w-full min-h-[180px] p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y text-sm leading-relaxed"
                />
                <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-between">
                  <button
                    onClick={() => setShowSample((s) => !s)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                  >
                    {showSample ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showSample ? 'Hide sample answer' : 'Peek at sample answer'}
                  </button>
                  <button
                    onClick={handleGrade}
                    disabled={grading || draft.trim().length < 30}
                    className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 rounded-md flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {grading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Get AI Feedback
                  </button>
                </div>
                {gradeError && (
                  <p className="mt-3 text-xs text-red-600 dark:text-red-400">{gradeError}</p>
                )}
              </div>

              {showSample && (
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800/50 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="text-emerald-600 dark:text-emerald-400" size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">Sample answer</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 italic">"{selected.sampleAnswer}"</p>
                  <p className="text-[10px] text-slate-500 mt-3">This is one example — your own answer should be authentically yours.</p>
                </div>
              )}

              {feedback && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className={clsx(
                    'p-6 text-center text-white',
                    feedback.score >= 75 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                    feedback.score >= 50 ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                    'bg-gradient-to-br from-rose-500 to-pink-600'
                  )}>
                    <Sparkles className="mx-auto mb-2" size={28} />
                    <p className="text-5xl font-black mb-1">{feedback.score}<span className="text-2xl opacity-70">/100</span></p>
                    <p className="text-sm opacity-90 italic mt-2 max-w-lg mx-auto">"{feedback.verdict}"</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
                    <ScoreCell label="Structure" value={feedback.structure} />
                    <ScoreCell label="Specificity" value={feedback.specificity} />
                    <ScoreCell label="Authenticity" value={feedback.authenticity} />
                    <ScoreCell label="Impact" value={feedback.impact} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="text-emerald-500" size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Strengths</span>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        {feedback.strengths?.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <TrendingUp className="text-emerald-500 shrink-0 mt-0.5" size={13} />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="text-rose-500" size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-700 dark:text-rose-400">Improvements</span>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        {feedback.improvements?.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <Send className="text-rose-500 shrink-0 mt-0.5" size={13} />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={clsx(
      'text-[11px] font-bold px-2.5 py-1 rounded-md border transition',
      active
        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
    )}
  >
    {label}
  </button>
);

const ScoreCell = ({ label, value }) => (
  <div className="p-4 text-center">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className="text-2xl font-black text-slate-900 dark:text-white">{value}<span className="text-sm text-slate-400">/10</span></p>
  </div>
);
