import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/config';
import {
  Loader2, ArrowRight, CheckCircle2, Brain, Code2, Database,
  GraduationCap, MessageSquareText, RefreshCcw, Sparkles, Calendar
} from 'lucide-react';
import clsx from 'clsx';

const TYPE_META = {
  review: { icon: RefreshCcw, accent: 'from-fuchsia-500 to-emerald-500', tint: 'text-fuchsia-300' },
  aptitude: { icon: Brain, accent: 'from-amber-500 to-orange-600', tint: 'text-amber-300' },
  dsa: { icon: Code2, accent: 'from-blue-500 to-rose-500', tint: 'text-blue-300' },
  sql: { icon: Database, accent: 'from-indigo-500 to-purple-600', tint: 'text-indigo-300' },
  theory: { icon: GraduationCap, accent: 'from-violet-500 to-cyan-600', tint: 'text-violet-300' },
  hr: { icon: MessageSquareText, accent: 'from-rose-500 to-pink-600', tint: 'text-rose-300' }
};

export default function DailyMissionCard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const res = await fetch(`${API_URL}/mission/today`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (err) {
        console.error('Mission fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchMission();
  }, [token]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-3">
        <Loader2 className="animate-spin text-slate-400" size={20} />
        <span className="text-sm text-slate-500">Building today's mission...</span>
      </div>
    );
  }

  if (!data) return null;

  const completionPercent = data.totalItems ? Math.round((data.completedItems / data.totalItems) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 border border-slate-800 p-6">
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-400/10 blur-3xl rounded-full" />
      <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-blue-500/10 blur-3xl rounded-full" />

      <div className="relative flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 border border-amber-400/30 rounded-md text-amber-300">
            <Calendar size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Today's Mission</p>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              {data.isComplete ? 'Mission complete — see you tomorrow.' :
               data.streakSafe ? "Streak's safe. Push for the rest." :
               "Pick the first task and go."}
            </h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white leading-none">
            {data.completedItems} <span className="text-slate-500 text-base">/</span> {data.totalItems}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{completionPercent}% done</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden mb-5">
        <div className="h-full bg-gradient-to-r from-amber-400 to-blue-500 transition-all" style={{ width: `${completionPercent}%` }} />
      </div>

      {/* Items */}
      <div className="relative space-y-2">
        {data.items.map((item) => {
          const meta = TYPE_META[item.type] || TYPE_META.aptitude;
          const Icon = meta.icon;
          return (
            <Link
              key={item.id}
              to={item.link}
              className={clsx(
                'group flex items-center gap-3 p-3 rounded-lg border transition',
                item.done
                  ? 'bg-white/5 border-white/5 hover:bg-white/10'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
              )}
            >
              <div className={clsx(
                'w-8 h-8 rounded-md flex items-center justify-center shrink-0 border',
                item.done
                  ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                  : `bg-gradient-to-br ${meta.accent} text-white border-transparent`
              )}>
                {item.done ? <CheckCircle2 size={16} /> : <Icon size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={clsx(
                  'text-sm font-semibold truncate',
                  item.done ? 'text-slate-400 line-through' : 'text-white'
                )}>
                  {item.label}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {item.time} {item.optional ? '· optional' : ''}
                </p>
              </div>
              {!item.done && (
                <ArrowRight className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition shrink-0" size={14} />
              )}
            </Link>
          );
        })}
      </div>

      {data.isComplete && (
        <div className="relative mt-4 p-3 bg-emerald-500/10 border border-emerald-400/20 rounded-lg flex items-center gap-2">
          <Sparkles className="text-emerald-300" size={14} />
          <p className="text-xs text-emerald-200 font-semibold">
            Beautiful. Tomorrow's mission rebuilds at midnight — based on your weakest tracks.
          </p>
        </div>
      )}
    </div>
  );
}
