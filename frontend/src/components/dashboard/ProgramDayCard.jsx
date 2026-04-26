import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/config';
import {
  Loader2, ArrowRight, CheckCircle2, Coffee, Code2, Brain, Database,
  GraduationCap, MessageSquareText, Lock, Trophy, Flame, Calendar, Sparkles
} from 'lucide-react';
import clsx from 'clsx';

export default function ProgramDayCard() {
  const { token, updateProgress, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchToday = async () => {
    try {
      const res = await fetch(`${API_URL}/program/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) setData(json);
      else setError(json.message);
    } catch {
      setError('Failed to load today\'s program.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/program/complete-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        // Update user streak in context, refetch
        if (user) updateProgress({
          ...user,
          streak: json.streak,
          longestStreak: json.longestStreak,
          completedDays: [...(user.completedDays || []), json.day].filter((v, i, a) => a.indexOf(v) === i)
        });
        await fetchToday();
      } else {
        setError(json.message);
      }
    } catch {
      setError('Failed to complete day.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-3">
        <Loader2 className="animate-spin text-slate-400" size={20} />
        <span className="text-sm text-slate-500">Loading today's mission...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-rose-700">
        {error || 'Could not load mission.'}
      </div>
    );
  }

  const { day, total, locked, alreadyCompleted, status, requiredAllDone, streak, longestStreak, completedDaysCount } = data;
  const programPercent = Math.round((completedDaysCount / total) * 100);

  return (
    <div className="space-y-4">
      {/* Hero strip — day, streak, longest */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 border border-slate-800 p-5 sm:p-6">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-400/10 blur-3xl rounded-full" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-emerald-500/10 blur-3xl rounded-full" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-orange-300" size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CodeSprint Daily Program</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Day {day} <span className="text-slate-500 font-bold">/ {total}</span>
            </h2>
            <p className="text-slate-300 text-sm">
              {alreadyCompleted ? "Today's work is done. Day " + Math.min(day + 1, 50) + " unlocks at midnight." :
               requiredAllDone ? 'All required tasks done. Hit complete to lock in the streak.' :
               'Knock out Java + DSA + Aptitude to keep your streak alive.'}
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-3 gap-2">
            <StatChip icon={Flame} label="Streak" value={streak} highlight={streak > 0} />
            <StatChip icon={Trophy} label="Longest" value={longestStreak} />
            <StatChip icon={CheckCircle2} label="Days Done" value={`${completedDaysCount}/${total}`} />
          </div>
        </div>

        {/* Overall program progress bar */}
        <div className="relative h-1.5 mt-5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 to-emerald-500 transition-all" style={{ width: `${programPercent}%` }} />
        </div>
      </div>

      {/* Today's tasks */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Today's Tasks · Day {day}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">3 required · 3 optional bonus</p>
          </div>
          {locked && (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-md border border-amber-200 dark:border-amber-800/50">
              <Lock size={12} /> Day {day + 1} unlocks at midnight
            </span>
          )}
        </div>

        <div className="p-5 space-y-2">
          {/* REQUIRED */}
          <SectionLabel>Required</SectionLabel>

          <TaskRow
            done={status.javaDone}
            icon={Coffee}
            iconBg="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
            title={data.java?.topicTitle || `Day ${day}`}
            subtitle={data.java?.description}
            link={data.java?.link}
            badge="Java"
          />

          <TaskRow
            done={status.dsaDone}
            icon={Code2}
            iconBg="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            title={
              data.dsa.problems.length > 1
                ? `Solve ${data.dsa.problems.length} DSA problems`
                : data.dsa.problems[0]?.title || 'Solve 1 DSA problem'
            }
            subtitle={
              data.dsa.problems.length > 1
                ? `${data.dsa.doneCount} of ${data.dsa.problems.length} solved`
                : data.dsa.problems[0]?.topic
            }
            link={data.dsa.problems.length === 1 ? `/dsa/${data.dsa.problems[0].slug}` : '/dsa'}
            badge="DSA"
            extras={
              data.dsa.problems.length > 1 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {data.dsa.problems.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/dsa/${p.slug}`}
                      className={clsx(
                        'text-[10px] px-2 py-1 rounded font-mono border transition',
                        p.solved
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400'
                      )}
                    >
                      {p.solved ? '✓ ' : ''}{p.slug} · {p.difficulty}
                    </Link>
                  ))}
                </div>
              )
            }
          />

          <TaskRow
            done={status.aptitudeDone}
            icon={Brain}
            iconBg="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
            title="Aptitude · 10 questions"
            subtitle="Mixed sectional · ~12 min"
            link={data.aptitude.link}
            badge="Aptitude"
          />

          {/* BONUS */}
          <SectionLabel className="mt-5">Bonus (extends streak)</SectionLabel>

          {data.sql && (
            <TaskRow
              done={status.sqlDone}
              icon={Database}
              iconBg="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              title={`SQL Lesson ${data.sql.lessonNumber} · ${data.sql.title}`}
              subtitle="~20 min"
              link={data.sql.link}
              badge="SQL"
              optional
            />
          )}

          <TaskRow
            done={status.theoryDone}
            icon={GraduationCap}
            iconBg="bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
            title="CS Core · 10 MCQs"
            subtitle="OS · Networks · OOP · ~10 min"
            link={data.theory.link}
            badge="CS Core"
            optional
          />

          {data.hr && (
            <TaskRow
              done={status.hrDone}
              icon={MessageSquareText}
              iconBg="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
              title="HR Practice"
              subtitle={data.hr.question}
              link={data.hr.link}
              badge="HR"
              optional
            />
          )}
        </div>

        {/* Footer: complete button */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          {alreadyCompleted ? (
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle2 size={16} />
              Day {day} complete. Day {Math.min(day + 1, 50)} unlocks at midnight — come back tomorrow.
            </div>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!requiredAllDone || submitting}
              className={clsx(
                'w-full py-3 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2',
                requiredAllDone
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              )}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> :
               requiredAllDone ? <Sparkles size={16} /> : <Lock size={16} />}
              {requiredAllDone ? `Complete Day ${day} & Lock Streak +1` : 'Finish all 3 required tasks to complete the day'}
            </button>
          )}
          {error && (
            <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const SectionLabel = ({ children, className = '' }) => (
  <p className={clsx('text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1', className)}>
    {children}
  </p>
);

// eslint-disable-next-line no-unused-vars
const TaskRow = ({ done, icon: Icon, iconBg, title, subtitle, link, badge, optional, extras }) => (
  <div className={clsx(
    'rounded-lg border p-3 transition',
    done
      ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50'
      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
  )}>
    <Link to={link} className="flex items-center gap-3 group">
      <div className={clsx(
        'w-9 h-9 rounded-md flex items-center justify-center shrink-0 border',
        done ? 'bg-emerald-500 text-white border-emerald-500' : `${iconBg} border-transparent`
      )}>
        {done ? <CheckCircle2 size={18} /> : <Icon size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{badge}</span>
          {optional && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Bonus</span>
          )}
        </div>
        <p className={clsx(
          'text-sm font-semibold truncate',
          done ? 'text-emerald-800 dark:text-emerald-200 line-through' : 'text-slate-900 dark:text-white'
        )}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
        )}
      </div>
      <ArrowRight className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white group-hover:translate-x-1 transition shrink-0" size={14} />
    </Link>
    {extras}
  </div>
);

// eslint-disable-next-line no-unused-vars
const StatChip = ({ icon: Icon, label, value, highlight }) => (
  <div className={clsx(
    'rounded-lg p-2.5 border',
    highlight ? 'bg-orange-500/20 border-orange-400/40' : 'bg-white/5 border-white/10'
  )}>
    <div className="flex items-center gap-1 mb-0.5">
      <Icon className={highlight ? 'text-orange-200' : 'text-slate-400'} size={11} />
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">{label}</span>
    </div>
    <p className="text-xl font-black text-white">{value}</p>
  </div>
);
