import express from 'express';
import TheoryQuestion from '../models/TheoryQuestion.js';
import User from '../models/User.js';
import WrongAnswer from '../models/WrongAnswer.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/overview', protect, async (req, res) => {
  try {
    const counts = await TheoryQuestion.aggregate([
      { $group: { _id: { section: '$section', topic: '$topic' }, count: { $sum: 1 } } }
    ]);
    const bySection = { os: { total: 0, topics: {} }, networks: { total: 0, topics: {} }, oop: { total: 0, topics: {} } };
    counts.forEach(({ _id, count }) => {
      if (!bySection[_id.section]) return;
      bySection[_id.section].total += count;
      bySection[_id.section].topics[_id.topic] = count;
    });
    res.json({ bySection, stats: req.user.theoryProgress || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/session', protect, async (req, res) => {
  try {
    const { section, count = 15, topic } = req.query;
    const size = Math.min(Math.max(parseInt(count, 10) || 15, 5), 30);
    const match = {};
    if (section && section !== 'mixed') match.section = section;
    if (topic) match.topic = topic;

    const questions = await TheoryQuestion.aggregate([
      { $match: match },
      { $sample: { size } }
    ]);

    const clientQuestions = questions.map((q) => ({
      _id: q._id,
      section: q.section,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      timeLimit: q.timeLimit
    }));

    res.json({ questions: clientQuestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/grade', protect, async (req, res) => {
  try {
    const { answers = [] } = req.body;
    if (!Array.isArray(answers) || !answers.length) {
      return res.status(400).json({ message: 'answers array required' });
    }

    const ids = answers.map((a) => a.questionId);
    const questions = await TheoryQuestion.find({ _id: { $in: ids } });
    const byId = new Map(questions.map((q) => [String(q._id), q]));

    const results = [];
    const perSection = { os: { attempted: 0, correct: 0 }, networks: { attempted: 0, correct: 0 }, oop: { attempted: 0, correct: 0 } };
    const perTopic = {};
    const wrongQs = [];
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

    const user = await User.findById(req.user._id);
    if (!user.theoryProgress) {
      user.theoryProgress = {
        sessionsCompleted: 0, totalAttempted: 0, totalCorrect: 0,
        sectionStats: {
          os: { attempted: 0, correct: 0 },
          networks: { attempted: 0, correct: 0 },
          oop: { attempted: 0, correct: 0 }
        },
        bestSessionAccuracy: 0
      };
    }
    user.theoryProgress.sessionsCompleted += 1;
    user.theoryProgress.totalAttempted += attempted;
    user.theoryProgress.totalCorrect += correctCount;
    for (const sec of ['os', 'networks', 'oop']) {
      user.theoryProgress.sectionStats[sec].attempted += perSection[sec].attempted;
      user.theoryProgress.sectionStats[sec].correct += perSection[sec].correct;
    }
    if (!user.theoryProgress.topicStats) user.theoryProgress.topicStats = new Map();
    for (const [topic, stat] of Object.entries(perTopic)) {
      const existing = user.theoryProgress.topicStats.get(topic) || { attempted: 0, correct: 0 };
      user.theoryProgress.topicStats.set(topic, {
        attempted: existing.attempted + stat.attempted,
        correct: existing.correct + stat.correct
      });
    }
    if (accuracy > (user.theoryProgress.bestSessionAccuracy || 0)) {
      user.theoryProgress.bestSessionAccuracy = accuracy;
    }
    if (!user.lastActivity) user.lastActivity = {};
    user.lastActivity.theory = new Date();
    if (attempted >= 10) {
      user.lastActivity.theoryQualifying = new Date();
    }
    await user.save();

    if (wrongQs.length) {
      const now = new Date();
      const due = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      await Promise.all(wrongQs.map((q) =>
        WrongAnswer.findOneAndUpdate(
          { user: user._id, questionRef: q._id },
          {
            $setOnInsert: {
              user: user._id,
              questionType: 'theory',
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
            $set: { mastered: false }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      ));
    }

    res.json({
      results,
      summary: { attempted, correct: correctCount, accuracy },
      theoryProgress: user.theoryProgress
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/weak-topics', protect, async (req, res) => {
  try {
    const topicStats = req.user.theoryProgress?.topicStats;
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
