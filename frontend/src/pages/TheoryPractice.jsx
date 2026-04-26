import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/config';
import {
  Loader2, Timer, ArrowRight, ArrowLeft, Flag, CheckCircle2, XCircle,
  Trophy, RotateCcw, Sparkles, Target
} from 'lucide-react';
import clsx from 'clsx';

const SECTION_LABEL = { os: 'OS', networks: 'Networks', oop: 'OOP' };
const SECTION_COLORS = {
  os: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  networks: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  oop: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
};

export default function TheoryPractice() {
  const [params] = useSearchParams();
  const { token, updateProgress, user } = useAuth();
  const navigate = useNavigate();

  const section = params.get('section') || 'mixed';
  const count = params.get('count') || '15';
  const topic = params.get('topic') || '';

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const url = `${API_URL}/theory/session?section=${section}&count=${count}` +
          (topic ? `&topic=${encodeURIComponent(topic)}` : '');
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.questions?.length) setQuestions(data.questions);
        else setError(data.message || 'No questions available.');
      } catch {
        setError('Failed to load questions.');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSession();
  }, [section, count, topic, token]);

  const current = questions[idx];
  const answered = answers[current?._id];
  const totalAnswered = Object.keys(answers).length;

  const handleSelect = (i) => current && setAnswers((prev) => ({ ...prev, [current._id]: i }));
  const handleNext = () => idx < questions.length - 1 && setIdx(idx + 1);
  const handlePrev = () => idx > 0 && setIdx(idx - 1);
  const handleSkip = () => { setAnswers((prev) => ({ ...prev, [current._id]: null })); handleNext(); };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = { answers: questions.map((q) => ({ questionId: q._id, selectedIndex: answers[q._id] ?? -1 })) };
    try {
      const res = await fetch(`${API_URL}/theory/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        if (user) updateProgress({ ...user, theoryProgress: data.theoryProgress });
      } else setError(data.message || 'Failed to submit.');
    } catch {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-primary-500" size={40} />
      <p className="text-slate-500 font-medium">Loading session...</p>
    </div>
  );
  if (error) return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <p className="text-red-600 font-bold mb-4">{error}</p>
      <Link to="/theory" className="text-primary-600 hover:underline">← Back</Link>
    </div>
  );
  if (result) return <TheoryResults result={result} section={section} count={count} onBack={() => navigate('/theory')} />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 flex-wrap">
        <Link to="/theory" className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1">
          <ArrowLeft size={14} /> Exit
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-slate-500 dark:text-slate-400">Question {idx + 1} / {questions.length}</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-slate-600 dark:text-slate-400">{totalAnswered} answered</span>
        </div>
        <QuestionTimer key={current._id} seconds={current.timeLimit || 45} onExpire={handleNext} />
      </div>

      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-300" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {questions.map((qq, i) => {
          const isDone = answers[qq._id] !== undefined && answers[qq._id] !== null;
          const isSkipped = answers[qq._id] === null;
          const isCurrent = i === idx;
          return (
            <button key={qq._id} onClick={() => setIdx(i)} className={clsx(
              'w-7 h-7 text-[11px] font-bold rounded-md border transition',
              isCurrent && 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900',
              isDone && 'bg-emerald-500 border-emerald-500 text-white',
              isSkipped && 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700',
              !isDone && !isSkipped && 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
            )}>{i + 1}</button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
          <span className={clsx('text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded', SECTION_COLORS[current.section])}>
            {SECTION_LABEL[current.section]}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">· {current.topic}</span>
          <span className={clsx(
            'text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ml-auto',
            current.difficulty === 'Hard' && 'text-rose-600 border-rose-200 bg-rose-50 dark:text-rose-300 dark:bg-rose-900/20 dark:border-rose-800/50',
            current.difficulty === 'Medium' && 'text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-800/50',
            current.difficulty === 'Easy' && 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-800/50'
          )}>{current.difficulty}</span>
        </div>

        <div className="p-6 space-y-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed">{current.question}</h2>
          <div className="space-y-2">
            {current.options.map((opt, i) => {
              const isSelected = answers[current._id] === i;
              return (
                <button key={i} onClick={() => handleSelect(i)} className={clsx(
                  'w-full text-left p-4 rounded-lg border-2 transition flex items-center gap-3 group',
                  isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )}>
                  <div className={clsx('w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 border-2', isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-500')}>{String.fromCharCode(65 + i)}</div>
                  <span className={clsx('text-sm', isSelected ? 'text-primary-900 dark:text-primary-200 font-semibold' : 'text-slate-700 dark:text-slate-300')}>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between gap-2">
          <button onClick={handlePrev} disabled={idx === 0} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
            <ArrowLeft size={14} /> Previous
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleSkip} className="px-4 py-2 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
              <Flag size={14} /> Skip
            </button>
            {idx < questions.length - 1 ? (
              <button onClick={handleNext} disabled={answered === undefined} className="px-5 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-md flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed">
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md flex items-center gap-1 disabled:opacity-50">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const QuestionTimer = ({ seconds, onExpire }) => {
  const [left, setLeft] = useState(seconds);
  const expired = useRef(false);
  useEffect(() => {
    expired.current = false;
    setLeft(seconds);
    const tick = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) { clearInterval(tick); if (!expired.current) { expired.current = true; onExpire?.(); } return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);
  const pct = (left / seconds) * 100;
  const urgent = pct < 25;
  return (
    <div className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-md border font-mono text-xs font-bold',
      urgent ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400 animate-pulse'
             : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300')}>
      <Timer size={14} />
      {String(Math.floor(left / 60))}:{String(left % 60).padStart(2, '0')}
    </div>
  );
};

const TheoryResults = ({ result, section, count, onBack }) => {
  const { summary, results } = result;
  const passed = summary.accuracy >= 60;
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className={clsx('relative overflow-hidden rounded-2xl p-5 sm:p-8 mb-6 text-center',
        passed ? 'bg-gradient-to-br from-violet-500 to-cyan-600 text-white' : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
      )}>
        <Trophy className="mx-auto mb-3 sm:mb-4 sm:w-12 sm:h-12" size={40} />
        <h1 className="text-3xl sm:text-4xl font-black mb-2">{summary.accuracy}%</h1>
        <p className="font-bold text-base sm:text-lg opacity-90 mb-1">{summary.correct} correct out of {summary.attempted}</p>
        <p className="text-sm opacity-80">{passed ? 'Solid grasp — keep drilling the weak topics.' : 'Below typical MCQ cutoff. Review the explanations and retry.'}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center">
          <Target className="mx-auto text-emerald-500 mb-2" size={20} />
          <p className="text-2xl font-black text-slate-900 dark:text-white">{summary.correct}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Correct</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center">
          <XCircle className="mx-auto text-rose-500 mb-2" size={20} />
          <p className="text-2xl font-black text-slate-900 dark:text-white">{summary.attempted - summary.correct}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Incorrect</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center">
          <Sparkles className="mx-auto text-indigo-500 mb-2" size={20} />
          <p className="text-2xl font-black text-slate-900 dark:text-white">{summary.accuracy}%</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Accuracy</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Review</h2>
      <div className="space-y-3">
        {results.map((r, i) => (
          <div key={r.questionId} className={clsx('p-5 rounded-lg border',
            r.isCorrect ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-800/50' : 'border-rose-200 bg-rose-50/50 dark:bg-rose-900/10 dark:border-rose-800/50'
          )}>
            <div className="flex items-start gap-3">
              <div className={clsx('shrink-0 w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs',
                r.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white')}>{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white mb-3">{r.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                  {r.options.map((opt, oi) => (
                    <div key={oi} className={clsx('text-xs p-2 rounded border',
                      oi === r.correctIndex && 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold',
                      oi === r.selectedIndex && oi !== r.correctIndex && 'bg-rose-100 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 font-bold line-through',
                      oi !== r.correctIndex && oi !== r.selectedIndex && 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                    )}>
                      <span className="font-mono mr-1">{String.fromCharCode(65 + oi)}.</span> {opt}
                    </div>
                  ))}
                </div>
                {r.explanation && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-3">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Explanation: </span>{r.explanation}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={`/theory/practice?section=${section}&count=${count}`} onClick={() => window.scrollTo(0, 0)} className="px-5 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-md flex items-center justify-center gap-2 hover:opacity-90">
          <RotateCcw size={16} /> Retry
        </Link>
        <button onClick={onBack} className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-md flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800">
          Back to Track
        </button>
      </div>
    </div>
  );
};
