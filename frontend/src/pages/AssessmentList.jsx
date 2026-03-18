import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Clock, Trophy, Target, ArrowRight, ShieldAlert, Loader2, CheckCircle } from 'lucide-react';
import { API_URL } from '../utils/config';

export default function AssessmentList() {
  const { token } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await fetch(`${API_URL}/assessments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch company assessments.');
        const data = await res.json();
        setAssessments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAssessments();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-2xl border border-slate-800 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
             <div className="flex items-center gap-3 mb-3 text-primary-400">
                <Briefcase size={28} />
                <span className="font-bold tracking-widest uppercase text-sm">Placement Readiness</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-none">
               Company Mock Assessments
             </h1>
             <p className="text-slate-400 font-medium text-lg leading-relaxed">
               Simulate high-stakes hiring tests from top tech giants. These tests feature strict time limits, automated anti-cheat proctoring, and comprehensive scoring.
             </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shrink-0 w-full md:w-auto shadow-inner">
             <div className="flex items-start gap-4 text-amber-400">
                <ShieldAlert size={24} className="mt-1 shrink-0" />
                <div className="text-sm">
                   <p className="font-bold mb-1">Proctoring Enabled</p>
                   <p className="text-slate-400">Leaving the test tab strictly triggers a penalty. 3 warnings = Exam Terminated.</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold flex items-center gap-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assessments.map(test => (
          <div key={test._id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow group relative overflow-hidden">
            
            {/* Completion Ribbon */}
            {test.isCompleted && (
              <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-black text-xs uppercase tracking-widest rounded-full">
                <CheckCircle size={14} /> Submitted
              </div>
            )}

            <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-700 w-fit md:w-full mt-8 md:mt-0">
               <div className="flex items-center gap-3 mb-2">
                 <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] rounded-md">
                   {test.companyName}
                 </span>
                 <span className={`px-3 py-1 font-bold uppercase tracking-wider text-[10px] rounded-md ${test.difficulty === 'Hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'}`}>
                   {test.difficulty}
                 </span>
               </div>
               <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{test.title}</h2>
               <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-lg">
                 {test.description}
               </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 shrink-0">
                   <Clock size={18} />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                   <p className="font-bold text-slate-800 dark:text-slate-200">{test.durationMinutes} Mins</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500 shrink-0">
                   <Target size={18} />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Questions</p>
                   <p className="font-bold text-slate-800 dark:text-slate-200">{test.mcqs?.length || 0} MCQs</p>
                 </div>
               </div>
               
               {test.isCompleted && (
                 <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                   <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 shrink-0">
                     <Trophy size={18} />
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Score</p>
                     <p className="font-black text-emerald-700 dark:text-emerald-400">{test.score} / {test.mcqs?.length || 0}</p>
                   </div>
                 </div>
               )}
            </div>

            {test.isCompleted ? (
              <div className="w-full text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                Exam Successfully Submitted. Results are permanently recorded.
              </div>
            ) : (
              <Link 
                to={`/assessments/${test._id}`}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-primary-600/20"
              >
                Start Assessment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        ))}

        {assessments.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center">
             <Briefcase size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-6" />
             <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No active assessments</h3>
             <p className="text-slate-500">Administrators have not activated any Mock Placements yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
