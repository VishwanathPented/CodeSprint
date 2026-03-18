import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/public/profile/:username
// @desc    Get public profile data by username
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('name username streak completedDays githubRepo createdAt');
    
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
