import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HrQuestion from './models/HrQuestion.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codesprint50')
  .then(() => console.log('Connected to MongoDB for HR Seeding'))
  .catch((err) => console.error('MongoDB connection error:', err));

const hrQuestions = [
  {
    order: 1,
    category: 'introduction',
    difficulty: 'Easy',
    question: 'Tell me about yourself.',
    framework: "Present → Past → Future (30-60 seconds)\n\n1. **Present**: Who you are today — name, current year/course.\n2. **Past**: Relevant background — projects, coursework, a signature achievement.\n3. **Future**: Why you're here — what role/skills you want to grow in.",
    sampleAnswer: "I'm Arjun, a final-year Computer Science student at XYZ College. Over the last year, I've focused on full-stack development — I built a student attendance tracker in the MERN stack that's now used by two departments in my college, and I'm in the top 5% of my DSA practice cohort on GeeksforGeeks. Outside academics, I led the coding club's placement prep drive for juniors. I'm excited about this role because it combines real product engineering with mentorship opportunities, both of which I've enjoyed in my own journey.",
    tips: [
      "Keep it under 90 seconds — practice with a timer.",
      "Lead with what's most relevant to THIS role, not your entire life story.",
      "End with a clear forward-looking statement tied to the company."
    ]
  },
  {
    order: 2,
    category: 'strengths',
    difficulty: 'Easy',
    question: 'What is your greatest strength?',
    framework: "Name the strength → Specific example → Outcome\n\nDon't just claim 'I'm a team player'. Prove it with one concrete story.",
    sampleAnswer: "My greatest strength is breaking down complex problems into small shippable pieces. During my internship, I was given a flaky deployment pipeline that nobody on the team wanted to touch. I started by documenting every failure mode I saw in a shared doc, then fixed them one by one over two weeks. By the end, deploy time dropped from 40 minutes to 12 and nightly failures went from weekly to zero. That habit — isolate, document, iterate — is how I approach every ambiguous task.",
    tips: [
      "Pick a strength RELEVANT to the job, not a generic one.",
      "One good story > three vague claims.",
      "Quantify the outcome ('reduced by 40%', 'saved 3 hours/week')."
    ]
  },
  {
    order: 3,
    category: 'strengths',
    difficulty: 'Medium',
    question: 'What is your greatest weakness?',
    framework: "Real weakness → How you're working on it → Proof of progress\n\nAvoid fake weaknesses ('I work too hard'). Interviewers see through them.",
    sampleAnswer: "I used to struggle with public speaking — in my first presentation I went completely blank. I knew I'd need this skill, so I joined the coding club as an event lead and volunteered to MC at least one workshop per month. Over the last year I've presented to groups of 50+ students, and last month I conducted a session on Git workflows that received great feedback. I'm still working on handling technical Q&A confidently, which is why I keep taking every chance to present.",
    tips: [
      "Avoid disguised strengths ('I'm a perfectionist').",
      "Avoid weaknesses that disqualify you ('I can't meet deadlines').",
      "Show active, specific effort to improve."
    ]
  },
  {
    order: 4,
    category: 'career',
    difficulty: 'Medium',
    question: 'Why should we hire you?',
    framework: "Skills match → Unique angle → Enthusiasm\n\nThis is NOT the time to be humble. Be crisp and confident.",
    sampleAnswer: "Three reasons. First, my skills directly match what you need — I have hands-on experience with React, Node, and SQL, which the job description prioritizes. Second, I bring a builder's mindset; I've shipped three full-stack projects independently, so I won't need hand-holding on the basics. Third, I'm genuinely excited by your product — I read the engineering blog post on your caching architecture, and that kind of problem is exactly what I want to work on. I'm ready to contribute from day one and grow fast.",
    tips: [
      "Research the company FIRST — mention one specific thing you admire.",
      "Lead with skills match, not enthusiasm alone.",
      "3 crisp points > 1 long ramble."
    ]
  },
  {
    order: 5,
    category: 'career',
    difficulty: 'Medium',
    question: 'Where do you see yourself in 5 years?',
    framework: "Near-term (1-2 yrs) → Mid-term (3-5 yrs)\n\nShow ambition that aligns with the company's growth path.",
    sampleAnswer: "In the first two years, I want to become someone my team trusts with ownership of entire features — from spec to production. I'd invest heavily in learning system design deeply, and by year three I'd like to be mentoring junior engineers and leading small technical initiatives. By year five, I'd love to grow into a senior engineer role with clear technical depth in one area — probably backend systems, based on what I enjoy most today. Your company's focus on engineering growth paths is exactly why I see this as a long-term home.",
    tips: [
      "NEVER say 'I'll be at a different company' or 'I want your job'.",
      "Balance technical depth with collaboration/leadership.",
      "Tie it back to the company's trajectory."
    ]
  },
  {
    order: 6,
    category: 'career',
    difficulty: 'Medium',
    question: 'Why do you want to work at our company?',
    framework: "Product/mission → Engineering culture → Personal fit\n\nThis is a company research question. Generic answers get filtered out instantly.",
    sampleAnswer: "Three reasons specific to you. First, your product actually solves a real problem — I've been using it personally for six months, and the search experience is noticeably better than competitors. Second, your engineering blog makes it clear you invest in platform quality rather than chasing features blindly; your post on incrementally rolling out TypeScript was exactly the kind of pragmatic engineering I want to learn. Third, your grad program pairs new hires with senior engineers for the first year — that structure matches how I learn best.",
    tips: [
      "Read the company's blog/careers page the NIGHT BEFORE.",
      "Mention something specific you found, not 'you have great culture'.",
      "Three reasons > one generic reason."
    ]
  },
  {
    order: 7,
    category: 'behavioral',
    difficulty: 'Medium',
    question: 'Tell me about a time you faced a challenge at work or in a project.',
    framework: "STAR method:\n- **Situation**: Context\n- **Task**: What you needed to do\n- **Action**: What YOU did (not the team)\n- **Result**: Outcome, ideally quantified",
    sampleAnswer: "In my final-year group project, we were building a real-time chat app and had to integrate WebSockets. Two weeks before demo, our server kept dropping connections under load, and the rest of the team was stuck. I took ownership: I profiled the Node server, found that we were leaking socket listeners on reconnect, and rewrote the connection handler with proper cleanup. I also added a simple stress test that replayed 500 concurrent clients. Post-fix, the server held 1000 connections without drops, and we demoed live to 60 people without a single disconnect. The team now uses that stress test pattern on every backend project.",
    tips: [
      "Use STAR rigorously — interviewers are trained to listen for it.",
      "The Action must be what YOU did. Don't hide in 'we'.",
      "The Result should be MEASURABLE when possible."
    ]
  },
  {
    order: 8,
    category: 'behavioral',
    difficulty: 'Hard',
    question: 'Tell me about a time you disagreed with a team member.',
    framework: "Situation → Disagreement → How you handled it → Resolution\n\nShow emotional maturity. DO NOT badmouth the other person.",
    sampleAnswer: "In a group project, our team lead wanted to build our backend from scratch in Go. I felt strongly that using Express would let us ship faster given the 3-week deadline. Instead of arguing in the meeting, I spent an evening building two proofs-of-concept — one in each — and measured the setup time. I shared the comparison in the next stand-up, highlighting what we'd lose with Express (runtime performance) and what we'd gain (two weeks of dev time). The team, including the lead, agreed to go with Express. We shipped on time, and I think what worked was backing the disagreement with evidence rather than opinion.",
    tips: [
      "Avoid politics, ego, or personality conflicts — pick a PROFESSIONAL disagreement.",
      "Show you used data or reasoning, not just persistence.",
      "The resolution should demonstrate maturity, not 'I won'."
    ]
  },
  {
    order: 9,
    category: 'behavioral',
    difficulty: 'Medium',
    question: 'Tell me about a time you failed.',
    framework: "What happened → What you learned → How you applied the lesson\n\nPick a REAL failure (not a humble-brag). Focus on the learning.",
    sampleAnswer: "In my first hackathon, I insisted on building a feature I'd never attempted — a live collaborative whiteboard — without scoping the complexity. We spent 20 hours of our 30-hour window just trying to sync cursors, and presented a broken demo. We came last. After that I adopted a strict rule: before any new project, I write a 1-page doc with scope, risks, and a 'must-ship' MVP separate from 'nice-to-haves'. I've followed this for every project since, and my last hackathon — where I used this exact approach — we placed second out of 40 teams.",
    tips: [
      "Pick something recent and real — fake failures sound fake.",
      "Don't blame teammates or bad luck.",
      "The LESSON is the point — spend more time on it than the failure."
    ]
  },
  {
    order: 10,
    category: 'behavioral',
    difficulty: 'Medium',
    question: 'Describe a time you had to learn something quickly.',
    framework: "Context → What you had to learn → How → Outcome\n\nShow your learning PROCESS, not just the result.",
    sampleAnswer: "Two weeks before my summer internship I was told the team used Kubernetes, which I'd never touched. I broke it into small chunks: day 1-3 I did the official tutorial. Day 4-7 I deployed a personal side project on a free-tier cluster. Day 8-10 I read the team's runbook and re-deployed their staging service in a sandbox namespace. When I joined, I was able to deploy my first PR on day 3 without asking for help on the k8s side. The key was not reading passively — I forced myself to deploy something every single day, even if small.",
    tips: [
      "Describe a SPECIFIC learning system, not 'I studied hard'.",
      "Mention what you actually produced (deploys, code, docs).",
      "The outcome should be practical and verifiable."
    ]
  },
  {
    order: 11,
    category: 'situational',
    difficulty: 'Hard',
    question: 'What would you do if you were assigned a task with an unrealistic deadline?',
    framework: "Clarify → Prioritize → Communicate → Deliver\n\nThey want to see that you don't panic OR silently overcommit.",
    sampleAnswer: "First I'd break the task into concrete sub-items and honestly estimate each. Then I'd come back with three things: a realistic timeline for the full scope, what I can ship by the original deadline (the must-haves), and what would slip to a week later. I'd bring this to my manager with the trade-offs written clearly so they can choose. In my last semester project this exact situation happened — we were told to ship 5 features in 2 weeks. I proposed shipping 3 in 2 weeks + 2 in week 3; the professor agreed, and we actually beat the revised timeline because we weren't cutting corners under pressure.",
    tips: [
      "Show you ASK QUESTIONS before accepting impossible work.",
      "Propose concrete trade-offs, don't just complain.",
      "End with a real example if you have one."
    ]
  },
  {
    order: 12,
    category: 'situational',
    difficulty: 'Medium',
    question: 'How do you handle stress or pressure?',
    framework: "Acknowledge → Your technique → Evidence it works\n\nDon't say 'I don't feel stress'. Say HOW you function under pressure.",
    sampleAnswer: "When I feel overwhelmed, my first step is to write down everything I'm worried about. Ninety percent of the time the list is shorter than it felt in my head. Then I rank items by deadline and impact, and I block time for the top three only. During exam week last semester I was simultaneously prepping for 4 finals and a placement test; instead of studying reactively, I made a 6-day plan with 3 subjects per day and evening blocks for the placement prep. I scored in the top 10% in 3 of 4 finals and cleared the placement test. The technique is boring — write it down, triage, and protect focused time — but it works consistently for me.",
    tips: [
      "Show a concrete technique, not vague platitudes.",
      "Back it with an example from school/work.",
      "Avoid cliches like 'I thrive under pressure'."
    ]
  },
  {
    order: 13,
    category: 'career',
    difficulty: 'Medium',
    question: 'What are your salary expectations?',
    framework: "Research-backed range → Flexibility → Priority on fit\n\nDo market research before this interview. Never just make up a number.",
    sampleAnswer: "Based on my research on Glassdoor and AmbitionBox for similar software engineer roles in this city, the range for my experience level tends to be between ₹4.5 LPA and ₹6.5 LPA. I'd be looking for something in that range, but honestly my priority right now is finding a place where I can learn rapidly and contribute meaningfully in the first year. If the role is the right fit, I'm flexible on the exact number, and I'm open to hearing what you typically offer at this level.",
    tips: [
      "DO YOUR RESEARCH — Glassdoor, Levels.fyi, AmbitionBox (India).",
      "Give a RANGE, not a single number.",
      "Never say 'whatever you offer' — it signals low confidence."
    ]
  },
  {
    order: 14,
    category: 'closing',
    difficulty: 'Easy',
    question: 'Do you have any questions for us?',
    framework: "Always say YES. Prepare 3 questions. Choose based on how the interview went.\n\nGood categories: role specifics, team culture, growth path.",
    sampleAnswer: "Yes, three questions. First, what does success look like for this role in the first six months? Second, how is technical mentorship structured for new grads on your team — do you pair engineers with seniors? And third, what's one thing about working here that you think is underappreciated or misunderstood from the outside? I'd genuinely value your personal take on that.",
    tips: [
      "ALWAYS have questions ready — 'No, I'm good' is a red flag.",
      "Don't ask about salary/leave/benefits here (save for offer stage).",
      "Prepare 5, ask 2-3 — some will get answered during the interview."
    ]
  },
  {
    order: 15,
    category: 'closing',
    difficulty: 'Medium',
    question: 'Why are you leaving your current job? (or: Why this role over your current one?)',
    framework: "Future-focused → Positive framing → Connection to this role\n\nNEVER badmouth current employer. Even if it's valid.",
    sampleAnswer: "My current internship has been a great learning ground — I shipped real code, worked with a senior engineer, and picked up production habits like writing tests and reviewing PRs. What I'm looking for next is more depth: a full-time role where I can own features end-to-end over multiple quarters, rather than 3-month project scopes. Your company's product roadmap and scale mean the problems are the kind I want to invest the next few years in. So it's less about leaving and more about growing into something bigger.",
    tips: [
      "Keep current employer framed POSITIVELY, even if the real reason is negative.",
      "Focus on what you're moving TOWARD, not away from.",
      "Tie it to this company's specific strengths."
    ]
  }
];

const seedDB = async () => {
  try {
    await HrQuestion.deleteMany({});
    console.log('Cleared existing HR questions.');
    await HrQuestion.insertMany(hrQuestions);
    console.log(`Seeded ${hrQuestions.length} HR questions.`);
    process.exit();
  } catch (err) {
    console.error('HR seeding error:', err);
    process.exit(1);
  }
};

setTimeout(seedDB, 1500);
