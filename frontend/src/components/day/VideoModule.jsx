import { PlayCircle, CheckCircle } from 'lucide-react';

export default function VideoModule({ content, onComplete, isCompleted }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
        <PlayCircle className="text-primary-500" size={24} />
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">1. Video Lesson & Concept</h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
          <div className="aspect-video w-full h-fit bg-slate-900 rounded-xl overflow-hidden relative group">
            <iframe 
              src={content.videoUrl} 
              title="Video Player"
              className="w-full h-full absolute inset-0"
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="flex flex-col space-y-6">
            <div>
              <h4 className="font-bold text-xl text-slate-800 dark:text-slate-100 mb-3">Topic Explanation</h4>
              <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {content.detailedExplanation}
              </div>
            </div>
            
            {content.commonConfusions && (
              <div className="p-5 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/40 rounded-xl">
                 <h4 className="font-bold text-orange-800 dark:text-orange-400 mb-2 flex items-center gap-2">
                   ⚠️ What Many People Get Confused By
                 </h4>
                 <p className="text-orange-800 dark:text-orange-300/90 text-sm leading-relaxed whitespace-pre-wrap">
                   {content.commonConfusions}
                 </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {isCompleted ? "Great! You've watched this lesson." : "Watch the lesson carefully before proceeding."}
          </p>
          <button 
            onClick={onComplete}
            disabled={isCompleted}
            className={`px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${
              isCompleted 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md'
            }`}
          >
            {isCompleted ? <><CheckCircle size={18} /> Watched</> : 'Mark as Watched'}
          </button>
        </div>
      </div>
    </div>
  );
}
