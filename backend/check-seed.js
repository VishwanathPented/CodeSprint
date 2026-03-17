import mongoose from 'mongoose';
import DayContent from './models/DayContent.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await DayContent.countDocuments();
    console.log(`Verified: ${count} documents found in the live database.`);
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

checkData();
