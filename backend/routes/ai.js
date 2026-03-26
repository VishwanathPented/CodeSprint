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
  
  const { message, dayTopic, dayNumber, rubberDuckMode } = req.body;
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

    let systemPrompt = `
      You are "Sprint-AI", a world-class Java Professor for the "CodeSprint 50" challenge.
      The student is currently on Day ${dayNumber}: ${dayTopic}.
      
      STRICT RULES:
      1. NEVER provide the full solution or complete code blocks.
      2. Analyze the student's question and provide a LOGICAL HINT or an ANALOGY.
      3. If they ask for code, say: "I can't give you the code, but I can help you think through the logic!"
      4. Keep responses concise and encouraging.
      5. Use Markdown for formatting.
    `;

    if (rubberDuckMode) {
      systemPrompt = `
        You are "Sprint-AI", currently operating in "Rubber Duck Debugging Mode".
        The student is on Day ${dayNumber}: ${dayTopic}.

        STRICT RUBBER DUCK RULES:
        1. YOU MUST NEVER GIVE THE ANSWER, DIRECT HINTS, OR CODE.
        2. Your ONLY job is to ask the student Socratic questions that force them to explain their own logic.
        3. If they share code, ask them to explain line-by-line what it does.
        4. Keep responses extremely short, punchy, and inquisitive (1-2 sentences). You are a highly inquisitive rubber duck.
        5. Use Markdown.
      `;
    }

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

// @route   POST /api/ai/grade-code
// @desc    Evaluate raw incoming text code via AI
router.post('/grade-code', protect, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ message: 'AI Grader is not configured.' });

  const { code, dayNumber, dayTopic, problemDescription } = req.body;

  if (!code || code.trim().length === 0) {
    return res.status(400).json({ message: 'No code provided to the grader.' });
  }

  try {
    const truncatedCode = code.substring(0, 10000);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemPrompt = `
      You are an Automated AI Grader for the "CodeSprint 50" Java course.
      The student submitted code for Day ${dayNumber}: ${dayTopic}.
      Problem Description: ${problemDescription}
      
      STUDENT CODE (RAW):
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
    
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedObj = JSON.parse(responseText);

    res.json({
      passed: parsedObj.passed,
      feedback: parsedObj.feedback,
      rawUrl: 'in-browser-editor'
    });

  } catch (error) {
    console.error('AI Grader Error:', error);
    res.status(500).json({ 
      message: 'The AI Evaluator encountered an error validating your code.'
    });
  }
});

// @route   POST /api/ai/grade-refactor
// @desc    Fetch raw code from Github and evaluate it purely on Clean Code principles
router.post('/grade-refactor', protect, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ message: 'AI Grader is not configured.' });

  const { githubUrl, targetTopic, refactorDescription, messyCode } = req.body;

  if (!githubUrl || !githubUrl.includes('github.com') || !githubUrl.includes('/blob/')) {
    return res.status(400).json({ message: 'Please provide a valid GitHub direct file link containing "/blob/".' });
  }

  let rawUrl = githubUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');

  try {
    const githubRes = await fetch(rawUrl);
    if (!githubRes.ok) return res.status(400).json({ message: 'Could not fetch code. Is repo public?' });
    
    const codeContent = await githubRes.text();
    const truncatedCode = codeContent.substring(0, 5000); 

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemPrompt = `
      You are a strict, senior Java engineer conducting a Code Review. 
      The student was tasked with cleaning up this exact messy code:
      
      MESSY CODE:
      \`\`\`java
      ${messyCode}
      \`\`\`
      
      GOAL: ${refactorDescription}
      
      STUDENT'S REFACTORED CODE:
      \`\`\`java
      ${truncatedCode}
      \`\`\`
      
      Evaluate their refactor. Have they improved variable names? Did they follow DRY principles? Is it readable? 
      If it is fundamentally identical to the messy code, fail them. If it is significantly cleaner, pass them.
      
      Respond strictly in JSON format without markdown wrappers:
      {
        "passed": true|false,
        "feedback": "Max 2 sentence code review feedback on their styling/readability."
      }
    `;

    const result = await model.generateContent(systemPrompt);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsedObj = JSON.parse(responseText);

    res.json({
      passed: parsedObj.passed,
      feedback: parsedObj.feedback,
      rawUrl
    });

  } catch (error) {
    console.error('AI Refactor Error:', error);
    res.status(500).json({ message: 'Error evaluating refactor.' });
  }
});

// @route   POST /api/ai/eli5
// @desc    Rewrite complex explanations into simple analogies
router.post('/eli5', protect, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ message: 'AI is not configured.' });

  const { topicTitle, description } = req.body;
  if (!topicTitle || !description) return res.status(400).json({ message: 'Missing content to simplify.' });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemPrompt = `
      You are the beloved Sprint-AI Tutor. 
      The student is confused by the following academic computer science concept:
      
      TOPIC: ${topicTitle}
      TEXTBOOK TEXT: ${description}
      
      Rewrite this explanation using an extremely simple, beginner-friendly everyday analogy. 
      (Explain it like I am 5). 
      Use Markdown formatting (bolding, bullet points). Keep your explanation engaging, concise, and fun.
    `;

    const result = await model.generateContent(systemPrompt);
    res.json({ simplifiedText: result.response.text() });

  } catch (error) {
    console.error('ELI5 Error:', error);
    res.status(500).json({ message: 'AI failed to simplify. Please try again.' });
  }
});

export default router;
