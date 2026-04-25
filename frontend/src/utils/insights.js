// Shared insight engine — used by both the admin PDF (coach tone) and the student
// dashboard panel (first-person tone). Pass mode: 'admin' | 'student'.

const DSA_TOPICS = ['arrays', 'strings', 'linked-list', 'stack-queue', 'hashing', 'recursion-trees'];

const pct = (correct, attempted) => attempted > 0 ? Math.round((correct / attempted) * 100) : null;

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

const COPY = {
  admin: {
    streakBroken: 'Streak is broken. Encourage daily check-ins — even 15 minutes/day rebuilds momentum.',
    curriculumLag: 'Joined over 2 weeks ago but still on early days. Schedule a 1:1 to identify blockers.',
    aptitudeWeakSection: (k, acc, n) => `Only ${acc}% accuracy across ${n} questions. Recommend focused practice on this section.`,
    aptitudeVolume: 'Fewer than 20 aptitude questions attempted. Aim for at least 10 questions per day.',
    theoryWeakSection: (k, n) => `Below 50% on ${n} attempted questions. Revisit the concept lessons before more practice.`,
    theoryVolume: 'Limited theory practice. OS, Networks, OOP are common interview topics — recommend daily practice.',
    dsaCoverageHigh: (n, list) => `${n} topics untouched: ${list}. Recommend at least 2 problems per topic.`,
    dsaCoverageMedium: (list) => `Topics not yet attempted: ${list}.`,
    hrLow: 'Fewer than 5 HR questions practiced. Schedule mock HR sessions before placement drives.',
    sqlNeglected: 'SQL track has barely been touched despite curriculum progress. Most companies test SQL in placement rounds.',
    githubMissing: 'No GitHub repo linked. Encourage student to create the 50-day repo to showcase progress.'
  },
  student: {
    streakBroken: 'Your streak just broke. Even 15 minutes today gets it going again.',
    curriculumLag: "You're still in the early days — try blocking 30 minutes daily to catch up.",
    aptitudeWeakSection: (k, acc, n) => `Only ${acc}% accuracy on ${n} ${k} questions. Spend a session focused on this area.`,
    aptitudeVolume: "You've barely touched aptitude — aim for 10 questions a day.",
    theoryWeakSection: (k, n) => `Under 50% on ${n} ${k} questions. Re-read the concept before practicing more.`,
    theoryVolume: 'OS · Networks · OOP show up in almost every placement test. Start a daily theory session.',
    dsaCoverageHigh: (n, list) => `${n} DSA topics not started: ${list}. Solve 2 problems in each to build confidence.`,
    dsaCoverageMedium: (list) => `DSA topics still to try: ${list}.`,
    hrLow: 'Practice at least 5 HR questions before your first interview — it makes a huge difference.',
    sqlNeglected: 'SQL is tested in most placement rounds. Open the SQL track and try a lesson today.',
    githubMissing: 'Link your GitHub repo so recruiters can see your 50-day progress.'
  }
};

/**
 * @param {Object} user
 * @param {Object} [opts]
 * @param {'admin'|'student'} [opts.mode='admin']
 * @param {number} [opts.limit] — return only the top-N by priority
 * @returns {Array<{priority: 'HIGH'|'MEDIUM'|'LOW', area: string, recommendation: string}>}
 */
export function buildInsights(user, opts = {}) {
  const { mode = 'admin', limit } = opts;
  const copy = COPY[mode] || COPY.admin;
  const insights = [];

  if ((user.streak || 0) === 0 && (user.completedDays?.length || 0) > 0) {
    insights.push({ priority: 'MEDIUM', area: 'Daily Consistency', recommendation: copy.streakBroken });
  }

  if ((user.currentDay || 1) <= 5 && new Date(user.createdAt) < new Date(Date.now() - 14 * 86400000)) {
    insights.push({ priority: 'HIGH', area: 'Curriculum Pace', recommendation: copy.curriculumLag });
  }

  if (user.aptitudeProgress?.totalAttempted > 20) {
    Object.entries(user.aptitudeProgress.sectionStats || {}).forEach(([k, s]) => {
      const acc = pct(s.correct, s.attempted);
      if (acc !== null && acc < 50 && s.attempted >= 5) {
        insights.push({
          priority: 'HIGH',
          area: `Aptitude — ${k}`,
          recommendation: copy.aptitudeWeakSection(k, acc, s.attempted)
        });
      }
    });
  } else {
    insights.push({ priority: 'MEDIUM', area: 'Aptitude Volume', recommendation: copy.aptitudeVolume });
  }

  if (user.theoryProgress?.totalAttempted > 20) {
    Object.entries(user.theoryProgress.sectionStats || {}).forEach(([k, s]) => {
      const acc = pct(s.correct, s.attempted);
      if (acc !== null && acc < 50 && s.attempted >= 5) {
        insights.push({
          priority: 'HIGH',
          area: `Theory — ${k.toUpperCase()}`,
          recommendation: copy.theoryWeakSection(k.toUpperCase(), s.attempted)
        });
      }
    });
  } else {
    insights.push({ priority: 'MEDIUM', area: 'CS Fundamentals Volume', recommendation: copy.theoryVolume });
  }

  const dsa = user.dsaProgress || {};
  const untouched = DSA_TOPICS.filter(t => (dsa.topicStats?.[t]?.solved || 0) === 0);
  if (untouched.length >= 3) {
    insights.push({
      priority: 'HIGH',
      area: 'DSA Coverage',
      recommendation: copy.dsaCoverageHigh(untouched.length, untouched.join(', '))
    });
  } else if (untouched.length > 0) {
    insights.push({
      priority: 'MEDIUM',
      area: 'DSA Coverage',
      recommendation: copy.dsaCoverageMedium(untouched.join(', '))
    });
  }

  if ((user.hrPractice?.length || 0) < 5) {
    insights.push({ priority: 'MEDIUM', area: 'HR Interview Prep', recommendation: copy.hrLow });
  }

  if ((user.sqlProgress?.completedLessons?.length || 0) < 3 && (user.currentDay || 1) > 10) {
    insights.push({ priority: 'MEDIUM', area: 'SQL Track', recommendation: copy.sqlNeglected });
  }

  if (!user.githubRepo) {
    insights.push({ priority: 'LOW', area: 'GitHub Portfolio', recommendation: copy.githubMissing });
  }

  insights.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  return limit ? insights.slice(0, limit) : insights;
}
