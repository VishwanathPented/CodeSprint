import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dayNumber: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
