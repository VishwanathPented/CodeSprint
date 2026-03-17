import { useState, useEffect } from 'react';
import { Trophy, Flame, User } from 'lucide-react';
import { API_URL } from '../../utils/config';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await fetch(`${API_URL}/user/leaderboard`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setLeaders(data);
        }
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  if (loading) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-500" size={20} />
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Top Sprinters</h3>
        </div>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {leaders.map((leader, index) => (
          <div key={leader._id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
            <div className="flex items-center gap-3">
              <span className={`w-6 text-sm font-bold ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-300'}`}>
                #{index + 1}
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                <User size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{leader.name}</p>
                <p className="text-xs text-slate-500">{leader.completedDays.length} days completed</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
              <Flame size={14} fill="currentColor" />
              <span className="text-xs font-bold">{leader.streak}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
