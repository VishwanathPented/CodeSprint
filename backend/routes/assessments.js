import express from 'express';
import MockTest from '../models/MockTest.js';
import TestResult from '../models/TestResult.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/assessments
// @desc    Get all active mock tests (brief info without answers)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const tests = await MockTest.find({ isActive: true })
      .select('-mcqs.correctAnswer -mcqs.explanation -codingProblems.expectedOutput')
      .sort({ createdAt: -1 });

    // Identify which tests the user has completed
    const userResults = await TestResult.find({ user: req.user._id });
    const completedTestIds = userResults.map(tr => tr.mockTest.toString());

    // Merge status
    const mappedTests = tests.map(t => {
      const obj = t.toObject();
      const pastResult = userResults.find(tr => tr.mockTest.toString() === obj._id.toString());
      if (pastResult) {
        obj.isCompleted = true;
        obj.score = pastResult.mcqScore;
      } else {
        obj.isCompleted = false;
      }
      return obj;
    });

    res.json(mappedTests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/assessments/:id
// @desc    Get a specific test for execution (still hides answers)
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Determine if user already took it
    const existing = await TestResult.findOne({ user: req.user._id, mockTest: req.params.id });
    if (existing) {
      return res.status(403).json({ message: 'You have already attempted this assessment. Retakes are not allowed.' });
    }

    const test = await MockTest.findById(req.params.id)
      .select('-mcqs.correctAnswer -mcqs.explanation -codingProblems.expectedOutput');

    if (!test) return res.status(404).json({ message: 'Test not found' });
    
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/assessments/submit/:id
// @desc    Grade and save a mock test result
// @access  Private
router.post('/submit/:id', protect, async (req, res) => {
  try {
    const { answers, tabSwitches, timeTaken, isAutoSubmit } = req.body;
    
    // Check if duplicate submission
    const existing = await TestResult.findOne({ user: req.user._id, mockTest: req.params.id });
    if (existing) {
      return res.status(400).json({ message: 'Result already recorded.' });
    }

    const originalTest = await MockTest.findById(req.params.id);
    if (!originalTest) return res.status(404).json({ message: 'Test not found' });

    // Grade MCQs
    let score = 0;
    const recordedAnswers = [];
    
    // `answers` is expected to be an object map: { [questionIndex]: selectedOptionIndex }
    originalTest.mcqs.forEach((mcq, idx) => {
      const selected = answers[idx];
      const isCorrect = selected === mcq.correctAnswer;
      if (isCorrect) score += 1;
      
      recordedAnswers.push({
        questionIndex: idx,
        selectedOption: selected !== undefined ? selected : -1,
        isCorrect
      });
    });

    // Zero-tolerance tab switch policy penalty hook (Customizable)
    let finalScore = score;
    if (tabSwitches >= 3) {
      finalScore = 0; // Severe penalty for cheating
    }

    const result = await TestResult.create({
      user: req.user._id,
      mockTest: req.params.id,
      mcqScore: finalScore,
      totalQuestions: originalTest.mcqs.length,
      tabSwitchCount: tabSwitches,
      timeTakenMinutes: timeTaken || 0,
      isAutoSubmitted: isAutoSubmit || false,
      mcqAnswers: recordedAnswers
    });

    res.json({
      message: tabSwitches >= 3 ? 'Exam Terminated due to suspicious browser activity.' : 'Assessment graded successfully.',
      score: finalScore,
      total: originalTest.mcqs.length,
      warnings: tabSwitches
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
