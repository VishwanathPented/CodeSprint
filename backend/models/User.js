import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Reusable schema for per-topic accuracy tracking
const topicStatSchema = new mongoose.Schema({
  attempted: { type: Number, default: 0 },
  correct: { type: Number, default: 0 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isSubscribed: { type: Boolean, default: false },
  
  // Collegiate Data Onboarding
  registrationDetails: {
    year: { type: String },
    branch: { type: String },
    phoneNumber: { type: String },
    usn: { type: String },
    isComplete: { type: Boolean, default: false }
  },
  
  // Progress tracking
  currentDay: { type: Number, default: 1 },
  completedDays: [{ type: Number }],
  
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  // Last calendar date a day was completed (YYYY-MM-DD, server-local) — used for midnight rollover
  lastDayCompletedDate: { type: String },
  
  // Scoring & Submissions
  scores: [{
    dayNumber: Number,
    mcqScore: Number,
    codingAttempted: Boolean,
    githubLink: String,     // Link to the specific file/commit on GitHub
    refactorLink: String,   // Link to the specific refactored file on GitHub
    aptitudeScore: Number
  }],
  
  githubRepo: { type: String }, // User's main 50-day repository URL

  // SQL track progress (Phase 1: Placement Tracks)
  sqlProgress: {
    completedLessons: [{ type: Number }],
    currentLesson: { type: Number, default: 1 },
    scores: [{
      lessonNumber: Number,
      theoryScore: Number,
      queriesSolved: Number,
      totalQueries: Number
    }]
  },

  // Aptitude track progress (Phase 2)
  aptitudeProgress: {
    sessionsCompleted: { type: Number, default: 0 },
    totalAttempted: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    sectionStats: {
      quantitative: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      },
      logical: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      },
      verbal: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      }
    },
    // Per-topic accuracy: map of topic name → { attempted, correct }
    topicStats: { type: Map, of: topicStatSchema, default: {} },
    bestSessionAccuracy: { type: Number, default: 0 }
  },

  // CS Fundamentals track progress (Phase 3)
  theoryProgress: {
    sessionsCompleted: { type: Number, default: 0 },
    totalAttempted: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    sectionStats: {
      os: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      },
      networks: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      },
      oop: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      }
    },
    topicStats: { type: Map, of: topicStatSchema, default: {} },
    bestSessionAccuracy: { type: Number, default: 0 }
  },

  // Per-track activity timestamps (for Daily Mission "did this today" checks)
  lastActivity: {
    aptitude: { type: Date },
    theory: { type: Date },
    sql: { type: Date },
    dsa: { type: Date },
    hr: { type: Date },
    java: { type: Date },
    review: { type: Date },
    // "Qualifying" markers — only set when the user completes ≥ daily-minimum effort.
    // Used to gate the daily program ("did you actually do today's aptitude?").
    aptitudeQualifying: { type: Date },
    theoryQualifying: { type: Date }
  },

  // DSA track progress (Phase 4)
  dsaProgress: {
    solvedProblems: [{ type: String }], // stores problem slugs
    topicStats: {
      arrays: { solved: { type: Number, default: 0 } },
      strings: { solved: { type: Number, default: 0 } },
      'linked-list': { solved: { type: Number, default: 0 } },
      'stack-queue': { solved: { type: Number, default: 0 } },
      hashing: { solved: { type: Number, default: 0 } },
      'recursion-trees': { solved: { type: Number, default: 0 } }
    }
  },

  // HR prep practice log
  hrPractice: [{
    questionId: String,
    question: String,
    answer: String,
    feedback: String,
    score: Number,
    practicedAt: { type: Date, default: Date.now }
  }],

  aiUsage: {
    count: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },

  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
