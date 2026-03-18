import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mockTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockTest',
    required: true
  },
  mcqScore: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  tabSwitchCount: {
    type: Number,
    default: 0
  },
  timeTakenMinutes: {
    type: Number,
    default: 0
  },
  isAutoSubmitted: {
    type: Boolean,
    default: false
  },
  mcqAnswers: [{ // Stores the index the student selected
    questionIndex: Number,
    selectedOption: Number,
    isCorrect: Boolean
  }]
}, {
  timestamps: true
});

export default mongoose.model('TestResult', testResultSchema);
