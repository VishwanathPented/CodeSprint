import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/config';
import RoadmapTimeline from '../components/dashboard/RoadmapTimeline';
import GithubRepoLinker from '../components/dashboard/GithubRepoLinker';
import { Coffee, Loader2, Target, Trophy, Flame, BookOpen, AlertCircle, Rocket } from 'lucide-react';

export default function JavaTrack() {
  const { user, token, updateProgress } = useAuth();
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await fetch(`${API_URL}/content/roadmap`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) setRoadmap(data);
      } catch (err) {
        console.error('Java roadmap fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchRoadmap();
  }, [token]);

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-primary-500" size={40} />
        <p className="text-slate-500 font-medium">Loading Java curriculum...</p>
      </div>
    );
  }

  const completed = user?.completedDays?.length || 0;
  const currentDay = user?.currentDay || 1;
  const streak = user?.streak || 0;
  const total = roadmap.length || 50;
  const percent = Math.round((completed / total) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 border border-slate-800 p-8 mb-8">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-orange-500/10 blur-3xl rounded-full" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-4">
            <Coffee className="text-orange-300" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Java 50</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Build Java fundamentals in 50 days.
          </h1>
          <p className="text-slate-300 max-w-2xl">
            Daily lessons covering syntax, OOP, collections, streams, multithreading, and more — each day combines a video, MCQs, code practice, and aptitude.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <HeroStat icon={BookOpen} label="Completed" value={`${completed} / ${total}`} />
            <HeroStat icon={Target} label="Current Day" value={`#${currentDay}`} />
            <HeroStat icon={Flame} label="Streak" value={`${streak} ${streak === 1 ? 'day' : 'days'}`} />
            <HeroStat icon={Trophy} label="Progress" value={`${percent}%`} />
          </div>

          {/* Overall progress bar */}
          <div className="mt-5 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: timeline */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight flex items-center gap-2">
            <Rocket className="text-slate-500" size={20} />
            Your 50-Day Roadmap
          </h2>
          <RoadmapTimeline
            days={roadmap}
            currentDay={user?.currentDay}
            completedDays={user?.completedDays || []}
          />
        </div>

        {/* Right: Github + Git quick start */}
        <div className="space-y-6">
          <GithubRepoLinker user={user} token={token} onUpdate={updateProgress} />

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 space-y-3">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
              <AlertCircle size={16} /> Git Quick Start
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              New to Git? Here's how to push your daily code:
            </p>
            <div className="space-y-2 font-mono text-[10px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-md">
              <p>1. <code className="font-bold text-slate-900 dark:text-slate-100">git init</code></p>
              <p>2. <code className="font-bold text-slate-900 dark:text-slate-100">git add Day1/Main.java</code></p>
              <p>3. <code className="font-bold text-slate-900 dark:text-slate-100">git commit -m "Day 1"</code></p>
              <p>4. <code className="font-bold text-slate-900 dark:text-slate-100">git push origin main</code></p>
            </div>
          </div>
        </div>
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
