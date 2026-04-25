import { useEffect, useState } from 'react';
import { Trophy, Flame, User as UserIcon, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/config';
import clsx from 'clsx';

export default function Leaderboard() {
  const { token, user } = useAuth();
  const [data, setData] = useState({ top: [], me: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await fetch(`${API_URL}/program/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchLeaders();
  }, [token]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-3">
        <Loader2 className="animate-spin text-slate-400" size={18} />
        <span className="text-sm text-slate-500">Loading leaderboard...</span>
      </div>
    );
  }

  const meId = user?._id;
  const meInTop = data.top?.some((u) => String(u._id) === String(meId));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-50/70 to-transparent dark:from-amber-900/10">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-500" size={20} />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Top Sprinters</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ranked by streak</p>
          </div>
        </div>
        {data.me && (
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your rank</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">#{data.me.rank}</p>
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {data.top.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-500">No sprinters yet — be the first to start the streak!</p>
        )}

        {data.top.map((leader, index) => {
          const isMe = String(leader._id) === String(meId);
          const rank = index + 1;
          return (
            <LeaderRow key={leader._id} leader={leader} rank={rank} isMe={isMe} />
          );
        })}

        {/* If user not in top, show their row separately at the bottom */}
        {data.me && !meInTop && data.me.rank > 0 && (
          <>
            <div className="p-2 bg-slate-50 dark:bg-slate-800/30 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
              ··· your position ···
            </div>
            <LeaderRow
              leader={{
                _id: meId,
                name: data.me.name,
                username: data.me.username,
                streak: data.me.streak,
                longestStreak: data.me.longestStreak,
                completedCount: data.me.completedCount
              }}
              rank={data.me.rank}
              isMe
            />
          </>
        )}
      </div>
    </div>
  );
}

const LeaderRow = ({ leader, rank, isMe }) => (
  <div className={clsx(
    'p-3 flex items-center justify-between transition',
    isMe ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
  )}>
    <div className="flex items-center gap-3 min-w-0">
      <span className={clsx(
        'w-7 text-sm font-black tabular-nums',
        rank === 1 ? 'text-amber-500' :
        rank === 2 ? 'text-slate-400' :
        rank === 3 ? 'text-amber-700' :
        'text-slate-300 dark:text-slate-600'
      )}>
        {rank === 1 ? <Crown size={16} className="fill-current" /> : `#${rank}`}
      </span>
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
        <UserIcon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
          {leader.name} {isMe && <span className="text-amber-600 dark:text-amber-400 font-normal">(you)</span>}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {leader.completedCount} days · best streak {leader.longestStreak || 0}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full shrink-0">
      <Flame size={14} fill="currentColor" />
      <span className="text-xs font-black">{leader.streak}</span>
    </div>
  </div>
);
