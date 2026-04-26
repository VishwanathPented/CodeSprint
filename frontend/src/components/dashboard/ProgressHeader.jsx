import { Flame, Target, Trophy } from 'lucide-react';

export default function ProgressHeader({ user }) {
  if (!user) return null;
  const percentage = Math.round(((user.completedDays?.length || 0) / 50) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 sm:p-6 w-full">
      <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-stretch md:items-center justify-between">
        
        <div className="flex-1 w-full">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white mb-2">
            <Target className="text-primary-500" size={24} /> 
            50-Day Challenge
          </h2>
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">
            <span>{percentage}% Completed</span>
            <span>{user.completedDays.length} / 50 Days</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-sm h-1.5 mt-1 border border-slate-200 dark:border-slate-700">
            <div 
              className="bg-slate-800 dark:bg-slate-200 h-1.5 rounded-sm transition-all duration-1000 ease-out" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-md border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Streak</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{user.streak}</p>
            </div>
          </div>
          
          <div className="flex-1 md:flex-none flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-md border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Score</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {user.scores?.reduce((acc, curr) => acc + (curr.mcqScore || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
