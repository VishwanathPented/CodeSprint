import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Note: Ensure GEMINI_API_KEY is in your .env

// @route   POST /api/ai/tutor
// @desc    Get a pedagogical hint from the AI Tutor
router.post('/tutor', protect, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      message: 'AI Tutor is not configured. (Missing GEMINI_API_KEY on server)' 
    });
  }
  
  const { message, dayTopic, dayNumber } = req.body;
  const user = await User.findById(req.user._id);

  // 1. Check Rate Limit (5 per day)
  const now = new Date();
  const lastReset = new Date(user.aiUsage.lastReset);
  
  // Reset if it's a new day
  if (now.toDateString() !== lastReset.toDateString()) {
    user.aiUsage.count = 0;
    user.aiUsage.lastReset = now;
  }

  if (user.aiUsage.count >= 5 && !user.isSubscribed) {
    return res.status(429).json({ 
      message: 'Daily AI limit reached (5/5). Upgrade to Premium for unlimited tutor access!' 
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemPrompt = `
      You are "Sprint-AI", a world-class Java Professor for the "CodeSprint 50" challenge.
      The student is currently on Day ${dayNumber}: ${dayTopic}.
      
      STRICT RULES:
      1. NEVER provide the full solution or complete code blocks.
      2. Analyze the student's question and provide a LOGICAL HINT or an ANALOGY.
      3. If they ask for code, say: "I can't give you the code, but I can help you think through the logic!"
      4. Keep responses concise and encouraging.
      5. Use Markdown for formatting.
    `;

    const result = await model.generateContent([systemPrompt, message]);
    const responseText = result.response.text();

    // Increment usage
    user.aiUsage.count += 1;
    await user.save();

    res.json({ 
      reply: responseText,
      usageCount: user.aiUsage.count 
    });

  } catch (error) {
    console.error('AI Tutor Error:', error);
    
    let userMessage = 'The AI Tutor is currently over capacity. Try again in a moment.';
    if (error.message?.includes('429')) {
      userMessage = 'AI Daily Limit Reached (Server Side). Your API key has run out of free requests for today. Try again tomorrow or check your Google AI Studio quota.';
    } else if (error.message?.includes('404')) {
      userMessage = 'Model configuration error. Please contact the administrator.';
    }

    res.status(500).json({ 
      message: `AI Tutor Error: ${userMessage}` 
    });
  }
});

export default router;
