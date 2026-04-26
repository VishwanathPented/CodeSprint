import express from 'express';
import User from '../models/User.js';
import DayContent from '../models/DayContent.js';
import { protect } from '../middleware/auth.js';
import { recordActivity } from '../utils/activityLog.js';

const router = express.Router();

router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

// @route   POST /api/user/complete-onboarding
// @desc    Save collegiate details after initial registration
router.post('/complete-onboarding', protect, async (req, res) => {
  try {
    const { year, branch, phoneNumber, usn } = req.body;
    
    req.user.registrationDetails = {
      year,
      branch,
      phoneNumber,
      usn,
      isComplete: true
    };
    
    await req.user.save();
    res.json({ message: 'Onboarding complete', user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/user/leaderboard
// @desc    Get top users by streak and score
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({})
      .select('name streak completedDays')
      .sort({ streak: -1, 'completedDays.length': -1 })
      .limit(10);
    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Build the cross-track gate status for a given day. Returns flags for which
// gates are pending so both the gating logic and the status endpoint can share
// it. Day 1 starts with a 0 baseline (Mongoose default), so completing 1 of
// each track for day 1 is enough.
function evaluateDailyTaskGates(user, dayContent) {
  const baseline = user.dailyTaskBaseline || {};
  const sqlBase = baseline.sqlLessonsAtUnlock || 0;
  const aptBase = baseline.aptitudeSessionsAtUnlock || 0;
  const dsaBase = baseline.dsaSolvedAtUnlock || 0;

  const sqlNow = (user.sqlProgress?.completedLessons?.length) || 0;
  const aptNow = (user.aptitudeProgress?.sessionsCompleted) || 0;
  const dsaNow = (user.dsaProgress?.solvedProblems?.length) || 0;
  const solvedSet = new Set(user.dsaProgress?.solvedProblems || []);

  const todaysSlugs = (dayContent?.dsaSlugs) || [];
  const todaysSolved = todaysSlugs.filter(s => solvedSet.has(s));

  // DSA gate: if today has assigned problems, at least one of them must be
  // solved. If no problems are assigned (early days), gate auto-passes.
  const dsaRequired = todaysSlugs.length > 0;
  const dsaDone = !dsaRequired || todaysSolved.length > 0;

  // SQL gate: at least one new SQL lesson completed since the day was unlocked.
  const sqlDelta = sqlNow - sqlBase;
  const sqlDone = sqlDelta >= 1;

  // Aptitude gate: at least one new session completed since the day was unlocked.
  const aptDelta = aptNow - aptBase;
  const aptitudeDone = aptDelta >= 1;

  return {
    dsa: { required: dsaRequired, done: dsaDone, todaysSlugs, todaysSolved, totalSolved: dsaNow },
    sql: { required: true, done: sqlDone, completedSinceUnlock: Math.max(sqlDelta, 0), totalCompleted: sqlNow },
    aptitude: { required: true, done: aptitudeDone, completedSinceUnlock: Math.max(aptDelta, 0), totalCompleted: aptNow },
    allDone: dsaDone && sqlDone && aptitudeDone
  };
}

// @route   GET /api/user/day-tasks-status/:dayNumber
// @desc    Report DSA / SQL / Aptitude gate status for a specific day so the
//          frontend can render the Required Tasks panel with live checkmarks.
router.get('/day-tasks-status/:dayNumber', protect, async (req, res) => {
  try {
    const dayNumber = Number(req.params.dayNumber);
    if (!dayNumber || Number.isNaN(dayNumber)) {
      return res.status(400).json({ message: 'Invalid day number' });
    }
    const dayContent = await DayContent.findOne({ dayNumber }).select('dsaSlugs');
    if (!dayContent) return res.status(404).json({ message: 'Day not found' });
    res.json(evaluateDailyTaskGates(req.user, dayContent));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/user/complete-day
// @desc    Mark current day as complete and unlock next day
router.post('/complete-day', protect, async (req, res) => {
  try {
    const user = req.user;
    const { dayNumber, mcqScore, codingAttempted, githubLink, refactorLink } = req.body;

    // Only allow completing the current unlocked day
    if (dayNumber !== user.currentDay) {
      return res.status(400).json({ message: 'Can only complete current active day' });
    }

    // Check if subscription needed (mock feature, say free up to day 5)
    if (dayNumber >= 5 && !user.isSubscribed) {
      return res.status(403).json({ message: 'Subscription required to proceed beyond Day 5' });
    }

    // Cross-track gating: enforce DSA + SQL + Aptitude before unlocking the next day.
    const dayContent = await DayContent.findOne({ dayNumber }).select('dsaSlugs');
    const gates = evaluateDailyTaskGates(user, dayContent);
    if (!gates.allDone) {
      const missing = [];
      if (!gates.dsa.done) missing.push('Solve at least one of today\'s assigned DSA problems');
      if (!gates.sql.done) missing.push('Complete one SQL lesson');
      if (!gates.aptitude.done) missing.push('Complete one Aptitude session');
      return res.status(400).json({
        message: `Finish today's required tasks first: ${missing.join('; ')}.`,
        gates
      });
    }

    // Save score
    user.scores.push({
      dayNumber,
      mcqScore,
      codingAttempted,
      githubLink,
      refactorLink
    });

    if (!user.completedDays.includes(dayNumber)) {
      user.completedDays.push(dayNumber);
      user.currentDay += 1; // Unlock next day

      // Basic streak logic
      const today = new Date().setHours(0,0,0,0);
      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).setHours(0,0,0,0) : null;

      if (!lastActive) {
        user.streak = 1;
      } else {
        const diffTime = Math.abs(today - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          user.streak += 1;
        } else if (diffDays > 1) {
          user.streak = 1; // Reset streak
        }
      }
      user.lastActiveDate = new Date();

      // Reset baseline so the *next* day requires another round of cross-track work.
      if (!user.dailyTaskBaseline) user.dailyTaskBaseline = {};
      user.dailyTaskBaseline.sqlLessonsAtUnlock = (user.sqlProgress?.completedLessons?.length) || 0;
      user.dailyTaskBaseline.aptitudeSessionsAtUnlock = (user.aptitudeProgress?.sessionsCompleted) || 0;
      user.dailyTaskBaseline.dsaSolvedAtUnlock = (user.dsaProgress?.solvedProblems?.length) || 0;
    }

    if (!user.lastActivity) user.lastActivity = {};
    user.lastActivity.java = new Date();
    recordActivity(user, 'java');

    await user.save();
    res.json({ message: `Day ${dayNumber} completed! Day ${user.currentDay} unlocked.`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/user/subscribe
// @desc    Mock subscription payment
router.post('/subscribe', protect, async (req, res) => {
  try {
    req.user.isSubscribed = true;
    await req.user.save();
    res.json({ message: 'Subscription successful. Full course unlocked.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/user/update-repo
// @desc    Update user's main GitHub repository URL
router.put('/update-repo', protect, async (req, res) => {
  try {
    const { githubRepo } = req.body;
    req.user.githubRepo = githubRepo;
    await req.user.save();
    res.json({ message: 'GitHub Repository updated successfully', user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/user/warmup
// @desc    Get 3 random MCQs from completed days
router.get('/warmup', protect, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.completedDays || user.completedDays.length === 0) {
      return res.json({ mcqs: [] });
    }

    const days = await DayContent.find({ dayNumber: { $in: user.completedDays } });
    
    let allMcqs = [];
    days.forEach(day => {
      if (day.mcqs && day.mcqs.length > 0) {
        day.mcqs.forEach(mcq => {
          allMcqs.push({
            ...mcq.toObject(),
            sourceDay: day.dayNumber
          });
        });
      }
    });

    const shuffled = allMcqs.sort(() => 0.5 - Math.random());
    const selectedMcqs = shuffled.slice(0, 3);

    res.json({ mcqs: selectedMcqs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/user/make-me-admin
// @desc    Self-promote for testing Phase 15
router.post('/make-me-admin', protect, async (req, res) => {
  try {
    req.user.role = 'admin';
    await req.user.save();
    res.json({ message: 'You are now an admin!', user: req.user });
  } catch(e) {
    res.status(500).json({message: e.message});
  }
});

export default router;
