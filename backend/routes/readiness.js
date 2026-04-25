import express from 'express';
import SqlLesson from '../models/SqlLesson.js';
import DsaProblem from '../models/DsaProblem.js';
import HrQuestion from '../models/HrQuestion.js';
import TestResult from '../models/TestResult.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/readiness — composite placement-readiness score for the current user
// Components (each 0-100, then weighted):
//   SQL     : completedLessons / totalSqlLessons
//   Aptitude: correct / attempted * 100  (requires >= 10 attempts for full weight)
//   Theory  : correct / attempted * 100  (requires >= 10 attempts for full weight)
//   DSA     : solvedProblems / totalDsaProblems
//   HR      : distinct practiced / 15
//   Java50  : completedDays / 50
//   Mocks   : avg of best 3 mock test percentages
//
// Weights (sum to 100):
//   Aptitude 22, DSA 22, Mocks 15, SQL 12, Theory 12, HR 8, Java 9
router.get('/', protect, async (req, res) => {
  try {
    const user = req.user;
    const [totalSql, totalDsa, totalHr] = await Promise.all([
      SqlLesson.countDocuments(),
      DsaProblem.countDocuments(),
      HrQuestion.countDocuments()
    ]);

    const sqlPct = totalSql
      ? Math.min(100, Math.round(((user.sqlProgress?.completedLessons?.length || 0) / totalSql) * 100))
      : 0;

    const attempted = user.aptitudeProgress?.totalAttempted || 0;
    const correct = user.aptitudeProgress?.totalCorrect || 0;
    const rawAccuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
    // Require at least 10 attempts for the accuracy to "count" at full weight. Below that, scale down.
    const confidence = Math.min(1, attempted / 10);
    const aptitudePct = Math.round(rawAccuracy * confidence);

    const theoryAttempted = user.theoryProgress?.totalAttempted || 0;
    const theoryCorrect = user.theoryProgress?.totalCorrect || 0;
    const theoryRaw = theoryAttempted ? Math.round((theoryCorrect / theoryAttempted) * 100) : 0;
    const theoryConfidence = Math.min(1, theoryAttempted / 10);
    const theoryPct = Math.round(theoryRaw * theoryConfidence);

    const dsaPct = totalDsa
      ? Math.min(100, Math.round(((user.dsaProgress?.solvedProblems?.length || 0) / totalDsa) * 100))
      : 0;

    const hrDistinct = user.hrPractice
      ? new Set(user.hrPractice.map((h) => String(h.questionId))).size
      : 0;
    const hrPct = totalHr ? Math.min(100, Math.round((hrDistinct / totalHr) * 100)) : 0;

    const javaPct = Math.min(100, Math.round(((user.completedDays?.length || 0) / 50) * 100));

    // Mocks: average of the user's best 3 mock-test percentages.
    // Below 3 attempts, scale by attempts/3 so a single 90% attempt doesn't dominate.
    const mockResults = await TestResult
      .find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('mcqScore totalQuestions');
    const mockPercentages = mockResults
      .filter((r) => r.totalQuestions > 0)
      .map((r) => Math.round((r.mcqScore / r.totalQuestions) * 100))
      .sort((a, b) => b - a);
    let mockPct = 0;
    if (mockPercentages.length > 0) {
      const top = mockPercentages.slice(0, 3);
      const avg = top.reduce((s, v) => s + v, 0) / top.length;
      const confidence = Math.min(1, mockPercentages.length / 3);
      mockPct = Math.round(avg * confidence);
    }

    const weights = {
      aptitude: 22,
      dsa: 22,
      mocks: 15,
      sql: 12,
      theory: 12,
      java: 9,
      hr: 8
    };

    const composite = Math.round(
      (aptitudePct * weights.aptitude +
        sqlPct * weights.sql +
        theoryPct * weights.theory +
        dsaPct * weights.dsa +
        hrPct * weights.hr +
        javaPct * weights.java +
        mockPct * weights.mocks) / 100
    );

    // Tier buckets
    let tier;
    if (composite >= 75) tier = { label: 'Placement Ready', color: 'emerald', message: 'You meet placement benchmarks across all tracks. Keep practicing company-specific mocks.' };
    else if (composite >= 50) tier = { label: 'Interview Prep', color: 'amber', message: 'You have a solid base. Focus on your weakest tracks and increase DSA/Aptitude depth.' };
    else if (composite >= 25) tier = { label: 'Building Foundations', color: 'orange', message: 'You have started. Prioritise DSA problem count and Aptitude sessions to level up quickly.' };
    else tier = { label: 'Getting Started', color: 'slate', message: 'Begin with one track per week. SQL and Aptitude offer the fastest early wins.' };

    // Identify weakest component to highlight a single next action
    const components = [
      { key: 'aptitude', label: 'Aptitude', pct: aptitudePct, weight: weights.aptitude, nextStep: 'Do a 15-question sectional at /aptitude.' },
      { key: 'dsa', label: 'DSA', pct: dsaPct, weight: weights.dsa, nextStep: 'Solve the next arrays/strings problem at /dsa.' },
      { key: 'mocks', label: 'Mocks', pct: mockPct, weight: weights.mocks, nextStep: 'Take a TCS / Infosys / Wipro mock at /assessments.' },
      { key: 'sql', label: 'SQL & DBMS', pct: sqlPct, weight: weights.sql, nextStep: 'Complete the next SQL lesson at /sql.' },
      { key: 'theory', label: 'CS Core', pct: theoryPct, weight: weights.theory, nextStep: 'Drill 10 OS/CN/OOP MCQs at /theory.' },
      { key: 'java', label: 'Java 50', pct: javaPct, weight: weights.java, nextStep: 'Continue the Java 50 curriculum from the dashboard.' },
      { key: 'hr', label: 'HR Prep', pct: hrPct, weight: weights.hr, nextStep: 'Practice one HR question with AI feedback at /hr.' }
    ];
    const weakest = components
      .filter((c) => c.pct < 90)
      .sort((a, b) => (a.pct / 100) - (b.pct / 100))[0] || components[0];

    res.json({
      composite,
      tier,
      components,
      weakest,
      totals: { totalSql, totalDsa, totalHr, totalJava: 50, hrDistinctPracticed: hrDistinct }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
