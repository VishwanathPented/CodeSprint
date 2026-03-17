import express from 'express';
import DayContent from '../models/DayContent.js';

const router = express.Router();

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
