import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import userRoutes from './routes/user.js';
import compilerRoutes from './routes/compiler.js';
import adminRoutes from './routes/admin.js';
import commentRoutes from './routes/comments.js';
import publicRoutes from './routes/public.js';
import aiRoutes from './routes/ai.js';
import assessmentRoutes from './routes/assessments.js';
import sqlRoutes from './routes/sql.js';
import aptitudeRoutes from './routes/aptitude.js';
import theoryRoutes from './routes/theory.js';
import hrRoutes from './routes/hr.js';
import dsaRoutes from './routes/dsa.js';
import readinessRoutes from './routes/readiness.js';
import reviewRoutes from './routes/review.js';
import missionRoutes from './routes/mission.js';
import programRoutes from './routes/program.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'https://code-sprint-six.vercel.app',
    process.env.FRONTEND_URL
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/compiler', compilerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/sql', sqlRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/theory', theoryRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/readiness', readinessRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/mission', missionRoutes);
app.use('/api/program', programRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'CodeSprint 50 Backend Live',
    deployedAt: '2026-03-18 04:30:00 UTC',
    status: 'Ready'
  });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codesprint50')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
