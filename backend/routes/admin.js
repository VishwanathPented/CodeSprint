import express from 'express';
import DayContent from '../models/DayContent.js';
import User from '../models/User.js';
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

export default router;

