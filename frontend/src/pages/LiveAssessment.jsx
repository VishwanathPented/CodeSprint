import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldAlert, Cpu, Loader2, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../utils/config';

export default function LiveAssessment() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  const timerRef = useRef(null);
  const tabSwitchesRef = useRef(0);
  const answersRef = useRef({});

  // Fetch Test Data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(`${API_URL}/assessments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Failed to initialize testing environment.');
        }

        setTest(data);
        setTimeLeft(data.durationMinutes * 60); // Convert to seconds
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchTest();
  }, [id, token]);

  // Sync refs for the visibility event handler
  useEffect(() => {
    answersRef.current = answers;
    tabSwitchesRef.current = tabSwitches;
  }, [answers, tabSwitches]);

  // Proctoring: Tab Visibility Listener
  useEffect(() => {
    if (!test || submittedResult || isTerminated) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = tabSwitchesRef.current + 1;
        setTabSwitches(newCount);
        
        if (newCount >= 3) {
          setIsTerminated(true);
          handleAutoSubmit(newCount, true); // True means forced due to cheating
        } else {
          alert(`⚠️ WARNING: Tab switch detected! (${newCount}/3 strikes). Do not leave this page during the exam. Your test will be auto-submitted with a 0 penalty on the 3rd strike.`);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [test, submittedResult, isTerminated]);

  // Timer Countdown
  useEffect(() => {
    if (!test || submittedResult || isTerminated || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit(tabSwitchesRef.current, false); // Time elapsed submission
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [test, submittedResult, isTerminated, timeLeft]);

  // Submit API Call
  const submitExam = async (submitAnswers, switchCount, isAutoSubmit) => {
    setSubmitting(true);
    try {
      const timeTakenMins = Math.round((test.durationMinutes * 60 - timeLeft) / 60);
      
      const res = await fetch(`${API_URL}/assessments/submit/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: submitAnswers,
          tabSwitches: switchCount,
          timeTaken: timeTakenMins,
          isAutoSubmit
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setSubmittedResult(data);
    } catch (err) {
      alert(`Submission Error: ${err.message}`);
      setIsTerminated(false); // If network error, don't perm lock UI just yet.
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (window.confirm("Are you sure you want to submit your assessment? You cannot reverse this.")) {
      submitExam(answers, tabSwitches, false);
    }
  };

  const handleAutoSubmit = (violationCount, forcedByCheating) => {
    submitExam(answersRef.current, violationCount, forcedByCheating);
  };

  // Format Timer (MM:SS)
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
     <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
        <Cpu className="animate-pulse text-blue-500 mb-6" size={64} />
        <h2 className="text-2xl font-black text-white capitalize tracking-widest mb-2">Initializing Assessment Gateway</h2>
        <p className="text-blue-400 font-mono text-sm">Validating secure connection & loading models...</p>
     </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl text-center">
         <AlertTriangle size={64} className="mx-auto text-red-500 mb-6" />
         <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Access Denied</h2>
         <p className="text-slate-500 dark:text-slate-400 mb-8">{error}</p>
         <button onClick={() => navigate('/assessments')} className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:opacity-80 transition">
           Return to Dashboard
         </button>
      </div>
    </div>
  );

  if (submittedResult) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 text-center animate-in zoom-in-95 duration-500">
         {submittedResult.warnings >= 3 ? (
            <ShieldAlert size={80} className="mx-auto text-red-500 mb-6 drop-shadow-md" />
         ) : (
            <CheckCircle2 size={80} className="mx-auto text-emerald-500 mb-6 drop-shadow-md" />
         )}
         
         <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            {submittedResult.warnings >= 3 ? 'Terminated' : 'Assessment Complete'}
         </h1>
         <p className="text-slate-500 dark:text-slate-400 mb-8">{submittedResult.message}</p>
         
         <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Final Score</div>
            <div className={`text-6xl font-black ${submittedResult.warnings >= 3 ? 'text-red-500' : 'text-emerald-500'}`}>
               {submittedResult.score} <span className="text-2xl text-slate-300 dark:text-slate-700">/ {submittedResult.total}</span>
            </div>
         </div>
         
         <button onClick={() => navigate('/assessments')} className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-xl transition shadow-lg shadow-primary-500/30">
           Continue to Placements Portal
         </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 select-none">
      
      {/* Sticky Proctor Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 md:px-8 py-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
               <Briefcase size={20} className="text-primary-500" />
            </div>
            <div>
               <h2 className="font-bold text-slate-900 dark:text-white leading-tight">{test.companyName}</h2>
               <p className="text-xs text-slate-500 font-medium">Placement Assessment</p>
            </div>
         </div>

         <div className="flex items-center gap-4 md:gap-8">
            <div className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-lg border ${tabSwitches > 0 ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'}`}>
               <span className={`text-[10px] font-black uppercase tracking-wider ${tabSwitches > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                 Proctor Strike
               </span>
               <div className="flex gap-1 mt-1">
                 {[1,2,3].map(i => (
                   <div key={i} className={`w-3 h-3 rounded-full ${i <= tabSwitches ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                 ))}
               </div>
            </div>

            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5"><Clock size={10} className="inline mr-1 -mt-0.5" /> Time Remaining</span>
               <span className={`text-2xl font-mono font-bold tracking-tight ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-800 dark:text-white'}`}>
                 {formatTime(timeLeft)}
               </span>
            </div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
         {/* Questions Loop */}
         {test.mcqs.map((mcq, idx) => (
           <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 mb-8 border border-slate-200 dark:border-slate-700 shadow-sm relative">
             <div className="absolute top-0 left-0 w-12 h-12 bg-indigo-600 rounded-br-3xl flex items-center justify-center text-white font-black text-lg shadow-md">
               {idx + 1}
             </div>
             
             <div className="mt-8 mb-8">
               <h3 className="text-lg md:text-xl font-medium text-slate-900 dark:text-white leading-relaxed font-mono">
                  {mcq.question.split('\\n').map((line, i) => (
                    <span key={i}>{line}<br/></span>
                  ))}
               </h3>
             </div>

             <div className="space-y-3">
               {mcq.options.map((opt, oIdx) => {
                 const isSelected = answers[idx] === oIdx;
                 return (
                   <label 
                     key={oIdx} 
                     className={`flex items-center gap-4 p-4 rounded-xl border-2 transition cursor-pointer ${isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                   >
                     <input 
                       type="radio"
                       name={`mcq-${idx}`}
                       value={oIdx}
                       checked={isSelected}
                       onChange={() => setAnswers({...answers, [idx]: oIdx})}
                       className="w-5 h-5 text-primary-600 focus:ring-primary-500 border-slate-300 cursor-pointer"
                     />
                     <span className={`text-sm md:text-base font-medium ${isSelected ? 'text-primary-800 dark:text-primary-300 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                       {opt}
                     </span>
                   </label>
                 );
               })}
             </div>
           </div>
         ))}
      </div>

      {/* Footer Submit Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-4 md:px-8 z-40 transform translate-y-0 shadow-[-0_-10px_40px_rgba(0,0,0,0.2)]">
         <div className="max-w-4xl mx-auto flex items-center justify-between">
           <div className="text-slate-400 text-sm font-medium">
             Attempted: <strong className="text-white">{Object.keys(answers).length}</strong> / {test.mcqs.length}
           </div>
           <button 
             onClick={handleManualSubmit}
             disabled={submitting || isTerminated}
             className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
           >
             {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Submit Execution'} <ArrowRight size={18} />
           </button>
         </div>
      </div>

    </div>
  );
}
