import express from 'express';
import HrQuestion from '../models/HrQuestion.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/hr/questions — list all HR questions (metadata + framework, includes sample)
router.get('/questions', protect, async (req, res) => {
  try {
    const qs = await HrQuestion.find({}).sort({ order: 1 });
    const history = req.user.hrPractice || [];
    // Map question id to latest practice entry
    const practicedMap = new Map();
    for (const h of history) {
      if (!h.questionId) continue;
      const existing = practicedMap.get(String(h.questionId));
      if (!existing || new Date(h.practicedAt) > new Date(existing.practicedAt)) {
        practicedMap.set(String(h.questionId), h);
      }
    }
    const payload = qs.map((q) => {
      const practiced = practicedMap.get(String(q._id));
      return {
        _id: q._id,
        order: q.order,
        category: q.category,
        difficulty: q.difficulty,
        question: q.question,
        framework: q.framework,
        sampleAnswer: q.sampleAnswer,
        tips: q.tips,
        practiced: Boolean(practiced),
        lastScore: practiced?.score ?? null,
        lastPracticedAt: practiced?.practicedAt ?? null
      };
    });
    res.json({ questions: payload, totalPracticed: practicedMap.size });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/hr/log — record a practice attempt + AI feedback (called after grading)
router.post('/log', protect, async (req, res) => {
  try {
    const { questionId, question, answer, feedback, score } = req.body;
    if (!questionId || !answer) return res.status(400).json({ message: 'questionId and answer required' });
    const user = await User.findById(req.user._id);
    user.hrPractice = user.hrPractice || [];
    user.hrPractice.push({ questionId, question, answer, feedback, score, practicedAt: new Date() });
    // Keep only the latest 50 attempts per user
    if (user.hrPractice.length > 50) {
      user.hrPractice = user.hrPractice.slice(-50);
    }
    if (!user.lastActivity) user.lastActivity = {};
    user.lastActivity.hr = new Date();
    await user.save();
    res.json({ logged: true, total: user.hrPractice.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
