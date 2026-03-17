import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProgressHeader from '../components/dashboard/ProgressHeader';
import RoadmapTimeline from '../components/dashboard/RoadmapTimeline';
import { Sparkles, Linkedin, Check, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../utils/config';

export default function Dashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `Day ${user?.completedDays.length || 0}/50 completed ✅ Currently building my skills on CodeSprint 50! 🚀 #CodingJourney #CodeSprint50`;
    navigator.clipboard.writeText(text);
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
        setRoadmap(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchRoadmap();
  }, [token]);

  if (loading || authLoading || !user) return (
    <div className="flex items-center justify-center h-full flex-grow py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
      
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl shadow-lg text-white">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Welcome back, {user?.name.split(' ')[0]}! Ready to code?
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button 
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 bg-[#0077b5] hover:bg-[#006396] text-white font-bold py-3 px-4 rounded-xl transition shadow-md shadow-[#0077b5]/20"
        >
          {copied ? <Check size={20} /> : <Linkedin size={20} />}
          {copied ? 'Copied to Clipboard!' : 'Share Progress on LinkedIn'}
        </button>
        
        {!user?.isSubscribed && (
          <Link 
            to="/subscribe"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md shadow-primary-500/20"
          >
            <Rocket size={20} />
            Unlock Full Access
          </Link>
        )}
      </div>

      <ProgressHeader user={user} />

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
          Your Coding Journey
        </h2>
        <RoadmapTimeline 
          days={roadmap} 
          currentDay={user?.currentDay} 
          completedDays={user?.completedDays || []} 
        />
      </div>

    </div>
  );
}
