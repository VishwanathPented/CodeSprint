import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, ListChecks, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

function GateRow({ icon, title, subtitle, done, children }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
      <div className="mt-0.5">
        {done
          ? <CheckCircle2 className="text-emerald-500" size={20} />
          : <Circle className="text-slate-400" size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{icon}</span>
          <span className={`font-semibold text-sm ${done ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
            {title}
          </span>
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
}

export default function RequiredTasksPanel({ gates, loading, onRefresh, dayNumber }) {
  if (!gates) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/40 flex items-center gap-2 text-sm text-slate-500">
        {loading ? <><Loader2 size={14} className="animate-spin" /> Checking today's tasks…</> : 'Task status unavailable'}
      </div>
    );
  }

  const dsa = gates.dsa || {};
  const sql = gates.sql || {};
  const apt = gates.aptitude || {};

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListChecks size={18} className="text-primary-500" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Required Cross-Track Tasks</h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs flex items-center gap-1 px-2 py-1 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
          title="Refresh task status"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Refresh
        </button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Each Java day needs cross-track work. Finish all three before unlocking Day {dayNumber + 1}.
      </p>

      <div className="space-y-2.5">
        <GateRow
          icon="DSA"
          title={dsa.required ? "Solve at least 1 of today's DSA problems" : 'No DSA problems assigned today'}
          subtitle={dsa.required
            ? `${dsa.todaysSolved?.length || 0} / ${dsa.todaysSlugs?.length || 0} of today's problems solved`
            : 'Auto-passed for early-curriculum days'}
          done={dsa.done}
        >
          {dsa.required && dsa.todaysSlugs?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {dsa.todaysSlugs.map(slug => {
                const solved = dsa.todaysSolved?.includes(slug);
                return (
                  <Link
                    key={slug}
                    to={`/dsa/${slug}`}
                    className={`text-[11px] font-mono px-2 py-1 rounded border transition flex items-center gap-1 ${
                      solved
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                    }`}
                  >
                    {solved ? <CheckCircle2 size={11} /> : null}
                    {slug}
                  </Link>
                );
              })}
            </div>
          )}
        </GateRow>

        <GateRow
          icon="SQL"
          title="Complete one SQL lesson today"
          subtitle={sql.done
            ? `Done — ${sql.completedSinceUnlock} new lesson(s) since this day unlocked`
            : 'Open the SQL track and finish a lesson'}
          done={sql.done}
        >
          {!sql.done && (
            <Link
              to="/sql"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400 hover:underline"
            >
              Go to SQL Track <ArrowRight size={12} />
            </Link>
          )}
        </GateRow>

        <GateRow
          icon="APTITUDE"
          title="Complete one Aptitude session today"
          subtitle={apt.done
            ? `Done — ${apt.completedSinceUnlock} new session(s) since this day unlocked`
            : 'Quick session unlocks the gate'}
          done={apt.done}
        >
          {!apt.done && (
            <Link
              to="/aptitude"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400 hover:underline"
            >
              Go to Aptitude Track <ArrowRight size={12} />
            </Link>
          )}
        </GateRow>
      </div>
    </div>
  );
}
