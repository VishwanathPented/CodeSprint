import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/config';
import { Award, ArrowRight, AlertCircle, Loader2, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

const TIER_STYLES = {
  emerald: {
    ring: 'from-emerald-400 to-teal-500',
    badge: 'bg-emerald-500',
    accent: 'text-emerald-300'
  },
  amber: {
    ring: 'from-amber-400 to-orange-500',
    badge: 'bg-amber-500',
    accent: 'text-amber-300'
  },
  orange: {
    ring: 'from-orange-400 to-rose-500',
    badge: 'bg-orange-500',
    accent: 'text-orange-300'
  },
  slate: {
    ring: 'from-slate-400 to-slate-600',
    badge: 'bg-slate-500',
    accent: 'text-slate-300'
  }
};

export default function PlacementReadinessCard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await fetch(`${API_URL}/readiness`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (err) {
        console.error('Readiness fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchScore();
  }, [token]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-3">
        <Loader2 className="animate-spin text-slate-400" size={20} />
        <span className="text-sm text-slate-500">Calculating your placement readiness...</span>
      </div>
    );
  }

  if (!data) return null;

  const tierStyle = TIER_STYLES[data.tier?.color] || TIER_STYLES.slate;

  // Build conic-gradient ring based on score (0-100)
  const ringPercent = Math.max(0, Math.min(100, data.composite));

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 border border-slate-800 p-5 sm:p-6 md:p-8">
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-indigo-500/10 blur-3xl rounded-full" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full" />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
        {/* Big circular score */}
        <div className="lg:col-span-3 flex justify-center">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40">
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${tierStyle.ring} opacity-90`}
              style={{
                background: `conic-gradient(currentColor ${ringPercent * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                color: data.tier?.color === 'emerald' ? '#10b981' :
                       data.tier?.color === 'amber' ? '#f59e0b' :
                       data.tier?.color === 'orange' ? '#f97316' : '#64748b'
              }}
            />
            <div className="absolute inset-2 rounded-full bg-slate-900 flex flex-col items-center justify-center border border-white/10">
              <p className="text-4xl sm:text-5xl font-black text-white leading-none">{data.composite}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">/ 100</p>
            </div>
          </div>
        </div>

        {/* Tier + components */}
        <div className="lg:col-span-9 space-y-4 min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Award className={tierStyle.accent} size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Placement Readiness</span>
              <span className={clsx('text-[10px] font-bold uppercase tracking-widest text-white px-2 py-0.5 rounded', tierStyle.badge)}>
                {data.tier?.label}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{data.tier?.message}</h2>
          </div>

          {/* Component breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {data.components?.map((c) => (
              <div key={c.key} className="bg-white/5 backdrop-blur rounded-md p-2.5 border border-white/10">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{c.label}</p>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <p className="text-lg font-black text-white">{c.pct}</p>
                  <span className="text-[10px] text-slate-400">/100</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${tierStyle.badge} transition-all`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Next action */}
          {data.weakest && (
            <Link
              to={
                data.weakest.key === 'aptitude' ? '/aptitude' :
                data.weakest.key === 'sql' ? '/sql' :
                data.weakest.key === 'theory' ? '/theory' :
                data.weakest.key === 'dsa' ? '/dsa' :
                data.weakest.key === 'hr' ? '/hr' : '/dashboard'
              }
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 hover:bg-slate-100 transition font-semibold text-sm"
            >
              <TrendingUp size={14} />
              <span>
                Next up: <span className="font-bold">{data.weakest.label}</span> · {data.weakest.nextStep}
              </span>
              <ArrowRight className="group-hover:translate-x-1 transition" size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
