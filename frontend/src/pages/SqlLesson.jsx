import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/config';
import { Database, ArrowLeft, Trophy, CircleCheckBig, Loader2, BookOpen, Table2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import McqModule from '../components/day/McqModule';
import SqlQueryEditor from '../components/sql/SqlQueryEditor';

export default function SqlLesson() {
  const { lessonNumber } = useParams();
  const { user, token, updateProgress } = useAuth();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [theoryScore, setTheoryScore] = useState(null);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);

  const alreadyCompleted = user?.sqlProgress?.completedLessons?.includes(Number(lessonNumber));
  const persistKey = `sql_lesson_${lessonNumber}_progress_${user?._id}`;

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`${API_URL}/sql/lesson/${lessonNumber}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setLesson(data);
        } else {
          setError(data.message || 'Failed to load lesson');
        }
      } catch {
        setError('Network error loading lesson');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchLesson();
  }, [lessonNumber, token]);

  // Restore partial progress
  useEffect(() => {
    if (!alreadyCompleted && user && lesson) {
      const saved = localStorage.getItem(persistKey);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          if (p.theoryScore !== null && p.theoryScore !== undefined) setTheoryScore(p.theoryScore);
          if (Array.isArray(p.solvedIds)) setSolvedIds(new Set(p.solvedIds));
        } catch (e) {
          console.error('Failed to load SQL progress', e);
        }
      }
    } else if (alreadyCompleted && lesson) {
      // Show as fully solved in review mode
      setTheoryScore(lesson.theoryMcqs?.length || 0);
      setSolvedIds(new Set(lesson.queryProblems.map((p) => String(p._id))));
    }
  }, [alreadyCompleted, user, lesson, persistKey]);

  // Persist partial progress
  useEffect(() => {
    if (!alreadyCompleted && user && lesson) {
      const p = { theoryScore, solvedIds: Array.from(solvedIds) };
      localStorage.setItem(persistKey, JSON.stringify(p));
    }
  }, [theoryScore, solvedIds, alreadyCompleted, user, lesson, persistKey]);

  const handleQuerySolved = (problemId) => {
    setSolvedIds((prev) => new Set(prev).add(String(problemId)));
  };

  const totalQueries = lesson?.queryProblems?.length || 0;
  const queriesSolved = solvedIds.size;
  const isFinished = theoryScore !== null && queriesSolved >= totalQueries && totalQueries > 0;

  const handleComplete = async () => {
    if (alreadyCompleted) {
      navigate('/sql');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/sql/complete-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          lessonNumber: Number(lessonNumber),
          theoryScore,
          queriesSolved,
          totalQueries
        })
      });
      const data = await res.json();
      if (res.ok) {
        updateProgress({ ...user, sqlProgress: data.sqlProgress });
        localStorage.removeItem(persistKey);
        navigate('/sql');
      } else {
        alert(data.message);
      }
    } catch {
      // silent — complete lesson failed
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-primary-500" size={40} />
        <p className="text-slate-500 font-medium">Loading lesson...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <p className="text-red-600 font-bold mb-4">{error || 'Lesson not available'}</p>
        <Link to="/sql" className="text-primary-600 hover:underline">← Back to SQL track</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
      <Link to="/sql" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
        <ArrowLeft size={14} /> Back to SQL track
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Database className="text-primary-600" size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600">SQL Lesson {lesson.lessonNumber}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{lesson.title}</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-3xl">{lesson.description}</p>
      </div>

      {/* Concept */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <BookOpen className="text-slate-500" size={18} />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Concept</h3>
        </div>
        <div className="p-6 prose prose-sm dark:prose-invert max-w-none prose-code:before:content-none prose-code:after:content-none prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
          <ReactMarkdown>{lesson.conceptExplanation}</ReactMarkdown>
        </div>
      </div>

      {/* Schema reference */}
      {lesson.schemaDescription && (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Table2 className="text-slate-500" size={16} />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Available Tables</h4>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none font-mono">
            <ReactMarkdown>{lesson.schemaDescription}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Theory MCQs */}
      {lesson.theoryMcqs?.length > 0 && (
        <McqModule
          mcqs={lesson.theoryMcqs}
          onComplete={(score) => setTheoryScore(score)}
          score={theoryScore}
        />
      )}

      {/* Query problems — unlock after theory submitted */}
      {theoryScore !== null && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Query Practice</h3>
            <span className="text-sm font-semibold text-slate-500">
              {queriesSolved} / {totalQueries} solved
            </span>
          </div>
          {lesson.queryProblems.map((problem) => (
            <SqlQueryEditor
              key={problem._id}
              problem={problem}
              setupSql={lesson.setupSql}
              alreadySolved={solvedIds.has(String(problem._id))}
              onSolved={handleQuerySolved}
            />
          ))}
        </div>
      )}

      {isFinished && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Lesson Complete!</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
            Theory: {theoryScore}/{lesson.theoryMcqs?.length || 0} · Queries: {queriesSolved}/{totalQueries}
          </p>
          <button
            onClick={handleComplete}
            disabled={submitting}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md mx-auto transition flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CircleCheckBig size={18} />}
            {alreadyCompleted ? 'Return to SQL Track' : 'Mark Complete & Unlock Next'}
          </button>
        </div>
      )}
    </div>
  );
}
