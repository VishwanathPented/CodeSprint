// Records that a user practiced a given track today, for the dashboard heatmap.
// Uses local server date as YYYY-MM-DD; idempotent — same track on same day is a no-op.

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function recordActivity(user, track) {
  if (!user.activityLog) user.activityLog = new Map();
  const key = todayKey();
  const existing = user.activityLog.get(key) || [];
  if (!existing.includes(track)) {
    user.activityLog.set(key, [...existing, track]);
  }
}
