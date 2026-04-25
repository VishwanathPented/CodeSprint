import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true }
});

const theoryMcqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema],
  explanation: { type: String }
});

const queryProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  prompt: { type: String, required: true },
  starterQuery: { type: String, default: '' },
  solutionQuery: { type: String, required: true },
  hint: { type: String },
  explanation: { type: String },
  orderMatters: { type: Boolean, default: false },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' }
});

const sqlLessonSchema = new mongoose.Schema({
  lessonNumber: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  conceptExplanation: { type: String, required: true },
  schemaDescription: { type: String, default: '' },
  setupSql: { type: String, required: true },
  theoryMcqs: [theoryMcqSchema],
  queryProblems: [queryProblemSchema]
}, { timestamps: true });

export default mongoose.model('SqlLesson', sqlLessonSchema);
