import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VideoModule from '../components/day/VideoModule';
import McqModule from '../components/day/McqModule';
import CodeModule from '../components/day/CodeModule';
import AptitudeModule from '../components/day/AptitudeModule';
import { CheckCircle2, Trophy, Loader2 } from 'lucide-react';
import { API_URL } from '../utils/config';

export default function DayDetail() {
  const { id } = useParams();
  const { token, user, updateProgress } = useAuth();
  const navigate = useNavigate();
  
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Progress states
  const [videoWatched, setVideoWatched] = useState(false);
  const [mcqScore, setMcqScore] = useState(null);
  const [codeAttempted, setCodeAttempted] = useState(false);
  const [aptitudeScore, setAptitudeScore] = useState(null);

  const isAlreadyCompleted = user?.completedDays?.includes(Number(id));

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${API_URL}/content/day/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setContent(data);
          
          if (isAlreadyCompleted) {
            setVideoWatched(true);
            setMcqScore(10); // Mock past
            setCodeAttempted(true);
            setAptitudeScore(5); // Mock past
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchContent();
  }, [id, token, isAlreadyCompleted]);

  const isDayFinished = videoWatched && mcqScore !== null && codeAttempted && aptitudeScore !== null;

  const handleCompleteDay = async () => {
    if (isAlreadyCompleted) {
      navigate('/');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/user/complete-day`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          dayNumber: Number(id),
          mcqScore,
          codingAttempted: codeAttempted,
          aptitudeScore
        })
      });
      const data = await res.json();
      if (res.ok) {
        updateProgress(data.user);
        alert(data.message);
        navigate('/');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-primary-500" size={40} />
      <p className="text-slate-500 font-medium">Loading your lesson...</p>
    </div>
  );
  if (!content) return <div className="p-8 text-center text-red-500 font-bold">Content not found.</div>;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8 space-y-10">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 text-sm font-bold rounded-full mb-4 uppercase tracking-wider">
          Day {content.dayNumber}
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{content.topicTitle}</h1>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">{content.description}</p>
      </div>

      <div className="space-y-6">
        <VideoModule content={content} onComplete={() => setVideoWatched(true)} isCompleted={videoWatched} />
        
        {videoWatched && (
          <McqModule mcqs={content.mcqs} onComplete={(score) => setMcqScore(score)} score={mcqScore} />
        )}
        
        {mcqScore !== null && (
          <CodeModule problem={content.codingProblem} onComplete={() => setCodeAttempted(true)} isCompleted={codeAttempted} />
        )}

        {codeAttempted && (
           <AptitudeModule questions={content.aptitudeQuestions} onComplete={(score) => setAptitudeScore(score)} score={aptitudeScore} />
        )}
      </div>

      {isDayFinished && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-8 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Excellent Work!</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
            You have successfully completed all tasks for today. Keep this streak alive and return tomorrow!
          </p>
          <button 
            onClick={handleCompleteDay}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition transform hover:-translate-y-1 flex items-center gap-2 mx-auto"
          >
            <CheckCircle2 size={20} />
            {isAlreadyCompleted ? 'Return to Dashboard' : 'Mark Day as Complete & Unlock Next'}
          </button>
        </div>
      )}
    </div>
  );
}
