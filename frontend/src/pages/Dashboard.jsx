import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProgressHeader from '../components/dashboard/ProgressHeader';
import RoadmapTimeline from '../components/dashboard/RoadmapTimeline';
import Leaderboard from '../components/dashboard/Leaderboard';
import GithubRepoLinker from '../components/dashboard/GithubRepoLinker';
import WarmupModal from '../components/dashboard/WarmupModal';
import OnboardingModal from '../components/dashboard/OnboardingModal';
import { Sparkles, Linkedin, Check, Rocket, Github, AlertCircle, Share2, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../utils/config';

export default function Dashboard() {
  const { user, token, loading: authLoading, updateProgress } = useAuth();
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isWarmupOpen, setIsWarmupOpen] = useState(false);

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/u/${user?.username}`;
    const text = `Day ${user?.completedDays.length || 0}/50 completed ✅ Check out my progress on CodeSprint 50: ${profileUrl}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
    window.open(linkedinUrl, '_blank');
  };

  const copyProfileLink = () => {
    const profileUrl = `${window.location.origin}/u/${user?.username}`;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await fetch(`${API_URL}/content/roadmap`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setRoadmap(data);
        } else {
          console.error("Roadmap data is not an array:", data);
        }
      } catch (err) {
        console.error("Fetch roadmap error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchRoadmap();
  }, [token]);

  // Auto-trigger onboarding if necessary
  const needsOnboarding = user && (!user.registrationDetails || !user.registrationDetails.isComplete);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Onboarding Blocker */}
      {needsOnboarding && <OnboardingModal />}
      
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl shadow-lg text-white">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Welcome back, {user?.name?.split(' ')[0] || 'Explorer'}! Ready to code?
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 shadow-sm">
           <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-lg shrink-0">
                 <Share2 size={18} />
              </div>
              <div className="overflow-hidden">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Public Profile</p>
                 <p className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                    {window.location.origin}/u/{user?.username}
                 </p>
              </div>
           </div>
           <button 
             onClick={copyProfileLink}
             className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition shrink-0"
           >
             {copied ? 'Copied!' : 'Copy Link'}
           </button>
        </div>

        <button 
          onClick={() => setIsWarmupOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white font-bold py-4 px-6 rounded-xl transition shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 flex-1 border border-slate-800 dark:border-white"
        >
          <Brain size={20} className="text-blue-400 dark:text-blue-600 animate-pulse" />
          Daily Warmup
        </button>

        <button 
          onClick={handleShare}
          className="bg-[#0077b5] hover:bg-[#006396] text-white font-bold py-4 px-6 rounded-xl transition shadow-md shadow-[#0077b5]/20 flex items-center justify-center gap-2 flex-1"
        >
          <Linkedin size={20} />
          Share Pro
        </button>
      </div>

      <ProgressHeader user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight flex items-center gap-2">
            <Rocket className="text-primary-500" size={24} />
            Your Coding Journey
          </h2>
          <RoadmapTimeline 
            days={roadmap} 
            currentDay={user?.currentDay} 
            completedDays={user?.completedDays || []} 
          />
        </div>
        
        <div className="space-y-6">
          <GithubRepoLinker user={user} token={token} onUpdate={updateProgress} />
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5 space-y-3">
             <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <AlertCircle size={18} /> Git Quick Start
             </h3>
             <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                New to Git? Don't worry. Here is how you push your code:
             </p>
             <div className="space-y-2 font-mono text-[10px] text-blue-800 dark:text-blue-300 bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg">
                <p>1. <code className="font-bold">git init</code></p>
                <p>2. <code className="font-bold">git add Day1/Main.java</code></p>
                <p>3. <code className="font-bold">git commit -m "Day 1"</code></p>
                <p>4. <code className="font-bold">git push origin main</code></p>
             </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 mt-12 tracking-tight">
            Leaderboard
          </h2>
          <Leaderboard />
        </div>
      </div>

      <WarmupModal isOpen={isWarmupOpen} onClose={() => setIsWarmupOpen(false)} />
    </div>
  );
}
