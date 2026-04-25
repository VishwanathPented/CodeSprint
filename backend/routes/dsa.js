import express from 'express';
import DsaProblem from '../models/DsaProblem.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/dsa/overview — topic counts + companies list
router.get('/overview', protect, async (req, res) => {
  try {
    const byTopic = await DsaProblem.aggregate([
      { $group: { _id: '$topic', total: { $sum: 1 }, easy: { $sum: { $cond: [{ $eq: ['$difficulty', 'Easy'] }, 1, 0] } }, medium: { $sum: { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 1, 0] } }, hard: { $sum: { $cond: [{ $eq: ['$difficulty', 'Hard'] }, 1, 0] } } } }
    ]);
    const companiesDoc = await DsaProblem.aggregate([
      { $unwind: '$companies' },
      { $group: { _id: '$companies', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const totalProblems = await DsaProblem.countDocuments();

    const topicMap = {};
    byTopic.forEach((t) => { topicMap[t._id] = { total: t.total, easy: t.easy, medium: t.medium, hard: t.hard }; });

    res.json({
      totalProblems,
      byTopic: topicMap,
      companies: companiesDoc.map((c) => ({ name: c._id, count: c.count })),
      solved: req.user.dsaProgress?.solvedProblems || [],
      topicStats: req.user.dsaProgress?.topicStats || {}
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/dsa/problems?topic=&difficulty=&company=
router.get('/problems', protect, async (req, res) => {
  try {
    const { topic, difficulty, company } = req.query;
    const filter = {};
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (company) filter.companies = company;

    const problems = await DsaProblem.find(filter)
      .select('slug order title topic difficulty companies')
      .sort({ order: 1 });

    res.json({ problems, solved: req.user.dsaProgress?.solvedProblems || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/dsa/problem/:slug
router.get('/problem/:slug', protect, async (req, res) => {
  try {
    const problem = await DsaProblem.findOne({ slug: req.params.slug })
      .select('-solutionNotes');
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    const solved = (req.user.dsaProgress?.solvedProblems || []).includes(problem.slug);
    res.json({ problem, solved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/dsa/mark-solved { slug }
router.post('/mark-solved', protect, async (req, res) => {
  try {
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ message: 'slug required' });

    const problem = await DsaProblem.findOne({ slug });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const user = await User.findById(req.user._id);
    if (!user.dsaProgress) {
      user.dsaProgress = {
        solvedProblems: [],
        topicStats: {
          arrays: { solved: 0 }, strings: { solved: 0 }, 'linked-list': { solved: 0 },
          'stack-queue': { solved: 0 }, hashing: { solved: 0 }, 'recursion-trees': { solved: 0 }
        }
      };
    }
    if (!user.dsaProgress.solvedProblems.includes(slug)) {
      user.dsaProgress.solvedProblems.push(slug);
      const topicKey = problem.topic;
      if (user.dsaProgress.topicStats?.[topicKey]) {
        user.dsaProgress.topicStats[topicKey].solved += 1;
      }
    }
    if (!user.lastActivity) user.lastActivity = {};
    user.lastActivity.dsa = new Date();
    await user.save();
    res.json({ message: 'Marked solved', dsaProgress: user.dsaProgress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
