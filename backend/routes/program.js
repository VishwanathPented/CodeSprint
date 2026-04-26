import express from 'express';
import DayContent from '../models/DayContent.js';
import DsaProblem from '../models/DsaProblem.js';
import SqlLesson from '../models/SqlLesson.js';
import HrQuestion from '../models/HrQuestion.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// === Date helpers (server-local time) ===
const dateStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const isToday = (d) => Boolean(d && dateStr(new Date(d)) === dateStr());

const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateStr(d);
};

const nextMidnight = () => {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d;
};

// Midnight rollover: if user already completed currentDay AND it was completed before today,
// advance to the next day (capped at 50). Mutates the user document; caller must save.
const applyRollover = (user) => {
  const today = dateStr();
  if (
    user.completedDays?.includes(user.currentDay) &&
    user.lastDayCompletedDate &&
    user.lastDayCompletedDate < today &&
    user.currentDay < 50
  ) {
    user.currentDay += 1;
    return true;
  }
  return false;
};

// GET /api/program/today — full mission for the user's current day with sub-task statuses
router.get('/today', protect, async (req, res) => {
  try {
    const userDoc = await User.findById(req.user._id);
    const rolled = applyRollover(userDoc);
    if (rolled) await userDoc.save();

    const day = userDoc.currentDay;
    const completedAlready = userDoc.completedDays?.includes(day);

    // Java content for this day
    const javaDay = await DayContent.findOne({ dayNumber: day });

    // DSA: pick from javaDay.dsaSlugs if available, else fall back to next unsolved problem
    const solvedSlugs = new Set(userDoc.dsaProgress?.solvedProblems || []);
    let dsaProblems = [];
    if (javaDay?.dsaSlugs?.length) {
      dsaProblems = await DsaProblem
        .find({ slug: { $in: javaDay.dsaSlugs } })
        .select('slug title topic difficulty')
        .sort({ order: 1 });
    } else {
      const next = await DsaProblem
        .findOne({ slug: { $nin: Array.from(solvedSlugs) }, difficulty: { $in: ['Easy', 'Medium'] } })
        .select('slug title topic difficulty')
        .sort({ order: 1 });
      if (next) dsaProblems = [next];
    }

    const dsaWithStatus = dsaProblems.map((p) => ({
      slug: p.slug,
      title: p.title,
      topic: p.topic,
      difficulty: p.difficulty,
      solved: solvedSlugs.has(p.slug)
    }));

    // SQL: optional, only if user hasn't done it today AND a lesson exists at currentSqlLesson
    const sqlLessonNum = userDoc.sqlProgress?.currentLesson || 1;
    const sqlLesson = await SqlLesson.findOne({ lessonNumber: sqlLessonNum }).select('lessonNumber title');

    // HR: pick the next unpracticed question (or the lowest-order one)
    const practicedHr = new Set((userDoc.hrPractice || []).map((h) => String(h.questionId)));
    const allHr = await HrQuestion.find({}).sort({ order: 1 }).select('order question');
    const nextHr = allHr.find((q) => !practicedHr.has(String(q._id))) || allHr[0];

    // === Sub-task completion checks ===
    const javaDone = Boolean(userDoc.completedDays?.includes(day)) || isToday(userDoc.lastActivity?.java);
    // For DSA: any problem in the day's set must be solved (we count "any new solve today" too)
    const dsaDayDone = dsaProblems.length > 0
      ? dsaProblems.every((p) => solvedSlugs.has(p.slug))
      : isToday(userDoc.lastActivity?.dsa);
    const dsaAnyDoneToday = isToday(userDoc.lastActivity?.dsa);
    const aptitudeDone = isToday(userDoc.lastActivity?.aptitudeQualifying);
    const sqlDone = isToday(userDoc.lastActivity?.sql);
    const theoryDone = isToday(userDoc.lastActivity?.theoryQualifying);
    const hrDone = isToday(userDoc.lastActivity?.hr);

    // Required tasks: Java + at least 1 DSA solve today (or all the day's tagged DSA) + qualifying aptitude
    const requiredAllDone = Boolean(javaDone && (dsaDayDone || dsaAnyDoneToday) && aptitudeDone);
    const optionalDoneCount = (sqlDone ? 1 : 0) + (theoryDone ? 1 : 0) + (hrDone ? 1 : 0);

    // Locked = current day is the day after a just-completed day, awaiting midnight
    const locked = userDoc.completedDays?.includes(day) && userDoc.lastDayCompletedDate === dateStr();

    res.json({
      day,
      total: 50,
      unlocked: !locked,
      locked,
      alreadyCompleted: completedAlready,
      nextUnlocksAt: locked ? nextMidnight() : null,

      // The day's content
      java: javaDay ? {
        dayNumber: javaDay.dayNumber,
        topicTitle: javaDay.topicTitle,
        description: javaDay.description,
        link: `/day/${javaDay.dayNumber}`
      } : null,
      dsa: {
        problems: dsaWithStatus,
        required: 1,
        doneCount: dsaWithStatus.filter((p) => p.solved).length
      },
      aptitude: {
        link: '/aptitude/practice?section=mixed&count=10',
        requiredQuestions: 10
      },
      sql: sqlLesson ? {
        lessonNumber: sqlLesson.lessonNumber,
        title: sqlLesson.title,
        link: `/sql/lesson/${sqlLesson.lessonNumber}`
      } : null,
      theory: { link: '/theory/practice?section=mixed&count=10', requiredQuestions: 10 },
      hr: nextHr ? {
        questionId: nextHr._id,
        question: nextHr.question,
        link: '/hr'
      } : null,

      // Live status — Boolean() everything so JSON serialization doesn't drop false-ish keys
      // dsaDone reflects the gate logic: either all the day's DSA problems are solved OR
      // the user solved any DSA problem today (matches what /complete-day actually checks).
      status: {
        javaDone: Boolean(javaDone),
        dsaDone: Boolean(dsaDayDone || dsaAnyDoneToday),
        dsaAnyDoneToday: Boolean(dsaAnyDoneToday),
        aptitudeDone: Boolean(aptitudeDone),
        sqlDone: Boolean(sqlDone),
        theoryDone: Boolean(theoryDone),
        hrDone: Boolean(hrDone)
      },
      requiredAllDone,
      optionalDoneCount,

      // Player-facing streak/progress
      streak: userDoc.streak || 0,
      longestStreak: userDoc.longestStreak || 0,
      completedDaysCount: userDoc.completedDays?.length || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/program/complete-day — validate and mark current day complete
router.post('/complete-day', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    applyRollover(user);

    const day = user.currentDay;
    if (user.completedDays?.includes(day)) {
      return res.status(400).json({ message: `Day ${day} already completed today. Day ${day + 1} unlocks at midnight.` });
    }

    // Re-fetch the day's required content to verify completion
    const javaDay = await DayContent.findOne({ dayNumber: day });
    const solvedSlugs = new Set(user.dsaProgress?.solvedProblems || []);
    let dsaProblems = [];
    if (javaDay?.dsaSlugs?.length) {
      dsaProblems = await DsaProblem.find({ slug: { $in: javaDay.dsaSlugs } }).select('slug');
    }

    const javaDone = Boolean(user.completedDays?.includes(day)) || isToday(user.lastActivity?.java);
    const dsaDayDone = dsaProblems.length > 0
      ? dsaProblems.every((p) => solvedSlugs.has(p.slug))
      : isToday(user.lastActivity?.dsa);
    const dsaAnyToday = isToday(user.lastActivity?.dsa);
    const aptitudeDone = isToday(user.lastActivity?.aptitudeQualifying);

    const requiredAllDone = Boolean(javaDone && (dsaDayDone || dsaAnyToday) && aptitudeDone);
    if (!requiredAllDone) {
      return res.status(400).json({
        message: 'Required tasks incomplete.',
        missing: {
          java: !javaDone,
          dsa: !(dsaDayDone || dsaAnyToday),
          aptitude: !aptitudeDone
        }
      });
    }

    // Streak update — LeetCode-style
    const today = dateStr();
    const yest = yesterdayStr();
    if (user.lastDayCompletedDate === yest) {
      user.streak = (user.streak || 0) + 1;
    } else if (user.lastDayCompletedDate === today) {
      // Already completed today — shouldn't be reachable, but guard.
    } else {
      user.streak = 1;
    }
    if ((user.streak || 0) > (user.longestStreak || 0)) {
      user.longestStreak = user.streak;
    }

    user.completedDays = user.completedDays || [];
    if (!user.completedDays.includes(day)) user.completedDays.push(day);
    user.lastDayCompletedDate = today;
    user.lastActiveDate = new Date();

    // Don't bump currentDay yet — happens on next /today after midnight via applyRollover.

    await user.save();

    res.json({
      message: `Day ${day} completed. Day ${Math.min(day + 1, 50)} unlocks at midnight.`,
      day,
      streak: user.streak,
      longestStreak: user.longestStreak,
      completedDaysCount: user.completedDays.length,
      nextUnlocksAt: nextMidnight()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/program/leaderboard — top users by streak (primary) + days completed (tiebreaker)
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const top = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      {
        $project: {
          name: 1,
          username: 1,
          streak: { $ifNull: ['$streak', 0] },
          longestStreak: { $ifNull: ['$longestStreak', 0] },
          completedCount: { $size: { $ifNull: ['$completedDays', []] } }
        }
      },
      { $sort: { streak: -1, completedCount: -1, longestStreak: -1 } },
      { $limit: 25 }
    ]);

    // Also locate the requesting user's rank if not in top 25
    const meDoc = await User.findById(req.user._id).select('name username streak longestStreak completedDays');
    const meStreak = meDoc.streak || 0;
    const meCompleted = meDoc.completedDays?.length || 0;
    const aboveCount = await User.countDocuments({
      role: { $ne: 'admin' },
      $or: [
        { streak: { $gt: meStreak } },
        { streak: meStreak, $expr: { $gt: [{ $size: { $ifNull: ['$completedDays', []] } }, meCompleted] } }
      ]
    });

    res.json({
      top,
      me: {
        rank: aboveCount + 1,
        name: meDoc.name,
        username: meDoc.username,
        streak: meStreak,
        longestStreak: meDoc.longestStreak || 0,
        completedCount: meCompleted
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/program/hall-of-fame — yesterday's top performers across the program.
// "Performed well" = completed their Java day yesterday, ranked by composite
// score: mcqScore (×10) + bonuses for cross-track activity (aptitude / sql / dsa).
router.get('/hall-of-fame', protect, async (req, res) => {
  try {
    const yest = yesterdayStr();
    const startOfYest = new Date(`${yest}T00:00:00`);
    const startOfToday = new Date(`${dateStr()}T00:00:00`);

    const candidates = await User.find({
      role: { $ne: 'admin' },
      lastDayCompletedDate: yest
    }).select('name username streak longestStreak completedDays scores lastActivity');

    const wasYesterday = (d) => {
      if (!d) return false;
      const t = new Date(d).getTime();
      return t >= startOfYest.getTime() && t < startOfToday.getTime();
    };

    const champions = candidates.map((u) => {
      // The day they finished yesterday is the most recently added scores entry
      // whose dayNumber matches one in completedDays. Use the last score safely.
      const recentScore = (u.scores || []).slice(-1)[0] || {};
      const mcqScore = typeof recentScore.mcqScore === 'number' ? recentScore.mcqScore : 0;
      const didAptitude = wasYesterday(u.lastActivity?.aptitude);
      const didSql = wasYesterday(u.lastActivity?.sql);
      const didDsa = wasYesterday(u.lastActivity?.dsa);

      const score =
        mcqScore * 10 +
        (didAptitude ? 25 : 0) +
        (didSql ? 25 : 0) +
        (didDsa ? 25 : 0);

      return {
        _id: u._id,
        name: u.name,
        username: u.username,
        dayCompleted: recentScore.dayNumber || (u.completedDays?.slice(-1)[0] ?? null),
        mcqScore,
        didAptitude,
        didSql,
        didDsa,
        streak: u.streak || 0,
        score
      };
    });

    champions.sort((a, b) => b.score - a.score || b.streak - a.streak || b.mcqScore - a.mcqScore);
    const top = champions.slice(0, 10);

    res.json({
      date: yest,
      total: champions.length,
      champions: top
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
