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

  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const filePath = path.join(tempDir, 'Main.java');
  
  try {
    fs.writeFileSync(filePath, code);
  } catch (err) {
    return res.status(500).json({ isError: true, output: "Failed to create temp file for compilation." });
  }

  // Compile and run the Java file
  // Wait up to 5 seconds to prevent infinite loops from hanging the server
  exec(`javac "${filePath}" && java -cp "${tempDir}" Main`, { timeout: 5000 }, (error, stdout, stderr) => {
    // Optional: Cleanup the files after execution to save space
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      const classPath = path.join(tempDir, 'Main.class');
      if (fs.existsSync(classPath)) fs.unlinkSync(classPath);
    } catch (e) {
      console.error('Cleanup error:', e);
    }

    if (error) {
      // Return compilation or execution error
      const errorMsg = stderr || stdout || error.message;
      return res.json({ isError: true, output: errorMsg });
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
