import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/config';
import {
  Brain, Loader2, ArrowRight, CheckCircle2, XCircle, Sparkles,
  RotateCw, Trophy, BookMarked, Calendar, ArrowLeft
} from 'lucide-react';
import clsx from 'clsx';

const QTYPE_LABEL = { aptitude: 'Aptitude', theory: 'CS Core' };
const QTYPE_COLOR = {
  aptitude: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
  theory: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800/50'
};

export default function ReviewDeck() {
  const { token } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ due: 0, total: 0, mastered: 0 });
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });

  const fetchAll = async () => {
    try {
      const [dueRes, countsRes] = await Promise.all([
        fetch(`${API_URL}/review/due?limit=20`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/review/counts`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const dueData = await dueRes.json();
      const countsData = await countsRes.json();
      if (dueRes.ok) setCards(dueData.cards || []);
      if (countsRes.ok) setCounts(countsData);
    } catch (err) {
      console.error('Review fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const current = cards[idx];

  const handleSubmit = async () => {
    if (selected === null || !current) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/review/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cardId: current._id, selectedIndex: selected })
      });
      const data = await res.json();
      if (res.ok) {
        setVerdict(data);
        setSessionStats((s) => ({
          reviewed: s.reviewed + 1,
          correct: s.correct + (data.isCorrect ? 1 : 0)
        }));
      }
    } catch (err) {
      console.error('Grade error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setVerdict(null);
    setIdx((i) => i + 1);
  };

  const handleRefresh = async () => {
    setLoading(true);
    setIdx(0);
    setSelected(null);
    setVerdict(null);
    setSessionStats({ reviewed: 0, correct: 0 });
    await fetchAll();
  };

  const allDone = !loading && idx >= cards.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-primary-500" size={40} />
        <p className="text-slate-500 font-medium">Loading review deck...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1">
          <ArrowLeft size={14} /> Dashboard
        </Link>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 border border-slate-800 p-6 mb-6">
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-fuchsia-500/10 blur-3xl rounded-full" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full" />
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-3">
              <Brain className="text-fuchsia-300" size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Spaced Repetition</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">Drill what you actually got wrong.</h1>
            <p className="text-slate-300 text-sm">Cards resurface at 3d → 7d → 14d → 30d intervals. Get one wrong and it resets to 3d.</p>
          </div>
          <div className="md:col-span-5 grid grid-cols-3 gap-2">
            <CountChip icon={Calendar} label="Due now" value={counts.due} highlight />
            <CountChip icon={BookMarked} label="Pending" value={counts.total} />
            <CountChip icon={Trophy} label="Mastered" value={counts.mastered} />
          </div>
        </div>
      </div>

      {/* Empty state */}
      {cards.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-10 text-center">
          <Sparkles className="mx-auto text-emerald-500 mb-3" size={36} />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nothing due right now</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-5">
            Review cards appear when you miss aptitude or CS Core questions. Keep practicing — wrong answers automatically join your deck.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/aptitude" className="px-5 py-2 rounded-md font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center justify-center gap-2">
              Practice Aptitude <ArrowRight size={14} />
            </Link>
            <Link to="/theory" className="px-5 py-2 rounded-md font-bold text-sm bg-violet-600 hover:bg-violet-500 text-white inline-flex items-center justify-center gap-2">
              Drill CS Core <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Session complete state */}
      {cards.length > 0 && allDone && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-8 text-center">
          <Trophy className="mx-auto text-emerald-500 mb-3" size={40} />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Review session complete!</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-1 font-bold">
            {sessionStats.correct} / {sessionStats.reviewed} correct
            {sessionStats.reviewed > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400"> · {Math.round((sessionStats.correct / sessionStats.reviewed) * 100)}% accuracy</span>
            )}
          </p>
          <p className="text-slate-500 text-sm mb-5">Cards you got right have moved to a longer interval. Cards you missed will return in 3 days.</p>
          <button onClick={handleRefresh} className="px-5 py-2 rounded-md font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center justify-center gap-2">
            <RotateCw size={14} /> Check for more due cards
          </button>
        </div>
      )}

      {/* Active card */}
      {cards.length > 0 && !allDone && current && (
        <>
          {/* Progress bar */}
          <div className="flex items-center justify-between mb-3 text-xs font-bold">
            <span className="text-slate-500 dark:text-slate-400">Card {idx + 1} / {cards.length}</span>
            {sessionStats.reviewed > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400">
                {sessionStats.correct} correct in this session
              </span>
            )}
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-fuchsia-500 to-emerald-500 transition-all" style={{ width: `${((idx + 1) / cards.length) * 100}%` }} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
              <span className={clsx('text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border', QTYPE_COLOR[current.questionType])}>
                {QTYPE_LABEL[current.questionType]}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">· {current.topic}</span>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Reviewed {current.reviewCount}× · interval {current.intervalDays}d
              </span>
            </div>

            <div className="p-6 space-y-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed">{current.questionText}</h2>
              <div className="space-y-2">
                {current.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const showCorrect = verdict && i === verdict.correctIndex;
                  const showWrong = verdict && isSelected && i !== verdict.correctIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => !verdict && setSelected(i)}
                      disabled={!!verdict}
                      className={clsx(
                        'w-full text-left p-4 rounded-lg border-2 transition flex items-center gap-3',
                        showCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
                        showWrong && 'border-rose-500 bg-rose-50 dark:bg-rose-900/20',
                        !verdict && isSelected && 'border-primary-500 bg-primary-50 dark:bg-primary-900/20',
                        !verdict && !isSelected && 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600',
                        verdict && !showCorrect && !showWrong && 'opacity-50'
                      )}
                    >
                      <div className={clsx(
                        'w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 border-2',
                        showCorrect ? 'bg-emerald-500 border-emerald-500 text-white' :
                        showWrong ? 'bg-rose-500 border-rose-500 text-white' :
                        isSelected ? 'bg-primary-500 border-primary-500 text-white' :
                        'border-slate-300 dark:border-slate-600 text-slate-500'
                      )}>{String.fromCharCode(65 + i)}</div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{opt}</span>
                      {showCorrect && <CheckCircle2 className="ml-auto text-emerald-500" size={16} />}
                      {showWrong && <XCircle className="ml-auto text-rose-500" size={16} />}
                    </button>
                  );
                })}
              </div>

              {verdict?.explanation && (
                <div className={clsx(
                  'p-3 rounded-lg text-xs leading-relaxed',
                  verdict.isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200'
                )}>
                  <span className="font-bold">Explanation: </span>{verdict.explanation}
                </div>
              )}

              {verdict && (
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-md p-2 flex items-center justify-between">
                  <span>Next due in <span className="font-bold text-slate-700 dark:text-slate-300">{verdict.intervalDays} days</span></span>
                  {verdict.mastered && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Trophy size={12} /> Mastered!
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 flex justify-end gap-2">
              {!verdict ? (
                <button
                  onClick={handleSubmit}
                  disabled={selected === null || submitting}
                  className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-fuchsia-500 to-emerald-500 rounded-md flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Submit
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-5 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-md flex items-center gap-1"
                >
                  {idx < cards.length - 1 ? 'Next Card' : 'Finish'} <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
const CountChip = ({ icon: Icon, label, value, highlight }) => (
  <div className={clsx(
    'rounded-lg p-2.5 border',
    highlight ? 'bg-fuchsia-500/20 border-fuchsia-400/30' : 'bg-white/5 border-white/10'
  )}>
    <div className="flex items-center gap-1 mb-1">
      <Icon className={highlight ? 'text-fuchsia-200' : 'text-slate-400'} size={11} />
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">{label}</span>
    </div>
    <p className="text-xl font-black text-white">{value}</p>
  </div>
);
