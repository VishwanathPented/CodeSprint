import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isSubscribed: { type: Boolean, default: false },
  
  // Progress tracking
  currentDay: { type: Number, default: 1 },
  completedDays: [{ type: Number }],
  
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  
  // Scoring & Submissions
  scores: [{
    dayNumber: Number,
    mcqScore: Number,
    codingAttempted: Boolean,
    githubLink: String,     // Link to the specific file/commit on GitHub
    aptitudeScore: Number
  }],
  
  githubRepo: { type: String }, // User's main 50-day repository URL
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
