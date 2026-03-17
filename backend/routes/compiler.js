import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @route   POST /api/compiler/execute
// @desc    Compile and execute Java code
router.post('/execute', (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ isError: true, output: "No code provided." });
  }

    const sessionId = Math.random().toString(36).substring(7);
    const sessionDir = path.join(tempDir, sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir);
    }

    const filePath = path.join(sessionDir, 'Main.java');
    
    try {
      fs.writeFileSync(filePath, code);
    } catch (err) {
      return res.status(500).json({ isError: true, output: "Failed to create source file." });
    }

    // Compile and run the Java file
    const compileCmd = `javac "${filePath}"`;
    const runCmd = `java -cp "${sessionDir}" Main`;

    exec(`${compileCmd} && ${runCmd}`, { timeout: 5000 }, (error, stdout, stderr) => {
      // Cleanup the session directory
      try {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      } catch (e) {
        console.error('Cleanup error:', e);
      }

      if (error) {
        // Return compilation or execution error
        const detailedError = stderr || stdout || error.message;
        return res.json({ isError: true, output: detailedError });
      }
    
    // Return standard output
    res.json({ isError: false, output: stdout });
  });
});

// @route   GET /api/compiler/debug
// @desc    Check environment dependencies
router.get('/debug', (req, res) => {
  exec('javac -version && java -version', (error, stdout, stderr) => {
    res.json({
      error: error ? error.message : null,
      stdout,
      stderr,
      tempDirExists: fs.existsSync(path.join(__dirname, '../temp')),
      nodeVersion: process.version,
      platform: process.platform
    });
  });
});

export default router;
