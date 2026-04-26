import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import DayContent from '../models/DayContent.js';
import User from '../models/User.js';
import TestResult from '../models/TestResult.js';
import MockTest from '../models/MockTest.js';
import DsaProblem from '../models/DsaProblem.js';
import SqlLesson from '../models/SqlLesson.js';
import TheoryQuestion from '../models/TheoryQuestion.js';
import AptitudeQuestion from '../models/AptitudeQuestion.js';
import HrQuestion from '../models/HrQuestion.js';
import Comment from '../models/Comment.js';
import WrongAnswer from '../models/WrongAnswer.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes here should be protected and admin only
router.use(protect);
router.use(admin);

// ============================================================
// ANALYTICS
// ============================================================

// @route   GET /api/admin/stats
// @desc    Get site analytics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const subscribedUsers = await User.countDocuments({ isSubscribed: true });
    const usersWithStreaks = await User.find({ streak: { $gt: 0 } }).countDocuments();

    const users = await User.find({ role: 'user' }, 'completedDays');
    const totalCompletion = users.reduce((acc, u) => acc + (u.completedDays?.length || 0), 0);
    const avgCompletion = totalUsers > 0 ? (totalCompletion / totalUsers).toFixed(1) : 0;

    const [
      dsaCount, sqlCount, theoryCount, aptitudeCount, hrCount,
      mockCount, resultCount, commentCount, dayCount
    ] = await Promise.all([
      DsaProblem.countDocuments(),
      SqlLesson.countDocuments(),
      TheoryQuestion.countDocuments(),
      AptitudeQuestion.countDocuments(),
      HrQuestion.countDocuments(),
      MockTest.countDocuments(),
      TestResult.countDocuments(),
      Comment.countDocuments(),
      DayContent.countDocuments()
    ]);

    res.json({
      totalUsers,
      subscribedUsers,
      revenue: subscribedUsers * 49,
      avgCompletion,
      activeStreaks: usersWithStreaks,
      content: {
        days: dayCount,
        dsa: dsaCount,
        sql: sqlCount,
        theory: theoryCount,
        aptitude: aptitudeCount,
        hr: hrCount,
        mockTests: mockCount,
        testResults: resultCount,
        comments: commentCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// USERS
// ============================================================

// @route   GET /api/admin/users
// @desc    Get all users (including admins)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Detailed user record
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/admin/users/:id
// @desc    Update user fields (subscription, role, registration, current day, streak)
router.patch('/users/:id', async (req, res) => {
  try {
    const allowed = [
      'name', 'email', 'username', 'isSubscribed', 'role',
      'currentDay', 'streak', 'longestStreak', 'githubRepo',
      'registrationDetails'
    ];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/users/:id/reset-progress
// @desc    Wipe all per-track progress for a user
router.post('/users/:id/reset-progress', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.currentDay = 1;
    user.completedDays = [];
    user.streak = 0;
    user.longestStreak = 0;
    user.lastActiveDate = undefined;
    user.lastDayCompletedDate = undefined;
    user.scores = [];
    user.sqlProgress = { completedLessons: [], currentLesson: 1, scores: [] };
    user.aptitudeProgress = undefined;
    user.theoryProgress = undefined;
    user.dsaProgress = { solvedProblems: [], topicStats: {} };
    user.hrPractice = [];
    user.lastActivity = {};
    await user.save();

    await WrongAnswer.deleteMany({ user: user._id });

    res.json({ message: 'Progress reset', user: user.toObject({ getters: true }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/users/bulk-delete
// @desc    Permanently delete multiple users and their associated data in one shot
router.post('/users/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids must be a non-empty array' });
    }

    const selfId = req.user._id.toString();
    const targetIds = ids.filter((id) => id && id.toString() !== selfId);
    const skippedSelf = ids.length - targetIds.length;

    if (targetIds.length === 0) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    const [userRes] = await Promise.all([
      User.deleteMany({ _id: { $in: targetIds } }),
      TestResult.deleteMany({ user: { $in: targetIds } }),
      WrongAnswer.deleteMany({ user: { $in: targetIds } }),
      Comment.deleteMany({ user: { $in: targetIds } })
    ]);

    res.json({
      message: `Deleted ${userRes.deletedCount} user(s)${skippedSelf ? ' (skipped your own admin account)' : ''}`,
      deletedCount: userRes.deletedCount,
      skippedSelf
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Permanently delete a user and their data
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    await Promise.all([
      User.findByIdAndDelete(user._id),
      TestResult.deleteMany({ user: user._id }),
      WrongAnswer.deleteMany({ user: user._id }),
      Comment.deleteMany({ user: user._id })
    ]);

    res.json({ message: 'User and associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// CURRICULUM (DAY CONTENT)
// ============================================================

// @route   PUT /api/admin/day/:dayNumber
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

// @route   POST /api/admin/day
// @desc    Create a brand-new day at the next number
router.post('/day', async (req, res) => {
  try {
    const last = await DayContent.findOne().sort({ dayNumber: -1 });
    const nextNumber = (last?.dayNumber || 0) + 1;
    const day = await DayContent.create({
      dayNumber: req.body.dayNumber || nextNumber,
      ...req.body
    });
    res.status(201).json(day);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/day/:dayNumber
router.delete('/day/:dayNumber', async (req, res) => {
  try {
    const deleted = await DayContent.findOneAndDelete({ dayNumber: req.params.dayNumber });
    if (!deleted) return res.status(404).json({ message: 'Day not found' });
    res.json({ message: 'Day deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// ASSESSMENT BUILDER — AI-driven question generation per day
// ============================================================

// Pull the first JSON object/array out of a model response, even if it is
// wrapped in ```json fences or has stray prose around it.
function extractJsonBlock(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  // Find the first balanced brace/bracket region.
  const firstBrace = candidate.search(/[{[]/);
  if (firstBrace === -1) return null;
  const sliced = candidate.slice(firstBrace);
  try {
    return JSON.parse(sliced);
  } catch {
    // Last resort: try to parse just up to the last closing brace/bracket.
    const lastBrace = Math.max(sliced.lastIndexOf('}'), sliced.lastIndexOf(']'));
    if (lastBrace === -1) return null;
    try {
      return JSON.parse(sliced.slice(0, lastBrace + 1));
    } catch {
      return null;
    }
  }
}

// Normalize whatever shape the model returns into our DayContent shape so the
// admin UI can edit it directly.
function normalizeGeneratedQuestions(parsed) {
  if (!parsed || typeof parsed !== 'object') return { mcqs: [], predictOutput: [] };
  const mcqsIn = Array.isArray(parsed.mcqs) ? parsed.mcqs : [];
  const predIn = Array.isArray(parsed.predictOutput) ? parsed.predictOutput : [];

  const mcqs = mcqsIn.map((m) => {
    const question = m.question || m.q || '';
    const optionsRaw = Array.isArray(m.options) ? m.options : [];
    const options = optionsRaw.map((opt) => {
      if (typeof opt === 'string') return { text: opt, isCorrect: false };
      return {
        text: opt.text ?? opt.t ?? '',
        isCorrect: !!(opt.isCorrect ?? opt.c ?? false)
      };
    });
    // If the model returned a separate correctIndex / answer rather than flagged
    // options, mark the indicated one as correct.
    if (!options.some((o) => o.isCorrect)) {
      const idx = typeof m.correctIndex === 'number' ? m.correctIndex
        : typeof m.answerIndex === 'number' ? m.answerIndex
        : -1;
      if (idx >= 0 && idx < options.length) options[idx].isCorrect = true;
    }
    return { question, options };
  }).filter((m) => m.question && m.options.length >= 2);

  const predictOutput = predIn.map((p) => ({
    codeSnippet: p.codeSnippet || p.code || '',
    expectedOutput: p.expectedOutput || p.output || '',
    explanation: p.explanation || ''
  })).filter((p) => p.codeSnippet && p.expectedOutput);

  return { mcqs, predictOutput };
}

// @route   POST /api/admin/assessment-builder/generate
// @desc    Use Gemini to draft MCQs + predict-output questions for a topic.
//          Returns editable JSON — admin reviews/edits before saving onto a day.
router.post('/assessment-builder/generate', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ message: 'AI is not configured (GEMINI_API_KEY missing).' });

  const {
    topicSummary,
    dayNumber,
    mcqCount = 10,
    predictCount = 3,
    difficulty = 'mixed'
  } = req.body || {};

  if (!topicSummary || typeof topicSummary !== 'string' || topicSummary.trim().length < 5) {
    return res.status(400).json({ message: 'Provide a topic summary describing what the test should cover.' });
  }

  const safeMcq = Math.min(Math.max(parseInt(mcqCount, 10) || 0, 0), 25);
  const safePred = Math.min(Math.max(parseInt(predictCount, 10) || 0, 0), 10);
  if (safeMcq + safePred === 0) {
    return res.status(400).json({ message: 'Request at least one MCQ or predict-output question.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an expert Java instructor authoring an assessment for the "CodeSprint 50" placement-prep course.

${dayNumber ? `Target Day: ${dayNumber}` : 'Target Day: ad-hoc'}
Topic / Concept Summary:
"""
${topicSummary.trim().substring(0, 2000)}
"""
Difficulty target: ${difficulty}

Generate exactly ${safeMcq} multiple-choice questions and exactly ${safePred} "predict the output" Java code snippets.

Strict requirements:
- Questions must be tightly relevant to the topic summary above.
- MCQs must each have exactly 4 plausible options. Exactly ONE option is correct.
- Avoid trivia. Test conceptual understanding, edge cases, and common bugs.
- Predict-output snippets must be self-contained, compile-ready Java code (include necessary imports, class wrapper, public static void main). Output must be exact text (no trailing whitespace differences).
- Do NOT repeat questions or reuse the exact same options.

Respond with ONLY a JSON object — no markdown fences, no commentary — matching exactly this schema:
{
  "mcqs": [
    {
      "question": "string",
      "options": [
        { "text": "string", "isCorrect": false },
        { "text": "string", "isCorrect": true },
        { "text": "string", "isCorrect": false },
        { "text": "string", "isCorrect": false }
      ]
    }
  ],
  "predictOutput": [
    {
      "codeSnippet": "string (full Java program)",
      "expectedOutput": "string (exact expected console output)",
      "explanation": "string (1-2 sentences on why)"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJsonBlock(text);
    if (!parsed) {
      return res.status(502).json({
        message: 'AI returned an unparseable response. Try regenerating or simplifying the topic.',
        raw: text.slice(0, 500)
      });
    }

    const normalized = normalizeGeneratedQuestions(parsed);
    if (normalized.mcqs.length === 0 && normalized.predictOutput.length === 0) {
      return res.status(502).json({
        message: 'AI produced no usable questions. Try a more specific topic summary.',
        raw: text.slice(0, 500)
      });
    }

    res.json({
      ...normalized,
      meta: {
        requestedMcq: safeMcq,
        requestedPredict: safePred,
        generatedMcq: normalized.mcqs.length,
        generatedPredict: normalized.predictOutput.length
      }
    });
  } catch (error) {
    console.error('Assessment Builder AI error:', error);
    res.status(500).json({ message: `AI generation failed: ${error.message || 'unknown error'}` });
  }
});

// @route   POST /api/admin/assessment-builder/save
// @desc    Persist a builder draft onto a day's content. mode = 'append' adds
//          to the existing mcqs/predictOutput, mode = 'replace' overwrites.
router.post('/assessment-builder/save', async (req, res) => {
  try {
    const { dayNumber, mcqs = [], predictOutput = [], mode = 'append' } = req.body || {};
    if (!dayNumber || Number.isNaN(Number(dayNumber))) {
      return res.status(400).json({ message: 'dayNumber is required.' });
    }
    if (!['append', 'replace'].includes(mode)) {
      return res.status(400).json({ message: 'mode must be "append" or "replace".' });
    }

    const day = await DayContent.findOne({ dayNumber: Number(dayNumber) });
    if (!day) return res.status(404).json({ message: `Day ${dayNumber} not found.` });

    // Validate each MCQ has exactly one correct option.
    for (const m of mcqs) {
      if (!m.question || !Array.isArray(m.options) || m.options.length < 2) {
        return res.status(400).json({ message: 'Every MCQ needs a question and at least 2 options.' });
      }
      const correctCount = m.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        return res.status(400).json({ message: `MCQ "${m.question.slice(0, 40)}..." must have exactly one correct option.` });
      }
    }

    if (mode === 'replace') {
      day.mcqs = mcqs;
      day.predictOutput = predictOutput;
    } else {
      day.mcqs = [...(day.mcqs || []), ...mcqs];
      day.predictOutput = [...(day.predictOutput || []), ...predictOutput];
    }
    await day.save();

    res.json({
      message: `Saved to Day ${dayNumber}: ${mcqs.length} MCQ(s) + ${predictOutput.length} predict-output question(s) (${mode}).`,
      dayNumber: day.dayNumber,
      totals: {
        mcqs: day.mcqs.length,
        predictOutput: day.predictOutput.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// ASSESSMENTS / MOCK TESTS
// ============================================================

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

// @route   DELETE /api/admin/assessments/results/:id
router.delete('/assessments/results/:id', async (req, res) => {
  try {
    const deleted = await TestResult.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Result not found' });
    res.json({ message: 'Result deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/assessments', async (req, res) => {
  try {
    const tests = await MockTest.find().sort({ createdAt: -1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/assessments', async (req, res) => {
  try {
    const newTest = await MockTest.create(req.body);
    res.status(201).json(newTest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

// ============================================================
// GENERIC CRUD FACTORY
// Creates GET/POST/PUT/DELETE for a Mongoose model under a base path
// ============================================================
function buildCrud(basePath, Model, options = {}) {
  const { listSort = { createdAt: -1 } } = options;

  router.get(basePath, async (req, res) => {
    try {
      const docs = await Model.find().sort(listSort);
      res.json(docs);
    } catch (e) { res.status(500).json({ message: e.message }); }
  });

  router.get(`${basePath}/:id`, async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json(doc);
    } catch (e) { res.status(500).json({ message: e.message }); }
  });

  router.post(basePath, async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json(doc);
    } catch (e) { res.status(400).json({ message: e.message }); }
  });

  router.put(`${basePath}/:id`, async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true
      });
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json(doc);
    } catch (e) { res.status(400).json({ message: e.message }); }
  });

  router.delete(`${basePath}/:id`, async (req, res) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
  });
}

// ============================================================
// CONTENT BANKS
// ============================================================
buildCrud('/dsa', DsaProblem, { listSort: { order: 1 } });
buildCrud('/sql', SqlLesson, { listSort: { lessonNumber: 1 } });
buildCrud('/theory', TheoryQuestion, { listSort: { section: 1, topic: 1 } });
buildCrud('/aptitude', AptitudeQuestion, { listSort: { section: 1, topic: 1 } });
buildCrud('/hr', HrQuestion, { listSort: { order: 1 } });

// ============================================================
// COMMENTS MODERATION
// ============================================================
router.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(comments);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/comments/:id', async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Comment not found' });
    res.json({ message: 'Comment removed' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ============================================================
// BULK IMPORT (JSON arrays)
// ============================================================
const bulkTargets = {
  dsa: DsaProblem,
  sql: SqlLesson,
  theory: TheoryQuestion,
  aptitude: AptitudeQuestion,
  hr: HrQuestion
};

router.post('/bulk-import/:bank', async (req, res) => {
  try {
    const Model = bulkTargets[req.params.bank];
    if (!Model) return res.status(400).json({ message: 'Unknown bank' });
    const items = Array.isArray(req.body) ? req.body : req.body.items;
    if (!Array.isArray(items)) return res.status(400).json({ message: 'Body must be an array or { items: [...] }' });
    const inserted = await Model.insertMany(items, { ordered: false });
    res.status(201).json({ inserted: inserted.length });
  } catch (e) {
    res.status(400).json({ message: e.message, inserted: e.insertedDocs?.length || 0 });
  }
});

export default router;
