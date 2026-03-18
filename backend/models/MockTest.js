import mongoose from 'mongoose';

const mockTestSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
    default: 60
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  mcqs: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    explanation: String
  }],
  codingProblems: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    initialCode: { type: String },
    expectedOutput: { type: String, required: true }
  }]
}, {
  timestamps: true
});

export default mongoose.model('MockTest', mockTestSchema);
