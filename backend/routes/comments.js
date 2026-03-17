import express from 'express';
import Comment from '../models/Comment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/comments/:dayNumber
// @desc    Get all comments for a specific day
router.get('/:dayNumber', async (req, res) => {
  try {
    const comments = await Comment.find({ dayNumber: req.params.dayNumber })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching comments' });
  }
});

// @route   POST /api/comments/:dayNumber
// @desc    Post a comment for a specific day
router.post('/:dayNumber', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const newComment = new Comment({
      user: req.user._id,
      dayNumber: req.params.dayNumber,
      text
    });

    await newComment.save();
    
    const populatedComment = await Comment.findById(newComment._id).populate('user', 'name');
    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: 'Server error saving comment' });
  }
});

export default router;
