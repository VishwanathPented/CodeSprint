import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/config';
import {
  Code2, Loader2, ArrowRight, CheckCircle2, Filter, Layers, Boxes,
  ListChecks, Workflow, Hash, Network, GitBranch, Target, Trophy
} from 'lucide-react';
import clsx from 'clsx';

const TOPIC_META = {
  arrays: { title: 'Arrays', icon: Layers, gradient: 'from-blue-500 to-indigo-600' },
  strings: { title: 'Strings', icon: ListChecks, gradient: 'from-emerald-500 to-teal-600' },
  'linked-list': { title: 'Linked List', icon: GitBranch, gradient: 'from-amber-500 to-orange-600' },
  'stack-queue': { title: 'Stack & Queue', icon: Boxes, gradient: 'from-violet-500 to-purple-600' },
  hashing: { title: 'Hashing', icon: Hash, gradient: 'from-rose-500 to-pink-600' },
  'recursion-trees': { title: 'Recursion & Trees', icon: Network, gradient: 'from-cyan-500 to-sky-600' }
};

export default function DsaTrack() {
  const { user, token } = useAuth();
  const [overview, setOverview] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicFilter, setTopicFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovRes, probRes] = await Promise.all([
          fetch(`${API_URL}/dsa/overview`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/dsa/problems`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const ovData = await ovRes.json();
        const probData = await probRes.json();
        if (ovRes.ok) setOverview(ovData);
        if (probRes.ok) setProblems(probData.problems || []);
      } catch (err) {
        console.error('DSA fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const solvedSet = useMemo(() => new Set(user?.dsaProgress?.solvedProblems || overview?.solved || []), [user, overview]);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (topicFilter !== 'all' && p.topic !== topicFilter) return false;
      if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
      if (companyFilter !== 'all' && !(p.companies || []).includes(companyFilter)) return false;
      return true;
    });
  }, [problems, topicFilter, difficultyFilter, companyFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-primary-500" size={40} />
        <p className="text-slate-500 font-medium">Loading DSA problems...</p>
      </div>
    );
  }

  const totalSolved = solvedSet.size;
  const total = overview?.totalProblems || problems.length;
  const percent = total ? Math.round((totalSolved / total) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 border border-slate-800 p-8 mb-8">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-rose-500/10 blur-3xl rounded-full" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-4">
            <Workflow className="text-blue-300" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">DSA Track</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Build problem-solving muscle.</h1>
          <p className="text-slate-300 max-w-2xl">
            30 curated problems across 6 topics, tagged by company. Easy-to-medium difficulty matches what tier-3 placements actually ask.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <HeroStat icon={ListChecks} label="Solved" value={`${totalSolved} / ${total}`} />
            <HeroStat icon={Target} label="Progress" value={`${percent}%`} />
            <HeroStat icon={Trophy} label="Topics" value={Object.keys(TOPIC_META).length} />
            <HeroStat icon={Code2} label="Companies" value={overview?.companies?.length || 0} />
          </div>

          <div className="mt-5 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-rose-500 transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      {/* Topic cards */}
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Browse by Topic</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {Object.entries(TOPIC_META).map(([key, meta]) => {
          const Icon = meta.icon;
          const stats = overview?.byTopic?.[key] || { total: 0 };
          const solvedHere = problems.filter((p) => p.topic === key && solvedSet.has(p.slug)).length;
          const isActive = topicFilter === key;
          return (
            <button
              key={key}
              onClick={() => setTopicFilter(isActive ? 'all' : key)}
              className={clsx(
                'group relative overflow-hidden rounded-xl border bg-white dark:bg-slate-900 transition text-left',
                isActive ? 'border-primary-500 shadow-md ring-2 ring-primary-200 dark:ring-primary-900/30' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
              )}
            >
              <div className={`h-1 bg-gradient-to-r ${meta.gradient}`} />
              <div className="p-4">
                <Icon className="text-slate-500 mb-2" size={18} />
                <p className="text-xs font-bold text-slate-900 dark:text-white">{meta.title}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">{solvedHere} / {stats.total} solved</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center flex-wrap gap-2 mb-6">
        <Filter className="text-slate-400" size={14} />
        <FilterPill label="All Topics" active={topicFilter === 'all'} onClick={() => setTopicFilter('all')} />
        <span className="text-slate-300 dark:text-slate-700">·</span>
        {['Easy', 'Medium', 'Hard'].map((d) => (
          <FilterPill key={d} label={d} active={difficultyFilter === d} onClick={() => setDifficultyFilter(difficultyFilter === d ? 'all' : d)} />
        ))}
        <span className="text-slate-300 dark:text-slate-700">·</span>
        {(overview?.companies || []).slice(0, 8).map((c) => (
          <FilterPill key={c.name} label={`${c.name} (${c.count})`} active={companyFilter === c.name} onClick={() => setCompanyFilter(companyFilter === c.name ? 'all' : c.name)} />
        ))}
      </div>

      {/* Problem list */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
          <span>{filtered.length} problems</span>
          <span>{filtered.filter((p) => solvedSet.has(p.slug)).length} solved</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((p) => {
            const isSolved = solvedSet.has(p.slug);
            return (
              <Link
                key={p.slug}
                to={`/dsa/${p.slug}`}
                className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
              >
                <div className={clsx('w-8 h-8 rounded-md flex items-center justify-center shrink-0',
                  isSolved ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                )}>
                  {isSolved ? <CheckCircle2 size={16} /> : <span className="font-bold text-xs">{p.order}</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{p.title}</span>
                    <span className={clsx(
                      'text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border',
                      p.difficulty === 'Hard' && 'text-rose-600 border-rose-200 bg-rose-50 dark:text-rose-300 dark:bg-rose-900/20 dark:border-rose-800/50',
                      p.difficulty === 'Medium' && 'text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-800/50',
                      p.difficulty === 'Easy' && 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-800/50'
                    )}>{p.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{TOPIC_META[p.topic]?.title}</span>
                    {(p.companies || []).slice(0, 4).map((c) => (
                      <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <ArrowRight className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition shrink-0" size={16} />
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <p className="p-10 text-center text-slate-500">No problems match these filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
const HeroStat = ({ icon: Icon, label, value }) => (
  <div className="bg-white/5 backdrop-blur rounded-lg p-3 border border-white/10">
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className="text-slate-400" size={12} />
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
    </div>
    <p className="text-xl font-black text-white">{value}</p>
  </div>
);

const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={clsx(
      'text-[11px] font-bold px-2.5 py-1 rounded-md border transition',
      active
        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
    )}
  >
    {label}
  </button>
);
