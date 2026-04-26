import { useEffect, useState } from 'react';
import { Trophy, Crown, Loader2, Flame, User as UserIcon, Code2, Database, Brain } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/config';
import clsx from 'clsx';

const formatDate = (yyyyMmDd) => {
  if (!yyyyMmDd) return '';
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const TrackBadge = ({ active, label, Icon, color }) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition',
      active
        ? `bg-${color}-50 dark:bg-${color}-900/20 text-${color}-700 dark:text-${color}-300 border-${color}-200 dark:border-${color}-800`
        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-700'
    )}
    title={`${label} ${active ? 'completed' : 'not completed'} yesterday`}
  >
    <Icon size={10} /> {label}
  </span>
);

const PodiumCard = ({ champion, rank, isMe }) => {
  const heightClass = rank === 1 ? 'sm:h-40' : rank === 2 ? 'sm:h-32' : 'sm:h-28';
  const accent = rank === 1
    ? 'from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 border-amber-300 dark:border-amber-800'
    : rank === 2
    ? 'from-slate-100 to-white dark:from-slate-800/60 dark:to-slate-900/40 border-slate-300 dark:border-slate-700'
    : 'from-orange-100/60 to-white dark:from-orange-900/20 dark:to-orange-900/5 border-orange-200 dark:border-orange-900/40';
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';

  return (
    <div className={clsx(
      'relative rounded-xl border bg-gradient-to-b p-3 sm:p-4 flex flex-col justify-end',
      accent,
      heightClass,
      isMe && 'ring-2 ring-indigo-400 dark:ring-indigo-600'
    )}>
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl drop-shadow">{medal}</div>
      <div className="flex flex-col items-center text-center mt-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 mb-2">
          <UserIcon size={18} />
        </div>
        <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-full">
          {champion.name}
          {isMe && <span className="ml-1 text-indigo-600 dark:text-indigo-400 font-normal">(you)</span>}
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
          Day {champion.dayCompleted ?? '—'} · {champion.mcqScore}/10 MCQ
        </p>
        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tabular-nums mt-1">
          {champion.score} <span className="text-[10px] text-slate-400 font-bold">pts</span>
        </p>
      </div>
    </div>
  );
};

export default function HallOfFame() {
  const { token, user } = useAuth();
  const [data, setData] = useState({ date: null, champions: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHall = async () => {
      try {
        const res = await fetch(`${API_URL}/program/hall-of-fame`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error('Hall of Fame fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchHall();
  }, [token]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center gap-3">
        <Loader2 className="animate-spin text-slate-400" size={18} />
        <span className="text-sm text-slate-500">Loading Hall of Fame…</span>
      </div>
    );
  }

  const meId = user?._id;
  const top3 = data.champions.slice(0, 3);
  const rest = data.champions.slice(3);

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/70 via-white to-white dark:from-amber-900/15 dark:via-slate-900 dark:to-slate-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-500" size={20} />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Hall of Fame</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Yesterday's top performers · {formatDate(data.date)}
            </p>
          </div>
        </div>
        {data.total > 0 && (
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
            {data.total} sprinter{data.total === 1 ? '' : 's'} qualified
          </span>
        )}
      </div>

      {data.champions.length === 0 && (
        <div className="p-8 text-center">
          <Crown className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={36} />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No champions yesterday — be the first today!</p>
          <p className="text-xs text-slate-400 mt-1">Finish your Java day + an aptitude session + an SQL lesson + a DSA problem to earn the most points.</p>
        </div>
      )}

      {top3.length > 0 && (
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          {top3.map((champ, idx) => (
            <PodiumCard
              key={champ._id}
              champion={champ}
              rank={idx + 1}
              isMe={String(champ._id) === String(meId)}
            />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="border-t border-amber-100 dark:border-amber-900/30 divide-y divide-slate-100 dark:divide-slate-800">
          {rest.map((champ, idx) => {
            const rank = idx + 4;
            const isMe = String(champ._id) === String(meId);
            return (
              <div
                key={champ._id}
                className={clsx(
                  'flex items-center justify-between gap-3 px-4 py-2.5 transition',
                  isMe ? 'bg-indigo-50 dark:bg-indigo-900/15' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-7 text-xs font-black text-slate-400 tabular-nums">#{rank}</span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                    <UserIcon size={12} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {champ.name}
                      {isMe && <span className="ml-1 text-indigo-600 dark:text-indigo-400 text-xs font-normal">(you)</span>}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Day {champ.dayCompleted ?? '—'} · {champ.mcqScore}/10 MCQ
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <TrackBadge active={champ.didAptitude} label="APT" Icon={Brain} color="violet" />
                  <TrackBadge active={champ.didSql} label="SQL" Icon={Database} color="emerald" />
                  <TrackBadge active={champ.didDsa} label="DSA" Icon={Code2} color="blue" />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">streak</span>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 tabular-nums flex items-center gap-0.5">
                    {champ.streak}<Flame size={11} className="fill-current" />
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums w-12 text-right">{champ.score}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data.champions.length > 0 && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
          Score = (MCQ ×10) + 25 each for Aptitude · SQL · DSA done yesterday
        </div>
      )}
    </div>
  );
}
