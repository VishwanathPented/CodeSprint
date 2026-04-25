import { useEffect, useState, useMemo } from 'react';
import { X, Loader2, FileText, Mail, Phone, Github, Hash, Calendar, GraduationCap, Crown, ShieldCheck, Flame, Trophy, BookOpen, Code2, Database, Brain, Calculator, MessageCircle, AlertTriangle, CircleCheck } from 'lucide-react';
import { API_URL } from '../../utils/config';

const DSA_TOPICS = ['arrays', 'strings', 'linked-list', 'stack-queue', 'hashing', 'recursion-trees'];

const pct = (correct, attempted) => attempted > 0 ? Math.round((correct / attempted) * 100) : null;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

const ratingFor = (accuracy) => {
  if (accuracy === null) return { label: 'Not Started', tone: 'neutral' };
  if (accuracy >= 80) return { label: 'Strong', tone: 'success' };
  if (accuracy >= 60) return { label: 'On Track', tone: 'info' };
  if (accuracy >= 40) return { label: 'Needs Work', tone: 'warning' };
  return { label: 'Weak', tone: 'danger' };
};

const toneClasses = {
  neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  info: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
};

export default function UserDetailDrawer({ userId, token, onClose, onDownloadReport, downloading }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        if (!cancelled) setUser(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, token]);

  const insights = useMemo(() => user ? buildInsights(user) : [], [user]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <aside
        onClick={e => e.stopPropagation()}
        className="w-full max-w-3xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 overflow-y-auto animate-in slide-in-from-right-4 duration-300"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <AlertTriangle size={40} className="text-red-400 mb-3" />
            <p className="font-bold text-slate-700 dark:text-slate-200">Failed to load user details</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded text-sm">Close</button>
          </div>
        ) : user && (
          <>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-black">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">{user.name}</h2>
                    <div className="flex items-center gap-2 mt-1 text-xs font-bold flex-wrap">
                      {user.role === 'admin' && <span className="px-2 py-0.5 bg-white/20 rounded uppercase">Admin</span>}
                      {user.isSubscribed && <span className="px-2 py-0.5 bg-amber-400/30 rounded uppercase">Premium</span>}
                      <span className="opacity-80">Joined {fmtDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={onDownloadReport}
                  disabled={downloading}
                  className="px-4 py-2 bg-white/15 hover:bg-white/25 disabled:opacity-50 rounded-lg font-bold text-sm flex items-center gap-2 backdrop-blur"
                >
                  {downloading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  {downloading ? 'Generating...' : 'Download PDF Report'}
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Identity grid */}
              <Section title="Identity">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Fact icon={<Mail size={14} />} label="Email" value={user.email} />
                  <Fact icon={<Hash size={14} />} label="USN" value={user.registrationDetails?.usn} mono />
                  <Fact icon={<GraduationCap size={14} />} label="Branch" value={user.registrationDetails?.branch} />
                  <Fact icon={<Calendar size={14} />} label="Year" value={user.registrationDetails?.year} />
                  <Fact icon={<Phone size={14} />} label="Phone" value={user.registrationDetails?.phoneNumber} />
                  <Fact
                    icon={<Github size={14} />}
                    label="GitHub Repo"
                    value={user.githubRepo}
                    href={user.githubRepo}
                  />
                </div>
              </Section>

              {/* Headline metrics */}
              <Section title="Overall Progress">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Metric label="Current Day" value={`Day ${user.currentDay || 1}`} icon={<BookOpen size={16} />} />
                  <Metric label="Days Completed" value={`${user.completedDays?.length || 0} / 50`} icon={<CircleCheck size={16} />} />
                  <Metric label="Completion" value={`${Math.round(((user.completedDays?.length || 0) / 50) * 100)}%`} icon={<Trophy size={16} />} />
                  <Metric label="Current Streak" value={`${user.streak || 0} 🔥`} icon={<Flame size={16} />} />
                  <Metric label="Longest Streak" value={user.longestStreak || 0} icon={<Trophy size={16} />} />
                  <Metric label="Last Active" value={fmtDate(user.lastActiveDate)} icon={<Calendar size={16} />} />
                </div>
              </Section>

              {/* Aptitude */}
              <QuestionTrack
                title="Aptitude"
                icon={<Calculator size={16} />}
                progress={user.aptitudeProgress}
                sectionLabels={{ quantitative: 'Quantitative', logical: 'Logical', verbal: 'Verbal' }}
              />

              {/* Theory */}
              <QuestionTrack
                title="CS Theory"
                icon={<Brain size={16} />}
                progress={user.theoryProgress}
                sectionLabels={{ os: 'Operating Systems', networks: 'Networks', oop: 'OOP' }}
              />

              {/* SQL */}
              <Section title="SQL Track" icon={<Database size={16} />}>
                <SqlBlock progress={user.sqlProgress} />
              </Section>

              {/* DSA */}
              <Section title="DSA Track" icon={<Code2 size={16} />}>
                <DsaBlock progress={user.dsaProgress} />
              </Section>

              {/* HR */}
              <Section title="HR Practice" icon={<MessageCircle size={16} />}>
                <HrBlock practice={user.hrPractice} />
              </Section>

              {/* Insights */}
              <Section title="Areas to Improve" icon={<AlertTriangle size={16} />}>
                {insights.length === 0 ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-sm text-emerald-700 dark:text-emerald-300">
                    <CircleCheck size={16} /> No critical weak areas detected. Keep up the consistency!
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {insights.map((i, idx) => (
                      <li key={idx} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider self-start ${
                          i.priority === 'HIGH' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                          i.priority === 'MEDIUM' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                          'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>{i.priority}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{i.area}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{i.recommendation}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

// ===== Sub-components =====

function Section({ title, icon, children }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        {icon} {title}
      </h3>
      {children}
    </section>
  );
}

function Fact({ icon, label, value, mono = false, href }) {
  const display = value || <span className="text-slate-400 italic">—</span>;
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <span className="text-slate-400 mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</div>
        {href && value ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className={`text-sm text-indigo-600 dark:text-indigo-400 hover:underline truncate block ${mono ? 'font-mono' : 'font-medium'}`}>
            {value}
          </a>
        ) : (
          <div className={`text-sm text-slate-800 dark:text-slate-200 truncate ${mono ? 'font-mono uppercase' : 'font-medium'}`}>{display}</div>
        )}
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{icon} {label}</div>
      <div className="text-xl font-black text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function QuestionTrack({ title, icon, progress, sectionLabels }) {
  const empty = !progress || (!progress.totalAttempted && !progress.sessionsCompleted);
  if (empty) {
    return (
      <Section title={title} icon={icon}>
        <p className="text-sm text-slate-500 italic px-3 py-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg">Not yet started.</p>
      </Section>
    );
  }
  const overall = pct(progress.totalCorrect, progress.totalAttempted);
  const overallRating = ratingFor(overall);
  return (
    <Section title={title} icon={icon}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <Metric label="Sessions" value={progress.sessionsCompleted || 0} />
        <Metric label="Attempted" value={progress.totalAttempted || 0} />
        <Metric label="Correct" value={progress.totalCorrect || 0} />
        <Metric label="Accuracy" value={overall !== null ? `${overall}%` : '—'} />
      </div>
      <div className="space-y-2">
        {Object.entries(sectionLabels).map(([key, label]) => {
          const stats = progress.sectionStats?.[key] || {};
          const acc = pct(stats.correct, stats.attempted);
          const r = ratingFor(acc);
          return (
            <div key={key} className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{label}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {stats.attempted ? `${stats.correct || 0}/${stats.attempted} correct` : 'Not attempted'}
                </div>
                {stats.attempted > 0 && (
                  <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${acc >= 80 ? 'bg-emerald-500' : acc >= 60 ? 'bg-indigo-500' : acc >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${acc}%` }} />
                  </div>
                )}
              </div>
              <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${toneClasses[r.tone]}`}>{r.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Best session accuracy: <strong className="text-slate-800 dark:text-slate-200">{progress.bestSessionAccuracy || 0}%</strong></span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${toneClasses[overallRating.tone]}`}>Overall: {overallRating.label}</span>
      </div>
    </Section>
  );
}

function SqlBlock({ progress }) {
  const sql = progress || {};
  const completed = sql.completedLessons?.length || 0;
  const scores = sql.scores || [];
  const avg = scores.length > 0
    ? Math.round(scores.reduce((a, s) => a + (s.totalQueries > 0 ? (s.queriesSolved / s.totalQueries) : 0), 0) / scores.length * 100)
    : null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <Metric label="Lessons Completed" value={completed} />
      <Metric label="Current Lesson" value={sql.currentLesson || 1} />
      <Metric label="Avg Query Accuracy" value={avg !== null ? `${avg}%` : '—'} />
    </div>
  );
}

function DsaBlock({ progress }) {
  const dsa = progress || {};
  const total = dsa.solvedProblems?.length || 0;
  return (
    <div>
      <div className="mb-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800/50">
        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Total Solved</div>
        <div className="text-2xl font-black text-indigo-900 dark:text-indigo-200">{total}</div>
      </div>
      <div className="space-y-1.5">
        {DSA_TOPICS.map(t => {
          const solved = dsa.topicStats?.[t]?.solved || 0;
          let tone = 'neutral';
          if (solved >= 5) tone = 'success';
          else if (solved >= 3) tone = 'info';
          else if (solved >= 1) tone = 'warning';
          return (
            <div key={t} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${toneClasses[tone]}`}>{solved} solved</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HrBlock({ practice }) {
  const log = practice || [];
  const avg = log.length > 0 ? Math.round(log.reduce((a, p) => a + (p.score || 0), 0) / log.length) : null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Metric label="Practiced" value={log.length} />
        <Metric label="Average Score" value={avg !== null ? `${avg}/100` : '—'} />
        <Metric label="Last Practiced" value={log.length ? fmtDate(log.at(-1).practicedAt) : '—'} />
      </div>
      {log.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {log.slice(-5).reverse().map((p, i) => (
            <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{p.question}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  (p.score || 0) >= 70 ? 'bg-emerald-100 text-emerald-700' :
                  (p.score || 0) >= 50 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>{p.score || 0}/100</span>
              </div>
              <div className="text-slate-500 italic line-clamp-2">{p.feedback || 'No feedback recorded'}</div>
              <div className="text-slate-400 text-[10px] mt-1">{fmtDate(p.practicedAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Same insight engine as the PDF generator. Kept in sync for parity.
function buildInsights(user) {
  const insights = [];

  if ((user.streak || 0) === 0 && (user.completedDays?.length || 0) > 0) {
    insights.push({ priority: 'MEDIUM', area: 'Daily Consistency', recommendation: 'Streak is broken. Encourage daily check-ins — even 15 min/day rebuilds momentum.' });
  }

  if ((user.currentDay || 1) <= 5 && new Date(user.createdAt) < new Date(Date.now() - 14 * 86400000)) {
    insights.push({ priority: 'HIGH', area: 'Curriculum Pace', recommendation: 'Joined over 2 weeks ago but still on early days. Schedule a 1:1 to identify blockers.' });
  }

  if (user.aptitudeProgress?.totalAttempted > 20) {
    Object.entries(user.aptitudeProgress.sectionStats || {}).forEach(([k, s]) => {
      const acc = pct(s.correct, s.attempted);
      if (acc !== null && acc < 50 && s.attempted >= 5) {
        insights.push({ priority: 'HIGH', area: `Aptitude — ${k}`, recommendation: `Only ${acc}% accuracy across ${s.attempted} questions. Recommend focused practice on this section.` });
      }
    });
  } else {
    insights.push({ priority: 'MEDIUM', area: 'Aptitude Volume', recommendation: 'Fewer than 20 aptitude questions attempted. Aim for at least 10 per day.' });
  }

  if (user.theoryProgress?.totalAttempted > 20) {
    Object.entries(user.theoryProgress.sectionStats || {}).forEach(([k, s]) => {
      const acc = pct(s.correct, s.attempted);
      if (acc !== null && acc < 50 && s.attempted >= 5) {
        insights.push({ priority: 'HIGH', area: `Theory — ${k.toUpperCase()}`, recommendation: `Below 50% on ${s.attempted} attempted. Revisit concept lessons before more practice.` });
      }
    });
  } else {
    insights.push({ priority: 'MEDIUM', area: 'CS Fundamentals Volume', recommendation: 'Limited theory practice. OS, Networks, OOP are common interview topics.' });
  }

  const dsa = user.dsaProgress || {};
  const untouched = DSA_TOPICS.filter(t => (dsa.topicStats?.[t]?.solved || 0) === 0);
  if (untouched.length >= 3) {
    insights.push({ priority: 'HIGH', area: 'DSA Coverage', recommendation: `${untouched.length} topics untouched: ${untouched.join(', ')}.` });
  } else if (untouched.length > 0) {
    insights.push({ priority: 'MEDIUM', area: 'DSA Coverage', recommendation: `Topics not yet attempted: ${untouched.join(', ')}.` });
  }

  if ((user.hrPractice?.length || 0) < 5) {
    insights.push({ priority: 'MEDIUM', area: 'HR Interview Prep', recommendation: 'Fewer than 5 HR questions practiced. Schedule mock HR sessions before placement drives.' });
  }

  if ((user.sqlProgress?.completedLessons?.length || 0) < 3 && (user.currentDay || 1) > 10) {
    insights.push({ priority: 'MEDIUM', area: 'SQL Track', recommendation: 'SQL track barely touched despite curriculum progress. Most companies test SQL.' });
  }

  if (!user.githubRepo) {
    insights.push({ priority: 'LOW', area: 'GitHub Portfolio', recommendation: 'No GitHub repo linked. Encourage student to create a 50-day repo to showcase progress.' });
  }

  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  insights.sort((a, b) => order[a.priority] - order[b.priority]);
  return insights;
}
