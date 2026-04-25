import express from 'express';
import SqlLesson from '../models/SqlLesson.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/sql/roadmap — summary of all SQL lessons
router.get('/roadmap', protect, async (req, res) => {
  try {
    const lessons = await SqlLesson.find({})
      .select('lessonNumber title description difficulty')
      .sort({ lessonNumber: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/sql/lesson/:lessonNumber — full lesson content
router.get('/lesson/:lessonNumber', protect, async (req, res) => {
  try {
    const lesson = await SqlLesson.findOne({ lessonNumber: req.params.lessonNumber });
    if (!lesson) return res.status(404).json({ message: 'SQL lesson not found' });

    const lessonNum = Number(req.params.lessonNumber);
    const completed = req.user.sqlProgress?.completedLessons || [];
    const currentLesson = req.user.sqlProgress?.currentLesson || 1;

    // Gate: freemium — lessons 1-4 free, rest behind subscription
    if (lessonNum > 4 && !req.user.isSubscribed && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Subscription required for lessons beyond 4', locked: true });
    }

    // Sequential gating: can only access up to currentLesson or completed ones
    if (lessonNum > currentLesson && !completed.includes(lessonNum)) {
      return res.status(403).json({ message: 'Complete previous lesson first', gated: true });
    }

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/sql/complete-lesson — record progress
router.post('/complete-lesson', protect, async (req, res) => {
  try {
    const { lessonNumber, theoryScore, queriesSolved, totalQueries } = req.body;

    const user = await User.findById(req.user._id);
    if (!user.sqlProgress) {
      user.sqlProgress = { completedLessons: [], currentLesson: 1, scores: [] };
    }

    if (!user.sqlProgress.completedLessons.includes(lessonNumber)) {
      user.sqlProgress.completedLessons.push(lessonNumber);
    }

    // Remove old score for this lesson, push new one
    user.sqlProgress.scores = (user.sqlProgress.scores || []).filter(
      s => s.lessonNumber !== lessonNumber
    );
    user.sqlProgress.scores.push({ lessonNumber, theoryScore, queriesSolved, totalQueries });

    if (lessonNumber >= user.sqlProgress.currentLesson) {
      user.sqlProgress.currentLesson = lessonNumber + 1;
    }

    if (!user.lastActivity) user.lastActivity = {};
    user.lastActivity.sql = new Date();
    await user.save();
    res.json({ message: 'SQL lesson completed', sqlProgress: user.sqlProgress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
