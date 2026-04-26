import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProgressHeader from '../components/dashboard/ProgressHeader';
import Leaderboard from '../components/dashboard/Leaderboard';
import WarmupModal from '../components/dashboard/WarmupModal';
import OnboardingModal from '../components/dashboard/OnboardingModal';
import PlacementReadinessCard from '../components/dashboard/PlacementReadinessCard';
import ProgramDayCard from '../components/dashboard/ProgramDayCard';
import InsightsPanel from '../components/dashboard/InsightsPanel';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import HallOfFame from '../components/dashboard/HallOfFame';
import { Sparkles, Linkedin, Rocket, Share2, Brain, Database, ArrowRight, GraduationCap, MessageSquareText, Code2, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isWarmupOpen, setIsWarmupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFullOverview, setShowFullOverview] = useState(false);

  // Beginner = hasn't finished a single day yet. Hide analytics that would all be empty.
  const isBeginner = (user?.completedDays?.length || 0) === 0;

  
  const copyProfileLink = () => {
    const profileUrl = `${window.location.origin}/u/${user?.username}`;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-trigger onboarding if necessary
  const needsOnboarding = user && (!user.registrationDetails || !user.registrationDetails.isComplete);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const unifiedGradient = "from-primary-500 to-indigo-600";
  const unifiedIconBg = "bg-slate-50 dark:bg-slate-800/50 text-primary-600 dark:text-primary-400 border-slate-200 dark:border-slate-700/50";

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Onboarding Blocker */}
      {needsOnboarding && <OnboardingModal />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 bg-slate-900 dark:bg-slate-800 rounded-lg text-white shadow-sm shrink-0">
            <Sparkles size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm truncate">
              Welcome back, {user?.name?.split(' ')[0] || 'Explorer'}! Ready to code?
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setIsWarmupOpen(true)}
            className="flex-1 sm:flex-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-3 sm:px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <Brain size={16} className="text-primary-500" />
            Warmup
          </button>
          <button
            onClick={copyProfileLink}
            className="flex-1 sm:flex-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-3 sm:px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <Share2 size={16} className="text-slate-400" />
            {copied ? 'Copied!' : 'Profile'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-200 dark:border-slate-800 mb-6 sm:mb-8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={clsx(
            "pb-3 text-sm font-bold whitespace-nowrap transition border-b-2",
            activeTab === 'overview' 
              ? "border-primary-500 text-primary-600 dark:text-primary-400" 
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('tracks')}
          className={clsx(
            "pb-3 text-sm font-bold whitespace-nowrap transition border-b-2",
            activeTab === 'tracks' 
              ? "border-primary-500 text-primary-600 dark:text-primary-400" 
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          My Tracks
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={clsx(
            "pb-3 text-sm font-bold whitespace-nowrap transition border-b-2",
            activeTab === 'leaderboard' 
              ? "border-primary-500 text-primary-600 dark:text-primary-400" 
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Leaderboard
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
          {isBeginner && !showFullOverview ? (
            <>
              <div className="rounded-2xl border border-primary-200 dark:border-primary-800/50 bg-primary-50/50 dark:bg-primary-900/10 px-4 sm:px-5 py-3 sm:py-4">
                <p className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-0.5">
                  Welcome to CodeSprint 50 — start with Day 1 below.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Finish today's required tasks to unlock your full dashboard (streak, progress, insights, leaderboard).
                </p>
              </div>
              <ProgramDayCard />
              <div className="text-center">
                <button
                  onClick={() => setShowFullOverview(true)}
                  className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                >
                  Show full dashboard →
                </button>
              </div>
            </>
          ) : (
            <>
              <ProgressHeader user={user} />
              <ProgramDayCard />
              <HallOfFame />
              <ActivityHeatmap />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <PlacementReadinessCard />
                <InsightsPanel />
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'tracks' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 min-w-0">
              <Rocket className="text-primary-500 shrink-0" size={20} />
              <span className="truncate">Placement Tracks</span>
            </h2>
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">Tier-3 placement ready</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TrackCard
              to="/java"
              title="Java 50"
              desc="50-day curriculum · syntax, OOP, collections, streams, threading."
              icon={Coffee}
              gradient={unifiedGradient}
              iconBg={unifiedIconBg}
              progress={Math.round(((user?.completedDays?.length || 0) / 50) * 100)}
              progressLabel={`Day ${user?.currentDay || 1} · ${user?.completedDays?.length || 0} / 50 done`}
              active
            />
            <TrackCard
              to="/dsa"
              title="DSA Problems"
              desc="30 curated problems · arrays, strings, LL, stack, hashing, trees."
              icon={Code2}
              gradient={unifiedGradient}
              iconBg={unifiedIconBg}
              progress={Math.round(((user?.dsaProgress?.solvedProblems?.length || 0) / 30) * 100)}
              progressLabel={`${user?.dsaProgress?.solvedProblems?.length || 0} / 30 solved`}
              active
            />
            <TrackCard
              to="/sql"
              title="SQL & DBMS"
              desc="20 lessons · joins · subqueries · window functions · ACID."
              icon={Database}
              gradient={unifiedGradient}
              iconBg={unifiedIconBg}
              progress={Math.round(((user?.sqlProgress?.completedLessons?.length || 0) / 20) * 100)}
              progressLabel={`${user?.sqlProgress?.completedLessons?.length || 0} / 20 lessons`}
              active
            />
            <TrackCard
              to="/aptitude"
              title="Aptitude & Reasoning"
              desc="Quant · logical · verbal. Sectional timers matching TCS NQT."
              icon={Brain}
              gradient={unifiedGradient}
              iconBg={unifiedIconBg}
              progress={user?.aptitudeProgress?.totalAttempted
                ? Math.round(((user.aptitudeProgress.totalCorrect || 0) / user.aptitudeProgress.totalAttempted) * 100)
                : 0}
              progressLabel={user?.aptitudeProgress?.sessionsCompleted
                ? `${user.aptitudeProgress.sessionsCompleted} sessions · ${user.aptitudeProgress.totalCorrect || 0}/${user.aptitudeProgress.totalAttempted || 0} correct`
                : 'No sessions yet'}
              active
              progressIsAccuracy
            />
            <TrackCard
              to="/theory"
              title="CS Core (OS · CN · OOP)"
              desc="Theory MCQs matching Infy SP / Accenture / TCS patterns."
              icon={GraduationCap}
              gradient={unifiedGradient}
              iconBg={unifiedIconBg}
              progress={user?.theoryProgress?.totalAttempted
                ? Math.round(((user.theoryProgress.totalCorrect || 0) / user.theoryProgress.totalAttempted) * 100)
                : 0}
              progressLabel={user?.theoryProgress?.sessionsCompleted
                ? `${user.theoryProgress.sessionsCompleted} sessions · ${user.theoryProgress.totalCorrect || 0}/${user.theoryProgress.totalAttempted || 0} correct`
                : 'No sessions yet'}
              active
              progressIsAccuracy
            />
            <TrackCard
              to="/hr"
              title="HR Interview Prep"
              desc="15 common questions · AI feedback on structure, specificity, impact."
              icon={MessageSquareText}
              gradient={unifiedGradient}
              iconBg={unifiedIconBg}
              progress={user?.hrPractice ? Math.round((new Set(user.hrPractice.map((h) => h.questionId)).size / 15) * 100) : 0}
              progressLabel={user?.hrPractice?.length
                ? `${new Set(user.hrPractice.map((h) => h.questionId)).size} / 15 practiced`
                : 'Pick a question to start'}
              active
            />
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="animate-in fade-in duration-300">
          <Leaderboard />
        </div>
      )}

      <WarmupModal isOpen={isWarmupOpen} onClose={() => setIsWarmupOpen(false)} />
    </div>
  );
}

/* eslint-disable no-unused-vars */
const TrackCard = ({ to, title, desc, icon: Icon, gradient, iconBg, progress = 0, progressLabel, progressIsAccuracy, active, comingSoon }) => {
  const Wrapper = active && to ? Link : 'div';
  const wrapperProps = active && to ? { to } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={clsx(
        'group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 transition border',
        active
          ? 'border-slate-200 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 shadow-sm hover:shadow-md'
          : 'border-dashed border-slate-200 dark:border-slate-800 opacity-75'
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={clsx('p-2.5 rounded-xl border', iconBg)}>
            <Icon size={20} />
          </div>
          {active ? (
            <ArrowRight className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition" size={18} />
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Coming soon</span>
          )}
        </div>
        <h3 className={clsx('font-bold mb-1.5', active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400')}>
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5 line-clamp-2">{desc}</p>

        {active && !comingSoon && (
          <>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className={clsx('h-full bg-gradient-to-r transition-all', gradient)}
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {progressIsAccuracy && progress > 0 ? `${progress}% accuracy · ` : ''}{progressLabel}
            </p>
          </>
        )}
      </div>
    </Wrapper>
  );
};
