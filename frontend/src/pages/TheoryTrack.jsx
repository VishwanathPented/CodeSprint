import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/config';
import { Cpu, Network, Boxes, ArrowRight, Loader2, Target, Trophy, Sparkles, GraduationCap, AlertTriangle } from 'lucide-react';

const SECTION_META = {
  os: {
    title: 'Operating Systems',
    desc: 'Processes, threads, scheduling, memory, deadlocks, synchronization, file systems.',
    icon: Cpu,
    gradient: 'from-sky-500 to-cyan-600',
    light: 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/50'
  },
  networks: {
    title: 'Computer Networks',
    desc: 'OSI, TCP/UDP, IP, DNS, HTTP, TLS. Layered-model questions are interview classics.',
    icon: Network,
    gradient: 'from-violet-500 to-purple-600',
    light: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/50'
  },
  oop: {
    title: 'Object-Oriented Programming',
    desc: 'Four pillars, inheritance, polymorphism, SOLID principles, interfaces vs abstract classes.',
    icon: Boxes,
    gradient: 'from-rose-500 to-pink-600',
    light: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
  }
};

export default function TheoryTrack() {
  const { user, token } = useAuth();
  const [overview, setOverview] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ovRes, weakRes] = await Promise.all([
          fetch(`${API_URL}/theory/overview`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/theory/weak-topics`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const ovData = await ovRes.json();
        const weakData = await weakRes.json();
        if (ovRes.ok) setOverview(ovData);
        if (weakRes.ok) setWeakTopics(weakData.weak || []);
      } catch (err) {
        console.error('Theory overview error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAll();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-primary-500" size={40} />
        <p className="text-slate-500 font-medium">Loading CS fundamentals...</p>
      </div>
    );
  }

  const stats = user?.theoryProgress || overview?.stats || {};
  const overallAccuracy = stats.totalAttempted
    ? Math.round((stats.totalCorrect / stats.totalAttempted) * 100)
    : 0;

  const sectionAccuracy = (sec) => {
    const s = stats.sectionStats?.[sec];
    if (!s?.attempted) return null;
    return Math.round((s.correct / s.attempted) * 100);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 border border-slate-800 p-8 mb-8">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-violet-500/10 blur-3xl rounded-full" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-4">
            <GraduationCap className="text-violet-400" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">CS Fundamentals</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            OS, Networks, OOP — locked in.
          </h1>
          <p className="text-slate-300 max-w-2xl">
            The MCQ theory rounds at TCS, Infosys, Accenture and CGI are all drawn from these three topics. Drill them until the concepts are second nature.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <HeroStat icon={Target} label="Sessions" value={stats.sessionsCompleted || 0} />
            <HeroStat icon={Sparkles} label="Accuracy" value={`${overallAccuracy}%`} />
            <HeroStat icon={Trophy} label="Best Session" value={`${stats.bestSessionAccuracy || 0}%`} />
            <HeroStat icon={GraduationCap} label="Total Attempted" value={stats.totalAttempted || 0} />
          </div>
        </div>
      </div>

      {/* Weak topics auto-surface once user has data */}
      {weakTopics.length > 0 && (
        <div className="mb-8 p-5 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-rose-500" size={16} />
            <h3 className="font-bold text-rose-900 dark:text-rose-200">Your weakest topics</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">drill these first</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {weakTopics.map((t) => (
              <Link
                key={t.topic}
                to={`/theory/practice?section=mixed&count=10&topic=${encodeURIComponent(t.topic)}`}
                className="group flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/50 hover:border-rose-400 hover:shadow-sm transition"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{t.topic}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.correct}/{t.attempted} · <span className="text-rose-600 font-bold">{t.accuracy}% accuracy</span>
                  </p>
                </div>
                <ArrowRight className="text-rose-400 group-hover:translate-x-1 transition shrink-0" size={14} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mixed callout */}
      <Link
        to="/theory/practice?section=mixed&count=20"
        className="group relative block mb-8 p-5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white transition shadow-lg shadow-violet-500/20"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Mixed drill</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Random OS + CN + OOP · 20 Questions</h3>
            <p className="text-sm text-white/80">The closest simulation of real company MCQ rounds.</p>
          </div>
          <ArrowRight className="group-hover:translate-x-1 transition shrink-0" size={24} />
        </div>
      </Link>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Drill by Topic</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(SECTION_META).map(([key, meta]) => {
          const Icon = meta.icon;
          const sec = overview?.bySection?.[key] || { total: 0, topics: {} };
          const acc = sectionAccuracy(key);
          return (
            <div key={key} className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm hover:shadow-md">
              <div className={`h-1.5 bg-gradient-to-r ${meta.gradient}`} />
              <div className="p-5">
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-lg border ${meta.light} mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{meta.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{meta.desc}</p>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span>{sec.total} questions</span>
                  <span>{Object.keys(sec.topics || {}).length} topics</span>
                  {acc !== null && <span className="text-emerald-600 dark:text-emerald-400">{acc}% accuracy</span>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link to={`/theory/practice?section=${key}&count=10`} className="py-2 px-3 rounded-md text-xs font-bold text-center border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition">
                    10 Q · Quick
                  </Link>
                  <Link to={`/theory/practice?section=${key}&count=15`} className={`py-2 px-3 rounded-md text-xs font-bold text-center text-white bg-gradient-to-r ${meta.gradient} hover:opacity-90 transition`}>
                    15 Q · Full
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* eslint-disable no-unused-vars */
const HeroStat = ({ icon: Icon, label, value }) => (
  <div className="bg-white/5 backdrop-blur rounded-lg p-3 border border-white/10">
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className="text-slate-400" size={12} />
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
    </div>
    <p className="text-xl font-black text-white">{value}</p>
  </div>
);
