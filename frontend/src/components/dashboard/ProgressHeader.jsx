import { Flame, Target, Trophy } from 'lucide-react';

export default function ProgressHeader({ user }) {
  if (!user) return null;
  const percentage = Math.round(((user.completedDays?.length || 0) / 50) * 100);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 w-full">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        
        <div className="flex-1 w-full">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white mb-2">
            <Target className="text-primary-500" size={24} /> 
            50-Day Challenge
          </h2>
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">
            <span>{percentage}% Completed</span>
            <span>{user.completedDays.length} / 50 Days</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
            <div 
              className="bg-primary-500 h-3 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 px-4 py-3 rounded-xl border border-orange-100 dark:border-orange-900/50">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg text-orange-500">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider">Streak</p>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{user.streak} <span className="text-sm font-normal">days</span></p>
            </div>
          </div>
          
          <div className="flex-1 md:flex-none flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 rounded-xl border border-amber-100 dark:border-amber-900/50">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-500">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">Score</p>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
                {user.scores?.reduce((acc, curr) => acc + (curr.mcqScore || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
