import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = {
  primary: [79, 70, 229],     // indigo-600
  primaryLight: [238, 242, 255],
  success: [16, 185, 129],    // emerald-500
  warning: [245, 158, 11],    // amber-500
  danger: [239, 68, 68],      // red-500
  text: [15, 23, 42],         // slate-900
  muted: [100, 116, 139],     // slate-500
  rule: [226, 232, 240]       // slate-200
};

const DSA_TOPICS = ['arrays', 'strings', 'linked-list', 'stack-queue', 'hashing', 'recursion-trees'];

const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';
const pct = (correct, attempted) => attempted > 0 ? Math.round((correct / attempted) * 100) : null;
const pctLabel = (correct, attempted) => attempted > 0 ? `${pct(correct, attempted)}% (${correct}/${attempted})` : '— not attempted —';

const ratingFor = (accuracy) => {
  if (accuracy === null) return { label: 'Not Started', color: COLORS.muted };
  if (accuracy >= 80) return { label: 'Strong', color: COLORS.success };
  if (accuracy >= 60) return { label: 'On Track', color: COLORS.primary };
  if (accuracy >= 40) return { label: 'Needs Work', color: COLORS.warning };
  return { label: 'Weak', color: COLORS.danger };
};

/**
 * Generate a student progress PDF.
 *
 * @param {Object} user — user record with progress data
 * @param {Object} [opts]
 * @param {boolean} [opts.returnBlob=false] — if true, returns a Blob instead of triggering a download
 * @returns {Blob|undefined}
 */
export function generateStudentReportPdf(user, opts = {}) {
  const { returnBlob = false } = opts;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  let cursor = margin;

  // ==================== HEADER ====================
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 90, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CodeSprint Progress Report', margin, 38);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated ${new Date().toLocaleString()}`, margin, 58);
  doc.text(`Report ID: ${user._id?.slice(-8) || 'N/A'}`, margin, 74);
  cursor = 110;

  // ==================== STUDENT DETAILS ====================
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(user.name || 'Unnamed Student', margin, cursor);
  cursor += 18;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.muted);

  const details = [
    ['Email', user.email || '—'],
    ['USN', user.registrationDetails?.usn || '—'],
    ['Branch', user.registrationDetails?.branch || '—'],
    ['Year', user.registrationDetails?.year || '—'],
    ['Phone', user.registrationDetails?.phoneNumber || '—'],
    ['GitHub Repo', user.githubRepo || '— not linked —'],
    ['Joined', fmtDate(user.createdAt)],
    ['Subscription', user.isSubscribed ? 'Premium (active)' : 'Free tier'],
  ];

  autoTable(doc, {
    startY: cursor,
    theme: 'plain',
    body: details,
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: COLORS.text, cellWidth: 90 },
      1: { textColor: COLORS.muted }
    },
    margin: { left: margin, right: margin }
  });
  cursor = doc.lastAutoTable.finalY + 18;

  // ==================== HEADLINE METRICS ====================
  cursor = sectionTitle(doc, 'Overall Progress', cursor, margin);

  const completed = user.completedDays?.length || 0;
  const totalDays = 50;
  const completionPct = Math.round((completed / totalDays) * 100);

  const headlineCards = [
    { label: 'Current Day', value: `Day ${user.currentDay || 1}` },
    { label: 'Days Completed', value: `${completed} / ${totalDays}` },
    { label: 'Curriculum %', value: `${completionPct}%` },
    { label: 'Current Streak', value: `${user.streak || 0} 🔥` },
    { label: 'Longest Streak', value: `${user.longestStreak || 0}` },
    { label: 'Last Active', value: fmtDate(user.lastActiveDate) },
  ];

  const cardW = (pageWidth - margin * 2 - 10) / 3;
  const cardH = 50;
  headlineCards.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = margin + col * (cardW + 5);
    const y = cursor + row * (cardH + 5);
    doc.setFillColor(...COLORS.primaryLight);
    doc.roundedRect(x, y, cardW, cardH, 4, 4, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.setFont('helvetica', 'bold');
    doc.text(c.label.toUpperCase(), x + 10, y + 16);
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.text);
    doc.text(String(c.value), x + 10, y + 36);
  });
  cursor += Math.ceil(headlineCards.length / 3) * (cardH + 5) + 18;

  // ==================== APTITUDE TRACK ====================
  cursor = renderQuestionTrack(doc, {
    title: 'Aptitude Track',
    cursor, margin,
    progress: user.aptitudeProgress,
    sectionLabels: { quantitative: 'Quantitative', logical: 'Logical', verbal: 'Verbal' }
  });

  // ==================== THEORY TRACK ====================
  cursor = renderQuestionTrack(doc, {
    title: 'CS Theory Track',
    cursor, margin,
    progress: user.theoryProgress,
    sectionLabels: { os: 'Operating Systems', networks: 'Networks', oop: 'OOP' }
  });

  // ==================== SQL TRACK ====================
  cursor = ensureSpace(doc, cursor, 100, margin);
  cursor = sectionTitle(doc, 'SQL Track', cursor, margin);
  const sql = user.sqlProgress || {};
  const sqlCompleted = sql.completedLessons?.length || 0;
  const sqlScores = sql.scores || [];
  const avgQueriesPct = sqlScores.length > 0
    ? Math.round(sqlScores.reduce((a, s) => a + (s.totalQueries > 0 ? (s.queriesSolved / s.totalQueries) : 0), 0) / sqlScores.length * 100)
    : null;

  autoTable(doc, {
    startY: cursor,
    theme: 'striped',
    head: [['Metric', 'Value']],
    body: [
      ['Lessons Completed', sqlCompleted],
      ['Current Lesson', sql.currentLesson || 1],
      ['Average Query Accuracy', avgQueriesPct !== null ? `${avgQueriesPct}%` : '— no submissions —'],
    ],
    headStyles: { fillColor: COLORS.primary, textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: margin, right: margin }
  });
  cursor = doc.lastAutoTable.finalY + 18;

  // ==================== DSA TRACK ====================
  cursor = ensureSpace(doc, cursor, 140, margin);
  cursor = sectionTitle(doc, 'DSA Track', cursor, margin);
  const dsa = user.dsaProgress || {};
  const totalSolved = dsa.solvedProblems?.length || 0;

  autoTable(doc, {
    startY: cursor,
    theme: 'striped',
    head: [['Topic', 'Problems Solved', 'Status']],
    body: DSA_TOPICS.map(t => {
      const solved = dsa.topicStats?.[t]?.solved || 0;
      let status = 'Not started';
      if (solved >= 5) status = 'Strong';
      else if (solved >= 3) status = 'On Track';
      else if (solved >= 1) status = 'Just Starting';
      return [t, solved, status];
    }).concat([['TOTAL', totalSolved, '']]),
    headStyles: { fillColor: COLORS.primary, textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: margin, right: margin }
  });
  cursor = doc.lastAutoTable.finalY + 18;

  // ==================== HR PRACTICE ====================
  cursor = ensureSpace(doc, cursor, 80, margin);
  cursor = sectionTitle(doc, 'HR Interview Prep', cursor, margin);
  const hr = user.hrPractice || [];
  const avgHr = hr.length > 0
    ? Math.round(hr.reduce((a, p) => a + (p.score || 0), 0) / hr.length)
    : null;

  autoTable(doc, {
    startY: cursor,
    theme: 'striped',
    head: [['Metric', 'Value']],
    body: [
      ['Questions Practiced', hr.length],
      ['Average AI Score', avgHr !== null ? `${avgHr} / 100` : '— no practice yet —'],
      ['Last Practiced', hr.length > 0 ? fmtDate(hr.at(-1).practicedAt) : '—'],
    ],
    headStyles: { fillColor: COLORS.primary, textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: margin, right: margin }
  });
  cursor = doc.lastAutoTable.finalY + 18;

  // ==================== AREAS TO IMPROVE ====================
  cursor = ensureSpace(doc, cursor, 200, margin);
  cursor = sectionTitle(doc, 'Areas to Improve', cursor, margin);

  const insights = buildInsights(user);
  if (insights.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.muted);
    doc.text('No critical weak areas detected. Keep up the consistency!', margin, cursor);
    cursor += 16;
  } else {
    autoTable(doc, {
      startY: cursor,
      theme: 'plain',
      head: [['Priority', 'Area', 'Recommendation']],
      body: insights.map(i => [i.priority, i.area, i.recommendation]),
      headStyles: { fillColor: COLORS.primary, textColor: 255, fontStyle: 'bold', fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 6, valign: 'top' },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 130, fontStyle: 'bold' },
        2: { cellWidth: 'auto' }
      },
      didParseCell: (data) => {
        if (data.column.index === 0 && data.section === 'body') {
          if (data.cell.raw === 'HIGH') data.cell.styles.textColor = COLORS.danger;
          else if (data.cell.raw === 'MEDIUM') data.cell.styles.textColor = COLORS.warning;
          else data.cell.styles.textColor = COLORS.muted;
        }
      },
      margin: { left: margin, right: margin }
    });
    cursor = doc.lastAutoTable.finalY + 18;
  }

  // ==================== FOOTER ====================
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `CodeSprint • Confidential progress report for ${user.name}`,
      margin,
      pageHeight - 18
    );
    doc.text(`Page ${p} of ${pageCount}`, pageWidth - margin, pageHeight - 18, { align: 'right' });
  }

  const safeName = (user.name || 'student').replace(/[^a-z0-9]+/gi, '_');
  const dateTag = new Date().toISOString().split('T')[0];
  const filename = `CodeSprint_Report_${safeName}_${dateTag}.pdf`;

  if (returnBlob) {
    return { blob: doc.output('blob'), filename };
  }
  doc.save(filename);
}

// ==================== HELPERS ====================

function sectionTitle(doc, text, cursor, margin) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  doc.text(text, margin, cursor);
  doc.setDrawColor(...COLORS.rule);
  doc.setLineWidth(0.5);
  doc.line(margin, cursor + 4, doc.internal.pageSize.getWidth() - margin, cursor + 4);
  return cursor + 18;
}

function ensureSpace(doc, cursor, needed, margin) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (cursor + needed > pageHeight - margin) {
    doc.addPage();
    return margin;
  }
  return cursor;
}

function renderQuestionTrack(doc, { title, cursor, margin, progress, sectionLabels }) {
  cursor = ensureSpace(doc, cursor, 140, margin);
  cursor = sectionTitle(doc, title, cursor, margin);

  if (!progress || (!progress.totalAttempted && !progress.sessionsCompleted)) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.muted);
    doc.text('Not yet started.', margin, cursor);
    return cursor + 20;
  }

  const overallPct = pct(progress.totalCorrect, progress.totalAttempted);
  const overallRating = ratingFor(overallPct);

  const summaryRows = [
    ['Sessions Completed', progress.sessionsCompleted || 0],
    ['Total Questions Attempted', progress.totalAttempted || 0],
    ['Correct Answers', progress.totalCorrect || 0],
    ['Overall Accuracy', overallPct !== null ? `${overallPct}%` : '—'],
    ['Best Session Accuracy', `${progress.bestSessionAccuracy || 0}%`],
    ['Performance', overallRating.label],
  ];

  autoTable(doc, {
    startY: cursor,
    theme: 'striped',
    head: [['Metric', 'Value']],
    body: summaryRows,
    headStyles: { fillColor: COLORS.primary, textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: margin, right: margin }
  });
  cursor = doc.lastAutoTable.finalY + 10;

  // Section breakdown
  const sectionRows = Object.entries(sectionLabels).map(([key, label]) => {
    const stats = progress.sectionStats?.[key] || {};
    const accuracy = pct(stats.correct, stats.attempted);
    return [label, pctLabel(stats.correct || 0, stats.attempted || 0), ratingFor(accuracy).label];
  });

  autoTable(doc, {
    startY: cursor,
    theme: 'striped',
    head: [['Section', 'Performance', 'Rating']],
    body: sectionRows,
    headStyles: { fillColor: COLORS.primary, textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: margin, right: margin }
  });
  return doc.lastAutoTable.finalY + 18;
}

function buildInsights(user) {
  const insights = [];

  // Streak / engagement
  if ((user.streak || 0) === 0 && (user.completedDays?.length || 0) > 0) {
    insights.push({
      priority: 'MEDIUM',
      area: 'Daily Consistency',
      recommendation: 'Streak is broken. Encourage daily check-ins — even 15 minutes/day rebuilds momentum.'
    });
  }

  // Curriculum lag
  if ((user.currentDay || 1) <= 5 && new Date(user.createdAt) < new Date(Date.now() - 14 * 86400000)) {
    insights.push({
      priority: 'HIGH',
      area: 'Curriculum Pace',
      recommendation: 'Joined over 2 weeks ago but still on early days. Schedule a 1:1 to identify blockers.'
    });
  }

  // Aptitude weak sections
  if (user.aptitudeProgress?.totalAttempted > 20) {
    Object.entries(user.aptitudeProgress.sectionStats || {}).forEach(([k, s]) => {
      const acc = pct(s.correct, s.attempted);
      if (acc !== null && acc < 50 && s.attempted >= 5) {
        insights.push({
          priority: 'HIGH',
          area: `Aptitude — ${k}`,
          recommendation: `Only ${acc}% accuracy across ${s.attempted} questions. Recommend focused practice on this section.`
        });
      }
    });
  } else {
    insights.push({
      priority: 'MEDIUM',
      area: 'Aptitude Volume',
      recommendation: 'Fewer than 20 aptitude questions attempted. Aim for at least 10 questions per day.'
    });
  }

  // Theory weak sections
  if (user.theoryProgress?.totalAttempted > 20) {
    Object.entries(user.theoryProgress.sectionStats || {}).forEach(([k, s]) => {
      const acc = pct(s.correct, s.attempted);
      if (acc !== null && acc < 50 && s.attempted >= 5) {
        insights.push({
          priority: 'HIGH',
          area: `Theory — ${k.toUpperCase()}`,
          recommendation: `Below 50% on ${s.attempted} attempted questions. Revisit the concept lessons before more practice.`
        });
      }
    });
  } else {
    insights.push({
      priority: 'MEDIUM',
      area: 'CS Fundamentals Volume',
      recommendation: 'Limited theory practice. OS, Networks, OOP are common interview topics — recommend daily practice.'
    });
  }

  // DSA gaps
  const dsa = user.dsaProgress || {};
  const untouched = DSA_TOPICS.filter(t => (dsa.topicStats?.[t]?.solved || 0) === 0);
  if (untouched.length >= 3) {
    insights.push({
      priority: 'HIGH',
      area: 'DSA Coverage',
      recommendation: `${untouched.length} topics untouched: ${untouched.join(', ')}. Recommend at least 2 problems per topic.`
    });
  } else if (untouched.length > 0) {
    insights.push({
      priority: 'MEDIUM',
      area: 'DSA Coverage',
      recommendation: `Topics not yet attempted: ${untouched.join(', ')}.`
    });
  }

  // HR readiness
  if ((user.hrPractice?.length || 0) < 5) {
    insights.push({
      priority: 'MEDIUM',
      area: 'HR Interview Prep',
      recommendation: 'Fewer than 5 HR questions practiced. Schedule mock HR sessions before placement drives.'
    });
  }

  // SQL
  if ((user.sqlProgress?.completedLessons?.length || 0) < 3 && (user.currentDay || 1) > 10) {
    insights.push({
      priority: 'MEDIUM',
      area: 'SQL Track',
      recommendation: 'SQL track has barely been touched despite curriculum progress. Most companies test SQL in placement rounds.'
    });
  }

  // GitHub
  if (!user.githubRepo) {
    insights.push({
      priority: 'LOW',
      area: 'GitHub Portfolio',
      recommendation: 'No GitHub repo linked. Encourage student to create the 50-day repo to showcase progress.'
    });
  }

  // Sort by priority
  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  insights.sort((a, b) => order[a.priority] - order[b.priority]);
  return insights;
}
