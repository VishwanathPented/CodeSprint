import mongoose from 'mongoose';

const theoryQuestionSchema = new mongoose.Schema({
  section: {
    type: String,
    enum: ['os', 'networks', 'oop'],
    required: true,
    index: true
  },
  topic: { type: String, required: true, index: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  question: { type: String, required: true },
  options: {
    type: [String],
    validate: [(arr) => arr.length === 4, 'Exactly 4 options required']
  },
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String },
  timeLimit: { type: Number, default: 45 }
}, { timestamps: true });

export default mongoose.model('TheoryQuestion', theoryQuestionSchema);
