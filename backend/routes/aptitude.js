import express from 'express';
import AptitudeQuestion from '../models/AptitudeQuestion.js';
import User from '../models/User.js';
import WrongAnswer from '../models/WrongAnswer.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/aptitude/overview — totals per section/topic for landing page
router.get('/overview', protect, async (req, res) => {
  try {
    const counts = await AptitudeQuestion.aggregate([
      { $group: { _id: { section: '$section', topic: '$topic' }, count: { $sum: 1 } } }
    ]);

    const bySection = { quantitative: { total: 0, topics: {} }, logical: { total: 0, topics: {} }, verbal: { total: 0, topics: {} } };
    counts.forEach(({ _id, count }) => {
      if (!bySection[_id.section]) return;
      bySection[_id.section].total += count;
      bySection[_id.section].topics[_id.topic] = count;
    });

    res.json({ bySection, stats: req.user.aptitudeProgress || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/aptitude/session?section=...&count=20&topic=optional
router.get('/session', protect, async (req, res) => {
  try {
    const { section, count = 15, topic } = req.query;
    const size = Math.min(Math.max(parseInt(count, 10) || 15, 5), 30);
    const match = {};
    if (section && section !== 'mixed') match.section = section;
    if (topic) match.topic = topic;

    const questions = await AptitudeQuestion.aggregate([
      { $match: match },
      { $sample: { size } }
    ]);

    // Strip correctIndex and explanation from the client-facing response
    const clientQuestions = questions.map((q) => ({
      _id: q._id,
      section: q.section,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      passage: q.passage,
      options: q.options,
      timeLimit: q.timeLimit
    }));

    res.json({ questions: clientQuestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/aptitude/grade — body: { answers: [{questionId, selectedIndex}] }
// Returns per-question verdict + overall score, and updates user progress.
router.post('/grade', protect, async (req, res) => {
  try {
    const { answers = [] } = req.body;
    if (!Array.isArray(answers) || !answers.length) {
      return res.status(400).json({ message: 'answers array required' });
    }

    const ids = answers.map((a) => a.questionId);
    const questions = await AptitudeQuestion.find({ _id: { $in: ids } });
    const byId = new Map(questions.map((q) => [String(q._id), q]));

    const results = [];
    const perSection = { quantitative: { attempted: 0, correct: 0 }, logical: { attempted: 0, correct: 0 }, verbal: { attempted: 0, correct: 0 } };
    const perTopic = {}; // topic → { attempted, correct }
    const wrongQs = []; // questions answered incorrectly — for SRS
    let correctCount = 0;

    for (const a of answers) {
      const q = byId.get(String(a.questionId));
      if (!q) continue;
      const isCorrect = a.selectedIndex === q.correctIndex;
      if (isCorrect) correctCount += 1;
      perSection[q.section].attempted += 1;
      if (isCorrect) perSection[q.section].correct += 1;
      if (!perTopic[q.topic]) perTopic[q.topic] = { attempted: 0, correct: 0 };
      perTopic[q.topic].attempted += 1;
      if (isCorrect) perTopic[q.topic].correct += 1;
      if (!isCorrect) wrongQs.push(q);
      results.push({
        questionId: q._id,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        selectedIndex: a.selectedIndex,
        isCorrect,
        explanation: q.explanation,
        topic: q.topic,
        section: q.section
      });
    }

    const attempted = answers.length;
    const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;

    // Update user progress
    const user = await User.findById(req.user._id);
    if (!user.aptitudeProgress) {
      user.aptitudeProgress = {
        sessionsCompleted: 0, totalAttempted: 0, totalCorrect: 0,
        sectionStats: {
          quantitative: { attempted: 0, correct: 0 },
          logical: { attempted: 0, correct: 0 },
          verbal: { attempted: 0, correct: 0 }
        },
        bestSessionAccuracy: 0
      };
    }
    user.aptitudeProgress.sessionsCompleted += 1;
    user.aptitudeProgress.totalAttempted += attempted;
    user.aptitudeProgress.totalCorrect += correctCount;
    for (const sec of ['quantitative', 'logical', 'verbal']) {
      user.aptitudeProgress.sectionStats[sec].attempted += perSection[sec].attempted;
      user.aptitudeProgress.sectionStats[sec].correct += perSection[sec].correct;
    }
    // Bump per-topic stats (Map)
    if (!user.aptitudeProgress.topicStats) user.aptitudeProgress.topicStats = new Map();
    for (const [topic, stat] of Object.entries(perTopic)) {
      const existing = user.aptitudeProgress.topicStats.get(topic) || { attempted: 0, correct: 0 };
      user.aptitudeProgress.topicStats.set(topic, {
        attempted: existing.attempted + stat.attempted,
        correct: existing.correct + stat.correct
      });
    }
    if (accuracy > (user.aptitudeProgress.bestSessionAccuracy || 0)) {
      user.aptitudeProgress.bestSessionAccuracy = accuracy;
    }
    if (!user.lastActivity) user.lastActivity = {};
    user.lastActivity.aptitude = new Date();
    // A "qualifying" daily aptitude requires at least 10 attempts in one session.
    if (attempted >= 10) {
      user.lastActivity.aptitudeQualifying = new Date();
    }
    await user.save();

    // Record wrong answers as SRS cards (idempotent — upsert by user+questionRef)
    if (wrongQs.length) {
      const now = new Date();
      const due = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      await Promise.all(wrongQs.map((q) =>
        WrongAnswer.findOneAndUpdate(
          { user: user._id, questionRef: q._id },
          {
            $setOnInsert: {
              user: user._id,
              questionType: 'aptitude',
              questionRef: q._id,
              section: q.section,
              topic: q.topic,
              difficulty: q.difficulty,
              questionText: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
              explanation: q.explanation,
              intervalDays: 3,
              dueAt: due,
              reviewCount: 0,
              correctStreak: 0
            },
            $set: {
              // If already mastered, missing it again resurrects the card
              mastered: false
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      ));
    }

    res.json({
      results,
      summary: {
        attempted,
        correct: correctCount,
        accuracy
      },
      aptitudeProgress: user.aptitudeProgress
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/aptitude/weak-topics — top 3 weakest topics with ≥3 attempts
router.get('/weak-topics', protect, async (req, res) => {
  try {
    const topicStats = req.user.aptitudeProgress?.topicStats;
    if (!topicStats || (topicStats.size ?? Object.keys(topicStats).length) === 0) {
      return res.json({ weak: [] });
    }
    const entries = [];
    const iter = topicStats instanceof Map ? topicStats.entries() : Object.entries(topicStats);
    for (const [topic, stat] of iter) {
      if (!stat || stat.attempted < 3) continue;
      const accuracy = Math.round((stat.correct / stat.attempted) * 100);
      entries.push({ topic, attempted: stat.attempted, correct: stat.correct, accuracy });
    }
    entries.sort((a, b) => a.accuracy - b.accuracy);
    res.json({ weak: entries.slice(0, 3) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
