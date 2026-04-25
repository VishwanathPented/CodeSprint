import express from 'express';
import WrongAnswer from '../models/WrongAnswer.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { todayKey } from '../utils/activityLog.js';

const router = express.Router();

// Spaced repetition intervals (in days). Index by current intervalDays bucket.
const NEXT_INTERVAL = { 3: 7, 7: 14, 14: 30, 30: 30 };
const MASTERY_STREAK = 3; // consecutive correct reviews at >=14d before retiring

// GET /api/review/counts — { due, total, masteredCount }
router.get('/counts', protect, async (req, res) => {
  try {
    const now = new Date();
    const [due, total, mastered] = await Promise.all([
      WrongAnswer.countDocuments({ user: req.user._id, mastered: false, dueAt: { $lte: now } }),
      WrongAnswer.countDocuments({ user: req.user._id, mastered: false }),
      WrongAnswer.countDocuments({ user: req.user._id, mastered: true })
    ]);
    res.json({ due, total, mastered });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/review/due?limit=10 — returns up to N due cards (oldest first)
router.get('/due', protect, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 30);
    const now = new Date();
    const cards = await WrongAnswer
      .find({ user: req.user._id, mastered: false, dueAt: { $lte: now } })
      .sort({ dueAt: 1 })
      .limit(limit);

    // Strip correctIndex from client view (sent only in /grade response)
    const safe = cards.map((c) => ({
      _id: c._id,
      questionType: c.questionType,
      section: c.section,
      topic: c.topic,
      difficulty: c.difficulty,
      questionText: c.questionText,
      options: c.options,
      intervalDays: c.intervalDays,
      reviewCount: c.reviewCount,
      correctStreak: c.correctStreak
    }));
    res.json({ cards: safe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/review/grade — body: { cardId, selectedIndex }
// Returns { isCorrect, correctIndex, explanation, nextDueAt, mastered }
router.post('/grade', protect, async (req, res) => {
  try {
    const { cardId, selectedIndex } = req.body;
    if (!cardId || selectedIndex === undefined) {
      return res.status(400).json({ message: 'cardId and selectedIndex required' });
    }

    const card = await WrongAnswer.findOne({ _id: cardId, user: req.user._id });
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const isCorrect = Number(selectedIndex) === card.correctIndex;
    const now = new Date();

    if (isCorrect) {
      card.correctStreak = (card.correctStreak || 0) + 1;
      const nextInterval = NEXT_INTERVAL[card.intervalDays] || 30;
      card.intervalDays = nextInterval;
      card.dueAt = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000);
      // Retire after sustained correct streak at the longest interval
      if (card.correctStreak >= MASTERY_STREAK && nextInterval >= 14) {
        card.mastered = true;
      }
    } else {
      card.correctStreak = 0;
      card.intervalDays = 3;
      card.dueAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    }
    card.reviewCount += 1;
    card.lastReviewedAt = now;
    await card.save();

    // Update lastActivity.review + activity log on user
    await User.updateOne(
      { _id: req.user._id },
      {
        $set: { 'lastActivity.review': now },
        $addToSet: { [`activityLog.${todayKey(now)}`]: 'review' }
      }
    );

    res.json({
      isCorrect,
      correctIndex: card.correctIndex,
      explanation: card.explanation,
      nextDueAt: card.dueAt,
      intervalDays: card.intervalDays,
      mastered: card.mastered
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/review/journal?limit=50 — full wrong-answer journal (browse mode)
router.get('/journal', protect, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const cards = await WrongAnswer
      .find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(limit);
    res.json({ cards });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
