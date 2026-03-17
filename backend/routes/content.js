import express from 'express';
import DayContent from '../models/DayContent.js';

const router = express.Router();

// Middleware to protect routes can be added here
// For MVP, we will keep it simple and assume the frontend passes auth token.

// @route   GET /api/content/day/:dayNumber
// @desc    Get content for a specific day
router.get('/day/:dayNumber', async (req, res) => {
  try {
    const day = await DayContent.findOne({ dayNumber: req.params.dayNumber });
    if (!day) return res.status(404).json({ message: 'Day content not found' });
    res.json(day);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/content/roadmap
// @desc    Get summary for all 50 days (timeline view)
router.get('/roadmap', async (req, res) => {
  try {
    // Return only basic info to populate roadmap
    const days = await DayContent.find({}).select('dayNumber topicTitle description').sort({ dayNumber: 1 });
    res.json(days);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
