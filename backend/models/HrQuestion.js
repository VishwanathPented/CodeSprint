import mongoose from 'mongoose';

const hrQuestionSchema = new mongoose.Schema({
  order: { type: Number, required: true, unique: true, index: true },
  category: {
    type: String,
    enum: ['introduction', 'behavioral', 'strengths', 'career', 'situational', 'closing'],
    required: true
  },
  question: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  framework: { type: String, required: true }, // e.g., STAR, PEEL — guidance on structure
  sampleAnswer: { type: String, required: true },
  tips: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('HrQuestion', hrQuestionSchema);
