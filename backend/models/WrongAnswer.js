import mongoose from 'mongoose';

// Spaced-repetition card for an MCQ a user got wrong.
// Reviewed at 3d → 7d → 14d → 30d intervals; resets to 3d on a wrong review.
const wrongAnswerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // Source of the question — drives which collection to populate from
  questionType: { type: String, enum: ['aptitude', 'theory'], required: true },
  questionRef: { type: mongoose.Schema.Types.ObjectId, required: true },

  // Cached question metadata so review surface doesn't have to refetch the original
  section: { type: String },
  topic: { type: String },
  difficulty: { type: String },
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String },

  // SRS state
  intervalDays: { type: Number, default: 3 },
  dueAt: { type: Date, required: true, index: true },
  reviewCount: { type: Number, default: 0 },
  correctStreak: { type: Number, default: 0 },
  lastReviewedAt: { type: Date },
  // Set true when user has retired the card after sustained correct streak
  mastered: { type: Boolean, default: false, index: true }
}, { timestamps: true });

// Each (user, questionRef) pair is unique — we update an existing card if present
wrongAnswerSchema.index({ user: 1, questionRef: 1 }, { unique: true });

export default mongoose.model('WrongAnswer', wrongAnswerSchema);
