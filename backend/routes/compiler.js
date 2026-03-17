import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.resolve(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

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
    return res.status(500).json({ isError: true, output: `Failed to create source file: ${err.message}` });
  }

  // Step 1: Compile
  const compileCmd = `javac "${filePath}"`;
  
  exec(compileCmd, { timeout: 5000 }, (compileError, compileStdout, compileStderr) => {
    if (compileError) {
      // Cleanup on compilation failure
      try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch (e) {}
      
      const errorMsg = compileStderr || compileStdout || compileError.message;
      return res.json({ 
        isError: true, 
        output: `Compilation Error:\n${errorMsg}\n\nCommand: ${compileCmd}` 
      });
    }

    // Step 2: Execute
    const runCmd = `java -cp "${sessionDir}" Main`;
    exec(runCmd, { timeout: 5000 }, (runError, runStdout, runStderr) => {
      // Cleanup after execution
      try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch (e) {}

      if (runError) {
        const errorMsg = runStderr || runStdout || runError.message;
        return res.json({ 
          isError: true, 
          output: `Runtime Error:\n${errorMsg}\n\nCommand: ${runCmd}` 
        });
      }

      // Success
      res.json({ isError: false, output: runStdout });
    });
  });
});

// @route   GET /api/compiler/debug
// @desc    Check environment dependencies
router.get('/debug', (req, res) => {
  const diagnostics = {};
  exec('javac -version', (e1, so1, se1) => {
    diagnostics.javac_version = { error: e1?.message, stdout: so1, stderr: se1 };
    exec('which javac', (e2, so2, se2) => {
      diagnostics.javac_path = { error: e2?.message, stdout: so2, stderr: se2 };
      exec('java -version', (e3, so3, se3) => {
        diagnostics.java_version = { error: e3?.message, stdout: so3, stderr: se3 };
        res.json({
          ...diagnostics,
          tempDir,
          tempDirExists: fs.existsSync(tempDir),
          nodeVersion: process.version,
          platform: process.platform,
          envPath: process.env.PATH,
          cwd: process.cwd(),
          uid: process.getuid ? process.getuid() : 'n/a'
        });
      });
    });
  });
});

export default router;
