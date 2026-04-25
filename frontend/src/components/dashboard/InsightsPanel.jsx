import { Link } from 'react-router-dom';
import { Lightbulb, AlertTriangle, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { buildInsights } from '../../utils/insights';

// Maps an insight area to the most relevant track page.
const AREA_LINKS = {
  'Daily Consistency': null,
  'Curriculum Pace': '/',
  'Aptitude Volume': '/aptitude',
  'CS Fundamentals Volume': '/theory',
  'DSA Coverage': '/dsa',
  'HR Interview Prep': '/hr',
  'SQL Track': '/sql',
  'GitHub Portfolio': null
};

const PRIORITY_STYLE = {
  HIGH: {
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    icon: AlertTriangle,
    iconColor: 'text-rose-500'
  },
  MEDIUM: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    icon: TrendingUp,
    iconColor: 'text-amber-500'
  },
  LOW: {
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
    icon: Lightbulb,
    iconColor: 'text-slate-400'
  }
};

function linkForArea(area) {
  if (AREA_LINKS[area] !== undefined) return AREA_LINKS[area];
  if (area.startsWith('Aptitude')) return '/aptitude';
  if (area.startsWith('Theory')) return '/theory';
  return null;
}

export default function InsightsPanel() {
  const { user } = useAuth();
  if (!user) return null;

  const insights = buildInsights(user, { mode: 'student', limit: 4 });

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
            <Lightbulb size={16} />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
            Focus Areas
          </h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Personalized for you
        </span>
      </div>

      {insights.length === 0 ? (
        <div className="p-6 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="text-emerald-500" size={18} />
          You're on track across every area. Keep the streak alive!
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {insights.map((ins, i) => {
            const style = PRIORITY_STYLE[ins.priority] || PRIORITY_STYLE.LOW;
            const Icon = style.icon;
            const to = linkForArea(ins.area);
            const Wrapper = to ? Link : 'div';
            const wrapperProps = to ? { to } : {};
            return (
              <Wrapper
                key={`${ins.area}-${i}`}
                {...wrapperProps}
                className={clsx(
                  'flex items-start gap-3 px-5 py-3.5 transition',
                  to && 'hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group'
                )}
              >
                <Icon size={16} className={clsx('mt-0.5 shrink-0', style.iconColor)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {ins.area}
                    </span>
                    <span className={clsx('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded', style.badge)}>
                      {ins.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {ins.recommendation}
                  </p>
                </div>
                {to && (
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition mt-1 shrink-0" />
                )}
              </Wrapper>
            );
          })}
        </ul>
      )}
    </div>
  );
}
