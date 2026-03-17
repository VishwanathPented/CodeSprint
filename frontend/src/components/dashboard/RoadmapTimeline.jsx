import { Link } from 'react-router-dom';
import { Lock, Unlock, CheckCircle, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export default function RoadmapTimeline({ days, currentDay, completedDays }) {
  return (
    <div className="space-y-4 relative">
      <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
      
      {days.map((day) => {
        const isCompleted = completedDays.includes(day.dayNumber);
        const isActive = day.dayNumber === currentDay;
        const isLocked = day.dayNumber > currentDay;

        return (
          <div 
            key={day.dayNumber} 
            className={clsx(
              "relative z-10 flex flex-col md:flex-row gap-4 p-4 md:p-6 rounded-2xl border transition-all duration-300",
              isCompleted && "bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/50 opacity-80",
              isActive && "bg-white border-primary-500 dark:bg-slate-800 dark:border-primary-500 shadow-xl shadow-primary-500/10 scale-[1.02]",
              isLocked && "bg-slate-50/50 border-slate-100 dark:bg-slate-800/20 dark:border-slate-800 opacity-60"
            )}
          >
            {/* Timeline Node */}
            <div className="hidden md:flex flex-col items-center justify-center shrink-0 w-16 -ml-5 z-20">
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center border-[3px] shadow-sm",
                isCompleted ? "bg-emerald-500 border-emerald-100 dark:border-emerald-900/30 text-white" :
                isActive ? "bg-primary-500 border-primary-100 dark:border-primary-900/30 text-white animate-pulse" :
                "bg-slate-200 border-white dark:bg-slate-700 dark:border-slate-800 text-slate-400"
              )}>
                {isCompleted ? <CheckCircle size={20} /> : 
                 isActive ? <Unlock size={18} /> : 
                 <Lock size={18} />}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className={clsx(
                  "text-xs font-bold tracking-wider uppercase px-2 py-1 rounded-md",
                  isCompleted ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                  isActive ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400" :
                  "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                )}>
                  Day {day.dayNumber}
                </span>
                <h3 className={clsx(
                  "text-lg font-bold",
                  isLocked ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"
                )}>
                  {day.topicTitle}
                </h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-2">
                {day.description}
              </p>
            </div>

            <div className="shrink-0 flex items-center mt-4 md:mt-0">
              {isLocked ? (
                <button disabled className="w-full md:w-auto px-5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-medium cursor-not-allowed flex items-center justify-center gap-2">
                  <Lock size={16} /> Locked
                </button>
              ) : isActive ? (
                <Link to={`/day/${day.dayNumber}`} className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-all shadow-md shadow-primary-500/20 flex items-center justify-center gap-2 group">
                  Start Learning <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link to={`/day/${day.dayNumber}`} className="w-full md:w-auto px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-medium transition-colors flex items-center justify-center">
                  Review Concept
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
