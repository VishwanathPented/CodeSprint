import mongoose from 'mongoose';

const aptitudeQuestionSchema = new mongoose.Schema({
  section: {
    type: String,
    enum: ['quantitative', 'logical', 'verbal'],
    required: true,
    index: true
  },
  topic: { type: String, required: true, index: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  question: { type: String, required: true },
  // Optional reading-comprehension passage shown above the question
  passage: { type: String },
  options: {
    type: [String],
    validate: [(arr) => arr.length === 4, 'Exactly 4 options required']
  },
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String },
  // Suggested answering time in seconds (used for the per-question timer)
  timeLimit: { type: Number, default: 75 }
}, { timestamps: true });

export default mongoose.model('AptitudeQuestion', aptitudeQuestionSchema);
