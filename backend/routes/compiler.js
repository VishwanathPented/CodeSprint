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

router.post('/execute', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ isError: true, output: "No code provided." });
  }

  // Cloud Fallback: Use Judge0 if API key is provided
  if (process.env.JUDGE0_API_KEY) {
    try {
      const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        body: JSON.stringify({
          language_id: 62, // Java (OpenJDK 13.0.1)
          source_code: code
        })
      });
      const data = await response.json();

      if (data.compile_output) {
        return res.json({ isError: true, output: data.compile_output });
      }
      return res.json({ isError: false, output: data.stdout || data.stderr || "Program executed successfully." });
    } catch (e) {
      return res.json({ isError: true, output: "Cloud Execution failed: " + e.message });
    }
  }

  const sessionId = Math.random().toString(36).substring(7);
  const sessionDir = path.join(tempDir, sessionId);
  
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir);
  }

  const filePath = path.join(sessionDir, 'Main.java');
  
  try {
    fs.writeFileSync(filePath, code);
    // Verify file was actually written
    if (!fs.existsSync(filePath)) {
      throw new Error("File was not created on disk.");
    }
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      throw new Error("File was created but is empty.");
    }
  } catch (err) {
    return res.status(500).json({ isError: true, output: `FS Error: ${err.message}` });
  }

  // Step 1: Compile - Use absolute path and memory limit
  const javacPath = '/usr/bin/javac';
  // -J-Xmx keeps javac internal memory low
  const compileCmd = `${javacPath} -J-Xmx128M "${filePath}"`;
  
  exec(compileCmd, { timeout: 7000 }, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
      
      // Cleanup on compilation failure
      try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch (e) {}

      // Serverless Environment Check (e.g. Vercel/Render without Java)
      if (compileError.code === 'ENOENT' || compileError.signal === 'SIGTERM') {
          return res.json({
              isError: true,
              output: "⚠️ Serverless Environment Warning:\nJava compiler is missing or timed out on this host.\n\nTo enable Cloud Execution in production:\n1. Get a free API key from Judge0 (RapidAPI)\n2. Add it as 'JUDGE0_API_KEY' to your environment variables."
          });
      }

      const dirContents = fs.existsSync(sessionDir) ? fs.readdirSync(sessionDir) : 'Dir missing';
      const fileExists = fs.existsSync(filePath);
      const errorMsg = compileStderr || compileStdout || compileError.message;
      
      const response = {
        isError: true,
        output: `Compilation Error (Code ${compileError.code || 'N/A'}, Signal ${compileError.signal || 'NONE'}):\n${errorMsg}\n\nDEBUG INFO:\n- File Exists: ${fileExists}\n- Folder Contents: ${JSON.stringify(dirContents)}\n- Command Used: ${compileCmd}`
      };
      
      return res.json(response);
    }

    // Step 2: Execute - Use absolute path and memory limit
    const javaPath = '/usr/bin/java';
    const runCmd = `${javaPath} -Xmx128M -cp "${sessionDir}" Main`;
    exec(runCmd, { timeout: 5000 }, (runError, runStdout, runStderr) => {
      // Cleanup after execution
      try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch (e) {}

      if (runError) {
        const errorMsg = runStderr || runStdout || runError.message;
        return res.json({ 
          isError: true, 
          output: `Runtime Error (Code ${runError.code || 'N/A'}, Signal ${runError.signal || 'NONE'}):\n${errorMsg}\n\nCommand: ${runCmd}` 
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
