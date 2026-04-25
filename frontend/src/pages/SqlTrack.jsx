import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/config';
import { Database, Lock, Unlock, CheckCircle, ArrowRight, Loader2, Target, Trophy, BookOpen } from 'lucide-react';
import clsx from 'clsx';

export default function SqlTrack() {
  const { user, token } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await fetch(`${API_URL}/sql/roadmap`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) setLessons(data);
      } catch (err) {
        console.error('Fetch SQL roadmap error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchRoadmap();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-primary-500" size={40} />
        <p className="text-slate-500 font-medium">Loading SQL curriculum...</p>
      </div>
    );
  }

  const completed = user?.sqlProgress?.completedLessons || [];
  const currentLesson = user?.sqlProgress?.currentLesson || 1;
  const totalSolved = completed.length;
  const percent = lessons.length ? Math.round((totalSolved / lessons.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 border border-slate-800 p-8 mb-8">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-indigo-500/10 blur-3xl rounded-full" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-4">
            <Database className="text-indigo-400" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">SQL &amp; DBMS Track</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Write queries, ace DBMS rounds.
          </h1>
          <p className="text-slate-300 max-w-2xl">
            20 hands-on lessons — SELECT to window functions to ACID. Every query runs in your browser. No setup, no delay.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <HeroStat icon={BookOpen} label="Lessons" value={`${totalSolved} / ${lessons.length}`} />
            <HeroStat icon={Target} label="Current" value={`#${currentLesson}`} />
            <HeroStat icon={Trophy} label="Progress" value={`${percent}%`} />
            <HeroStat icon={CheckCircle} label="Status" value={percent === 100 ? 'Done' : 'In Progress'} />
          </div>

          {/* Overall progress bar */}
          <div className="mt-5 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="space-y-3">
        {lessons.map((lesson) => {
          const isCompleted = completed.includes(lesson.lessonNumber);
          const isActive = lesson.lessonNumber === currentLesson;
          const isLocked = lesson.lessonNumber > currentLesson && !isCompleted;
          const isPaid = lesson.lessonNumber > 4 && !user?.isSubscribed && user?.role !== 'admin';

          const diffColor =
            lesson.difficulty === 'Advanced' ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50' :
            lesson.difficulty === 'Intermediate' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50' :
            'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50';

          return (
            <div
              key={lesson.lessonNumber}
              className={clsx(
                'relative flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-xl border transition',
                isActive && 'bg-white border-primary-500 dark:bg-slate-900 shadow-md shadow-primary-500/10',
                isCompleted && !isActive && 'bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800',
                !isCompleted && !isActive && !isLocked && 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                isLocked && 'bg-slate-50/50 border-slate-100 dark:bg-slate-900/40 dark:border-slate-800 opacity-70'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-gradient-to-b from-indigo-500 to-purple-500" />
              )}

              <div className={clsx(
                'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 font-black text-sm',
                isCompleted ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-900/30 text-white' :
                isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-white dark:border-slate-900 text-white' :
                'bg-slate-100 border-white dark:bg-slate-800 dark:border-slate-900 text-slate-500'
              )}>
                {isCompleted ? <CheckCircle size={20} /> : isLocked ? <Lock size={16} /> : lesson.lessonNumber}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Lesson {lesson.lessonNumber}
                  </span>
                  <span className={clsx('text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border', diffColor)}>
                    {lesson.difficulty}
                  </span>
                  {isPaid && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Pro
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{lesson.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{lesson.description}</p>
              </div>

              <div className="shrink-0">
                {isLocked ? (
                  <button disabled className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium cursor-not-allowed flex items-center gap-2 text-sm">
                    <Lock size={14} /> Locked
                  </button>
                ) : isPaid ? (
                  <Link to="/subscribe" className="px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm flex items-center gap-2">
                    Unlock Pro <ArrowRight size={14} />
                  </Link>
                ) : (
                  <Link
                    to={`/sql/lesson/${lesson.lessonNumber}`}
                    className={clsx(
                      'px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2 transition',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white shadow-md shadow-indigo-500/20'
                        : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    )}
                  >
                    {isCompleted ? 'Review' : isActive ? 'Continue' : 'Start'} <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* eslint-disable no-unused-vars */
const HeroStat = ({ icon: Icon, label, value }) => (
  <div className="bg-white/5 backdrop-blur rounded-lg p-3 border border-white/10">
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className="text-slate-400" size={12} />
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
    </div>
    <p className="text-xl font-black text-white">{value}</p>
  </div>
);
