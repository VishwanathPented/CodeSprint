import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const wipe = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const MockTest = mongoose.connection.collection('mocktests');
    const TestResult = mongoose.connection.collection('testresults');
    await MockTest.deleteMany({});
    await TestResult.deleteMany({});
    console.log("All legacy tests and results wiped successfully!");
    process.exit(0);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
}
wipe();
