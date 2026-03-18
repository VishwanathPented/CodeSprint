import express from 'express';
import User from '../models/User.js';
import Day from '../models/Day.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

// @route   GET /api/user/leaderboard
// @desc    Get top users by streak and score
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({})
      .select('name streak completedDays')
      .sort({ streak: -1, 'completedDays.length': -1 })
      .limit(10);
    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/user/complete-day
// @desc    Mark current day as complete and unlock next day
router.post('/complete-day', protect, async (req, res) => {
  try {
    const user = req.user;
    const { dayNumber, mcqScore, codingAttempted, aptitudeScore, githubLink } = req.body;
    
    // Only allow completing the current unlocked day
    if (dayNumber !== user.currentDay) {
      return res.status(400).json({ message: 'Can only complete current active day' });
    }
    
    // Check if subscription needed (mock feature, say free up to day 5)
    if (dayNumber >= 5 && !user.isSubscribed) {
      return res.status(403).json({ message: 'Subscription required to proceed beyond Day 5' });
    }

    // Save score
    user.scores.push({
      dayNumber,
      mcqScore,
      codingAttempted,
      githubLink,
      aptitudeScore
    });

    if (!user.completedDays.includes(dayNumber)) {
      user.completedDays.push(dayNumber);
      user.currentDay += 1; // Unlock next day
      
      // Basic streak logic
      const today = new Date().setHours(0,0,0,0);
      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).setHours(0,0,0,0) : null;
      
      if (!lastActive) {
        user.streak = 1;
      } else {
        const diffTime = Math.abs(today - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 1) {
          user.streak += 1;
        } else if (diffDays > 1) {
          user.streak = 1; // Reset streak
        }
      }
      user.lastActiveDate = new Date();
    }
    
    await user.save();
    res.json({ message: `Day ${dayNumber} completed! Day ${user.currentDay} unlocked.`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/user/subscribe
// @desc    Mock subscription payment
router.post('/subscribe', protect, async (req, res) => {
  try {
    req.user.isSubscribed = true;
    await req.user.save();
    res.json({ message: 'Subscription successful. Full course unlocked.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/user/update-repo
// @desc    Update user's main GitHub repository URL
router.put('/update-repo', protect, async (req, res) => {
  try {
    const { githubRepo } = req.body;
    req.user.githubRepo = githubRepo;
    await req.user.save();
    res.json({ message: 'GitHub Repository updated successfully', user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/user/warmup
// @desc    Get 3 random MCQs from completed days
router.get('/warmup', protect, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.completedDays || user.completedDays.length === 0) {
      return res.json({ mcqs: [] });
    }

    const days = await Day.find({ dayNumber: { $in: user.completedDays } });
    
    let allMcqs = [];
    days.forEach(day => {
      if (day.mcqs && day.mcqs.length > 0) {
        day.mcqs.forEach(mcq => {
          allMcqs.push({
            ...mcq.toObject(),
            sourceDay: day.dayNumber
          });
        });
      }
    });

    const shuffled = allMcqs.sort(() => 0.5 - Math.random());
    const selectedMcqs = shuffled.slice(0, 3);

    res.json({ mcqs: selectedMcqs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
