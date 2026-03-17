import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminEmail = 'admin@codesprint.com';
    const adminPassword = 'admin123';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin already exists with email:', adminEmail);
      existingAdmin.role = 'admin'; // Ensure role is correct
      await existingAdmin.save();
      console.log('Updated existing user to Admin role.');
    } else {
      await User.create({
        name: 'Vishu Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log('Successfully created Admin account!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Action failed:', err);
    process.exit(1);
  }
}

createAdmin();
