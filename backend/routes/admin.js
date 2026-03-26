import express from 'express';
import DayContent from '../models/DayContent.js';
import User from '../models/User.js';
import TestResult from '../models/TestResult.js';
import MockTest from '../models/MockTest.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes here should be protected and admin only
router.use(protect);
router.use(admin);

// @route   GET /api/admin/stats
// @desc    Get site analytics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const subscribedUsers = await User.countDocuments({ isSubscribed: true });
    const usersWithStreaks = await User.find({ streak: { $gt: 0 } }).countDocuments();
    
    // Simple average progress
    const users = await User.find({ role: 'user' }, 'completedDays');
    const totalCompletion = users.reduce((acc, u) => acc + (u.completedDays?.length || 0), 0);
    const avgCompletion = totalUsers > 0 ? (totalCompletion / totalUsers).toFixed(1) : 0;

    res.json({
      totalUsers,
      subscribedUsers,
      revenue: subscribedUsers * 49, // Mock $49 subscription
      avgCompletion,
      activeStreaks: usersWithStreaks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with progress
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/day/:dayNumber
// @desc    Update content for a specific day
router.put('/day/:dayNumber', async (req, res) => {
  try {
    const updated = await DayContent.findOneAndUpdate(
      { dayNumber: req.params.dayNumber },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Day not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/assessments/results
// @desc    Get all test results globally with populated student/test details
router.get('/assessments/results', async (req, res) => {
  try {
    const results = await TestResult.find()
      .populate('user', 'name email registrationDetails')
      .populate('mockTest', 'companyName title mcqs')
      .sort({ createdAt: -1 });

    const formatted = results.map(r => ({
      _id: r._id,
      studentName: r.user?.name || 'Unknown',
      studentEmail: r.user?.email || 'N/A',
      usn: r.user?.registrationDetails?.usn || 'N/A',
      company: r.mockTest?.companyName || 'N/A',
      testTitle: r.mockTest?.title || 'Old Test',
      score: r.mcqScore,
      total: r.totalQuestions || r.mockTest?.mcqs?.length || 0,
      warnings: r.tabSwitchCount,
      timeTaken: r.timeTakenMinutes,
      isAutoSubmitted: r.isAutoSubmitted,
      submittedAt: r.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/assessments
// @desc    Get all mock tests (definitions)
router.get('/assessments', async (req, res) => {
  try {
    const tests = await MockTest.find().sort({ createdAt: -1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/assessments
// @desc    Create a new mock test
router.post('/assessments', async (req, res) => {
  try {
    const newTest = await MockTest.create(req.body);
    res.status(201).json(newTest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/assessments/:id
// @desc    Update an existing mock test
router.put('/assessments/:id', async (req, res) => {
  try {
    const updated = await MockTest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Test not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/assessments/:id
// @desc    Delete a mock test and cascade delete its results
router.delete('/assessments/:id', async (req, res) => {
  try {
    const test = await MockTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    await MockTest.findByIdAndDelete(req.params.id);
    await TestResult.deleteMany({ mockTest: req.params.id });

    res.json({ message: 'Test and associated results deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

