import { useMemo, useState } from 'react';
import { Calendar, Flame } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const DAYS_TO_SHOW = 70; // ~10 weeks

const TRACK_LABELS = {
  aptitude: 'Aptitude',
  theory: 'CS Theory',
  sql: 'SQL',
  dsa: 'DSA',
  hr: 'HR Prep',
  java: 'Java',
  review: 'Review Deck'
};

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function intensityClass(count) {
  if (count === 0) return 'bg-slate-100 dark:bg-slate-800';
  if (count === 1) return 'bg-primary-200 dark:bg-primary-900/60';
  if (count === 2) return 'bg-primary-400 dark:bg-primary-700';
  if (count === 3) return 'bg-primary-500 dark:bg-primary-500';
  return 'bg-primary-600 dark:bg-primary-400';
}

export default function ActivityHeatmap() {
  const { user } = useAuth();
  const [hoveredDay, setHoveredDay] = useState(null);

  const { weeks, totalActiveDays, totalTracks } = useMemo(() => {
    // activityLog from backend can arrive as a plain object (it's a Mongoose Map serialized to JSON)
    const log = user?.activityLog || {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Align the rightmost column to today's weekday — fill back DAYS_TO_SHOW days
    const days = [];
    for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = dateKey(d);
      const tracks = log[key] || [];
      days.push({ date: d, key, tracks });
    }

    // Pad the start so the grid starts on a Sunday column (weekday index 0)
    const firstWeekday = days[0].date.getDay();
    const padded = [...Array(firstWeekday).fill(null), ...days];

    // Chunk into weeks of 7 (columns)
    const weekChunks = [];
    for (let i = 0; i < padded.length; i += 7) {
      weekChunks.push(padded.slice(i, i + 7));
    }

    let active = 0;
    let trackHits = 0;
    days.forEach(d => {
      if (d.tracks.length > 0) active += 1;
      trackHits += d.tracks.length;
    });

    return { weeks: weekChunks, totalActiveDays: active, totalTracks: trackHits };
  }, [user]);

  const hovered = hoveredDay
    ? weeks.flat().find(c => c && c.key === hoveredDay)
    : null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
            <Calendar size={16} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
              Practice Activity
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Last {DAYS_TO_SHOW} days · {totalActiveDays} active days · {totalTracks} sessions
            </p>
          </div>
        </div>
        {user?.streak > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Flame size={14} />
            {user.streak}-day streak
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell, di) => {
                if (!cell) {
                  return <div key={di} className="w-3 h-3" />;
                }
                const count = cell.tracks.length;
                return (
                  <div
                    key={di}
                    onMouseEnter={() => setHoveredDay(cell.key)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={clsx(
                      'w-3 h-3 rounded-sm transition cursor-pointer ring-offset-1 ring-offset-white dark:ring-offset-slate-900',
                      intensityClass(count),
                      hoveredDay === cell.key && 'ring-2 ring-primary-500'
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend + hover tooltip line */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="min-h-[18px]">
          {hovered ? (
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {hovered.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              {' · '}
              {hovered.tracks.length === 0
                ? 'no practice'
                : hovered.tracks.map(t => TRACK_LABELS[t] || t).join(', ')}
            </span>
          ) : (
            <span>Hover a square for details</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(n => (
            <div key={n} className={clsx('w-3 h-3 rounded-sm', intensityClass(n))} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
