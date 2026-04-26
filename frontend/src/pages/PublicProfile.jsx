import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Flame, Github, Linkedin, CircleCheckBig, Calendar, Share2, ArrowLeft, Loader2 } from 'lucide-react';
import { API_URL } from '../utils/config';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Fetching public profile from:', `${API_URL}/public/profile/${username}`);
        const res = await fetch(`${API_URL}/public/profile/${username}`);
        if (!res.ok) {
          console.error('Profile fetch failed:', res.status, res.statusText);
          throw new Error('Profile not found');
        }
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
      <Loader2 className="animate-spin text-primary-500" size={40} />
      <p className="text-slate-500 font-medium animate-pulse">Fetching Achievement Data...</p>
    </div>
  );

  if (error || !profile) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6">
        <ArrowLeft size={40} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Profile Not Found</h1>
      <p className="text-slate-500 max-w-xs mb-8">The student you are looking for doesn't exist or has a private profile.</p>
      <Link to="/" className="px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold transition hover:scale-105">
        Back to CodeSprint
      </Link>
    </div>
  );

  const completionPercentage = (profile.completedDays?.length / 50) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-12 px-4 selection:bg-primary-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

        {/* Header / Brand */}
        <div className="flex justify-between items-center mb-6 sm:mb-12 gap-3">
           <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 transition group-hover:border-primary-500">
                 <ArrowLeft size={16} className="text-slate-600 dark:text-slate-400" />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary-600 transition">CodeSprint 50</span>
           </Link>
           <button 
             onClick={handleCopyLink}
             className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:border-primary-500 transition"
           >
             {copied ? <CircleCheckBig size={14} className="text-emerald-500" /> : <Share2 size={14} />}
             {copied ? 'Link Copied!' : 'Share Profile'}
           </button>
        </div>

        {/* Profile Card */}
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-2xl shadow-primary-500/5 border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none"></div>
          
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 md:gap-12">
            {/* Avatar / Rank */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-black text-slate-400 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden">
                {profile.name.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white p-2 sm:p-3 rounded-2xl shadow-lg transform rotate-12">
                <Trophy size={20} className="sm:w-6 sm:h-6" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-grow min-w-0 text-center md:text-left space-y-3 sm:space-y-4">
               <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2 break-words">
                    {profile.name}
                  </h1>
                  <p className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    @{profile.username}
                    <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                    <span className="text-sm uppercase tracking-widest font-bold">50-Day Challenger</span>
                  </p>
               </div>

               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <div className="px-4 py-2 bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 rounded-2xl flex items-center gap-2 font-black text-sm">
                    <Flame size={18} fill="currentColor" />
                    {profile.streak} DAY STREAK
                  </div>
                  <div className="px-4 py-2 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 rounded-2xl flex items-center gap-2 font-black text-sm">
                    <CircleCheckBig size={18} />
                    {profile.completedDays?.length}/50 COMPLETED
                  </div>
               </div>

               {profile.githubRepo && (
                 <a 
                   href={profile.githubRepo} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-105 active:scale-95 transition shadow-xl"
                 >
                   <Github size={20} />
                   View Project Repo
                 </a>
               )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
           <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={16} /> Progress
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">{Math.round(completionPercentage)}%</span>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">To Completion</span>
                 </div>
                 <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full transition-all duration-1000"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Share2 size={16} /> Certified
              </h3>
              <div className="flex flex-col h-full justify-between">
                 <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                   {completionPercentage === 100 
                     ? 'This student has successfully mastered 50 days of Java development and algorithmic challenges.' 
                     : `Currently building professional Java expertise. On track to graduate in ${50 - profile.completedDays?.length} days.`}
                 </p>
                 <div className="mt-4 flex items-center gap-1.5 text-emerald-500 font-bold text-xs uppercase">
                    <CircleCheckBig size={14} /> Verified Proof of Work
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <Linkedin className="text-[#0077b5]" size={40} />
              <button 
                onClick={() => {
                  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`;
                  window.open(url, '_blank');
                }}
                className="w-full py-3 bg-[#0077b5] hover:bg-[#006396] text-white font-bold rounded-2xl transition"
              >
                Endorse on LinkedIn
              </button>
           </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs font-medium uppercase tracking-[0.2em] pt-8">
          Powered by CodeSprint 50 • The Ultimate Coding Challenge
        </p>
      </div>
    </div>
  );
}
