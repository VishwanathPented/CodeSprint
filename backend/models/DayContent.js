import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true }
});

const mcqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema]
});

const predictOutputSchema = new mongoose.Schema({
  codeSnippet: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  explanation: { type: String }
});

const codingProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  starterCode: { type: String },
  expectedOutput: { type: String }
});

const aptitudeQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema],
  hint: { type: String },
  explanation: { type: String }
});

const dayContentSchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true, unique: true },
  topicTitle: { type: String, required: true },
  description: { type: String, required: true },
  detailedExplanation: { type: String, default: "No detailed explanation available yet." },
  commonConfusions: { type: String, default: "Keep going, you've got this!" },
  videoUrl: { type: String }, 
  
  mcqs: [mcqSchema], // Keep simple, array of questions
  predictOutput: [predictOutputSchema],
  codingProblem: codingProblemSchema,
  aptitudeQuestions: [aptitudeQuestionSchema]
}, { timestamps: true });

export default mongoose.model('DayContent', dayContentSchema);
