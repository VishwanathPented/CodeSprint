import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VideoModule from '../components/day/VideoModule';
import McqModule from '../components/day/McqModule';
import PredictOutputModule from '../components/day/PredictOutputModule';
import CodeEditorModule from '../components/day/CodeEditorModule';
import CommentSection from '../components/day/CommentSection';
import AITutorBot from '../components/day/AITutorBot';
import TextWithTooltips from '../components/day/TextWithTooltips';
import { CircleCheckBig, Trophy, Loader2, Sparkles, Code2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
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
  const [predictPassed, setPredictPassed] = useState(false);
  const [codeAttempted, setCodeAttempted] = useState(false);
  const [githubLink, setGithubLink] = useState('');
  const [refactorPassed, setRefactorPassed] = useState(false);
  const [refactorLink, setRefactorLink] = useState('');

  // ELI5 State
  const [isEli5, setIsEli5] = useState(false);
  const [eli5Loading, setEli5Loading] = useState(false);
  const [eli5Text, setEli5Text] = useState('');

  const isAlreadyCompleted = user?.completedDays?.includes(Number(id));
  const persistKey = `day_${id}_progress_${user?._id}`;

  // Load partial progress from local storage
  useEffect(() => {
    if (!isAlreadyCompleted && user && content) {
      const saved = localStorage.getItem(persistKey);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          if (p.videoWatched !== undefined) setVideoWatched(p.videoWatched);
          if (p.mcqScore !== null) setMcqScore(p.mcqScore);
          if (p.predictPassed !== undefined) setPredictPassed(p.predictPassed);
          if (p.codeAttempted !== undefined) setCodeAttempted(p.codeAttempted);
          if (p.githubLink !== undefined) setGithubLink(p.githubLink);
          if (p.refactorPassed !== undefined) setRefactorPassed(p.refactorPassed);
          if (p.refactorLink !== undefined) setRefactorLink(p.refactorLink);
        } catch (e) {
          console.error('Failed to load progress', e);
        }
      }
    }
  }, [isAlreadyCompleted, user, content, persistKey]);

  // Save partial progress to local storage
  useEffect(() => {
    if (!isAlreadyCompleted && user && content) {
      const progress = { videoWatched, mcqScore, predictPassed, codeAttempted, githubLink, refactorPassed, refactorLink };
      localStorage.setItem(persistKey, JSON.stringify(progress));
    }
  }, [videoWatched, mcqScore, predictPassed, codeAttempted, githubLink, refactorPassed, refactorLink, isAlreadyCompleted, user, content, persistKey]);

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
            setMcqScore(10); 
            setPredictPassed(true);
            setCodeAttempted(true);
            
            // Find existing GitHub link if available
            const dayScore = user.scores?.find(s => s.dayNumber === Number(id));
            if (dayScore?.githubLink) setGithubLink(dayScore.githubLink);
            if (dayScore?.refactorLink) setRefactorLink(dayScore.refactorLink);

            setRefactorPassed(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchContent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token, isAlreadyCompleted]);

  const isDayFinished = videoWatched && mcqScore !== null && predictPassed && codeAttempted;

  const fetchEli5 = async () => {
    if (isEli5) {
      setIsEli5(false);
      return;
    }
    if (eli5Text) {
      setIsEli5(true);
      return;
    }

    setEli5Loading(true);
    try {
      const res = await fetch(`${API_URL}/ai/eli5`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          topicTitle: content.topicTitle,
          description: content.description
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEli5Text(data.simplifiedText);
        setIsEli5(true);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to AI Tutor.');
    } finally {
      setEli5Loading(false);
    }
  };

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
          githubLink
        })
      });
      const data = await res.json();
      if (res.ok) {
        updateProgress(data.user);
        localStorage.removeItem(persistKey);
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
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 relative">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 text-sm font-bold rounded-full mb-4 uppercase tracking-wider">
              Day {content.dayNumber}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{content.topicTitle}</h1>
          </div>
          
          <button 
            onClick={fetchEli5}
            disabled={eli5Loading}
            className={`shrink-0 px-4 py-2 border rounded-xl font-bold flex items-center gap-2 transition ${isEli5 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300 shadow-inner' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-300 shadow-sm'}`}
          >
            {eli5Loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className={isEli5 ? 'text-indigo-500' : 'text-amber-500'} />}
            {isEli5 ? 'Read Original' : 'Explain Like I\'m 5'}
          </button>
        </div>

        {isEli5 && eli5Text ? (
          <div className="prose prose-sm dark:prose-invert max-w-3xl bg-slate-50 dark:bg-slate-900 p-5 rounded-md border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
             <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
               <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
               <span className="text-[10px] uppercase font-black tracking-widest text-indigo-700 dark:text-indigo-400">Simplified by Sprint-AI</span>
             </div>
             <ReactMarkdown
                components={{
                  strong: ({children}) => <strong className="font-black text-indigo-900 dark:text-indigo-200">{children}</strong>,
                  p: ({children}) => <p className="mb-3 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{children}</p>,
                  ul: ({children}) => <ul className="list-disc ml-4 space-y-2 mb-3 text-slate-700 dark:text-slate-300">{children}</ul>,
                }}
             >
                {eli5Text}
             </ReactMarkdown>
          </div>
        ) : (
          <TextWithTooltips text={content.description} className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl animate-in fade-in block" />
        )}
      </div>

      <div className="space-y-6">
        <VideoModule content={content} onComplete={() => setVideoWatched(true)} isCompleted={videoWatched} />
        
        {videoWatched && (
          <McqModule mcqs={content.mcqs} onComplete={(score) => setMcqScore(score)} score={mcqScore} />
        )}
        
        {mcqScore !== null && (
          <PredictOutputModule 
            predicts={content.predictOutput} 
            onComplete={() => setPredictPassed(true)} 
            isCompleted={predictPassed} 
          />
        )}

        {predictPassed && (
          <CodeEditorModule 
            problem={content.codingProblem} 
            dayNumber={content.dayNumber}
            dayTopic={content.topicTitle}
            onComplete={(link) => {
              setGithubLink(link);
              setCodeAttempted(true);
            }} 
            isCompleted={codeAttempted}
          />
        )}

        {codeAttempted && content.dsaSlugs?.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="text-blue-500" size={18} />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Now solve these DSA problems</h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">apply what you just learned</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Real placement rounds test you on applied problem-solving. Use today's concept on these curated problems.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {content.dsaSlugs.map((slug) => (
                <Link
                  key={slug}
                  to={`/dsa/${slug}`}
                  className="group flex items-center justify-between gap-2 p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition"
                >
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">{slug}</span>
                  <ArrowRight className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition shrink-0" size={12} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {isDayFinished && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Excellent Work!</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
            You have successfully completed all tasks for today. Keep this streak alive and return tomorrow!
          </p>
          <button 
            onClick={handleCompleteDay}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md mx-auto transition flex items-center gap-2"
          >
            <CircleCheckBig size={18} />
            {isAlreadyCompleted ? 'Return to Dashboard' : 'Mark Day as Complete & Unlock Next'}
          </button>
        </div>
      )}

      <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
        <CommentSection dayNumber={content.dayNumber} />
      </div>

      {/* Floating AI Tutor */}
      <AITutorBot 
        dayNumber={content.dayNumber} 
        dayTopic={content.topicTitle} 
        token={token} 
      />
    </div>
  );
}
