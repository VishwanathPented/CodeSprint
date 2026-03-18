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

// @route   POST /api/ai/grade-github
// @desc    Fetch raw code from Github and use AI to evaluate it
router.post('/grade-github', protect, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'AI Grader is not configured.' });
  }

  const { githubUrl, dayNumber, dayTopic, problemDescription } = req.body;

  if (!githubUrl || !githubUrl.includes('github.com')) {
    return res.status(400).json({ message: 'Please provide a valid GitHub link.' });
  }

  if (githubUrl.includes('/tree/') || !githubUrl.includes('/blob/')) {
    return res.status(400).json({ 
      message: 'Invalid link. Please click on your specific Java file (e.g., Main.java) in GitHub and paste that exact URL. It should contain "/blob/".' 
    });
  }

  // 1. Convert GitHub blob URL to raw URL
  let rawUrl = githubUrl;
  if (githubUrl.includes('github.com') && githubUrl.includes('/blob/')) {
    rawUrl = githubUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  try {
    // 2. Fetch the code
    const githubRes = await fetch(rawUrl);
    if (!githubRes.ok) {
      return res.status(400).json({ 
        message: 'Could not fetch code. Is your repository Public? Ensure the link points directly to the code file and not a folder.' 
      });
    }
    
    const codeContent = await githubRes.text();
    const truncatedCode = codeContent.substring(0, 10000); // safety limit

    // 3. AI Evaluation
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemPrompt = `
      You are an Automated AI Grader for the "CodeSprint 50" Java course.
      The student submitted code for Day ${dayNumber}: ${dayTopic}.
      Problem Description: ${problemDescription}
      
      STUDENT CODE:
      \`\`\`java
      ${truncatedCode}
      \`\`\`
      
      Evaluate the student's code. It does NOT have to be perfectly compilable, but it MUST be a genuine and reasonable attempt to solve the specific problem described. Empty templates or unrelated code should fail.
      
      Respond strictly in JSON format without any markdown wrapper around the JSON:
      {
        "passed": true|false,
        "feedback": "A maximum 2 sentence feedback explaining what they did well, or why it failed."
      }
    `;

    const result = await model.generateContent(systemPrompt);
    let responseText = result.response.text();
    
    // Clean up markdown block if present
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsedObj = JSON.parse(responseText);

    res.json({
      passed: parsedObj.passed,
      feedback: parsedObj.feedback,
      rawUrl
    });

  } catch (error) {
    console.error('AI Grader Error:', error);
    res.status(500).json({ 
      message: 'The AI Evaluator encountered an error validating your code. Ensure it is a valid text file.'
    });
  }
});

export default router;
