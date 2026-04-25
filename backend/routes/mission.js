import express from 'express';
import WrongAnswer from '../models/WrongAnswer.js';
import DsaProblem from '../models/DsaProblem.js';
import SqlLesson from '../models/SqlLesson.js';
import HrQuestion from '../models/HrQuestion.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const isToday = (d) => {
  if (!d) return false;
  const dt = new Date(d);
  const now = new Date();
  return dt.getFullYear() === now.getFullYear()
    && dt.getMonth() === now.getMonth()
    && dt.getDate() === now.getDate();
};

// Pick weakest section/topic for a track from sectionStats
const weakestSection = (sectionStats, sectionKeys, fallback) => {
  let weakest = null;
  for (const key of sectionKeys) {
    const s = sectionStats?.[key];
    if (!s || s.attempted < 3) continue;
    const acc = s.correct / s.attempted;
    if (weakest === null || acc < weakest.acc) weakest = { key, acc };
  }
  return weakest?.key || fallback;
};

// GET /api/mission/today
router.get('/today', protect, async (req, res) => {
  try {
    const user = req.user;
    const today = new Date();

    // Resolve "did X today" markers
    const lastAct = user.lastActivity || {};
    const didAptitudeToday = isToday(lastAct.aptitude);
    const didTheoryToday = isToday(lastAct.theory);
    const didDsaToday = isToday(lastAct.dsa);
    const didSqlToday = isToday(lastAct.sql);
    const didJavaToday = isToday(lastAct.java);
    const didReviewToday = isToday(lastAct.review);
    const lastHrAt = (user.hrPractice || []).reduce((max, h) => h?.practicedAt && (!max || new Date(h.practicedAt) > max) ? new Date(h.practicedAt) : max, null);
    const didHrToday = isToday(lastHrAt);

    // Counts for due review cards
    const dueReviewCount = await WrongAnswer.countDocuments({
      user: user._id,
      mastered: false,
      dueAt: { $lte: today }
    });

    // Pick the user's weakest aptitude section to recommend a focused drill
    const aptWeakSection = weakestSection(
      user.aptitudeProgress?.sectionStats,
      ['quantitative', 'logical', 'verbal'],
      'mixed'
    );

    // Pick weakest theory section
    const theoryWeakSection = weakestSection(
      user.theoryProgress?.sectionStats,
      ['os', 'networks', 'oop'],
      'mixed'
    );

    // Pick the next unsolved DSA problem (lowest order, prefer Easy/Medium)
    const solvedSet = new Set(user.dsaProgress?.solvedProblems || []);
    const nextDsa = await DsaProblem.findOne({
      slug: { $nin: Array.from(solvedSet) },
      difficulty: { $in: ['Easy', 'Medium'] }
    }).sort({ order: 1 }).select('slug title topic difficulty');

    // Next SQL lesson
    const nextSqlLessonNum = user.sqlProgress?.currentLesson || 1;
    const nextSql = await SqlLesson.findOne({ lessonNumber: nextSqlLessonNum }).select('lessonNumber title');

    // Pick an HR question the user hasn't practiced yet (or rotate)
    const practicedHrIds = new Set((user.hrPractice || []).map((h) => String(h.questionId)));
    const allHr = await HrQuestion.find({}).sort({ order: 1 }).select('order question');
    const nextHr = allHr.find((q) => !practicedHrIds.has(String(q._id))) || allHr[0];

    // Build the mission. Always 4–6 items, sized to ≈ 60 min total.
    const items = [];

    // 1. Spaced repetition (priority — only show if due)
    if (dueReviewCount > 0) {
      items.push({
        id: 'review',
        type: 'review',
        label: `Review ${dueReviewCount} card${dueReviewCount > 1 ? 's' : ''} from past mistakes`,
        time: '~10 min',
        link: '/review',
        done: didReviewToday,
        priority: 1
      });
    }

    // 2. Aptitude drill (always — most cutoff-sensitive)
    items.push({
      id: 'aptitude',
      type: 'aptitude',
      label: aptWeakSection === 'mixed'
        ? 'Mixed aptitude · 10 questions'
        : `${aptWeakSection.charAt(0).toUpperCase() + aptWeakSection.slice(1)} drill · 10 questions`,
      time: '~12 min',
      link: `/aptitude/practice?section=${aptWeakSection}&count=10`,
      done: didAptitudeToday,
      priority: 2
    });

    // 3. DSA problem of the day
    if (nextDsa) {
      items.push({
        id: 'dsa',
        type: 'dsa',
        label: `Solve "${nextDsa.title}" · ${nextDsa.difficulty}`,
        time: '~25 min',
        link: `/dsa/${nextDsa.slug}`,
        done: didDsaToday,
        priority: 3
      });
    }

    // 4. Rotate Theory or SQL by day-of-year (alternates day-by-day)
    const rotateTheory = (today.getDate() + today.getMonth()) % 2 === 0;
    if (rotateTheory) {
      items.push({
        id: 'theory',
        type: 'theory',
        label: theoryWeakSection === 'mixed'
          ? 'CS Core MCQs · 10 questions'
          : `${theoryWeakSection.toUpperCase()} drill · 10 questions`,
        time: '~10 min',
        link: `/theory/practice?section=${theoryWeakSection}&count=10`,
        done: didTheoryToday,
        priority: 4
      });
    } else if (nextSql) {
      items.push({
        id: 'sql',
        type: 'sql',
        label: `SQL lesson ${nextSql.lessonNumber} · ${nextSql.title}`,
        time: '~20 min',
        link: `/sql/lesson/${nextSql.lessonNumber}`,
        done: didSqlToday,
        priority: 4
      });
    }

    // 5. Once-a-day HR practice (lighter cadence)
    if (today.getDay() === 0 || today.getDay() === 3 || !didHrToday) {
      items.push({
        id: 'hr',
        type: 'hr',
        label: nextHr ? `HR practice · "${nextHr.question.slice(0, 50)}${nextHr.question.length > 50 ? '...' : ''}"` : 'HR practice',
        time: '~10 min',
        link: '/hr',
        done: didHrToday,
        priority: 5,
        optional: true
      });
    }

    const totalItems = items.length;
    const completedItems = items.filter((i) => i.done).length;

    res.json({
      date: today.toISOString().slice(0, 10),
      items,
      totalItems,
      completedItems,
      isComplete: completedItems === totalItems,
      streakSafe: completedItems >= Math.max(2, Math.floor(totalItems * 0.5))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
