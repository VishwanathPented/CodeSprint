import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  explanation: { type: String }
});

const dsaProblemSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true, index: true },
  order: { type: Number, required: true, index: true },
  title: { type: String, required: true },
  topic: {
    type: String,
    enum: ['arrays', 'strings', 'linked-list', 'stack-queue', 'hashing', 'recursion-trees'],
    required: true,
    index: true
  },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  companies: [{ type: String }], // e.g. ['TCS', 'Infosys', 'Wipro']
  description: { type: String, required: true },
  constraints: { type: String },
  starterCode: { type: String, required: true },
  hints: [{ type: String }],
  sampleTests: [testCaseSchema],
  // Internal reference solution for admin/debugging (not sent to client)
  solutionNotes: { type: String }
}, { timestamps: true });

export default mongoose.model('DsaProblem', dsaProblemSchema);
