import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ username: { $exists: false } });
    console.log(`Found ${users.length} users needing a username.`);

    for (const user of users) {
      let username = user.name.toLowerCase().replace(/\s+/g, '').slice(0, 10);
      let usernameExists = await User.findOne({ username });
      if (usernameExists) {
        username = `${username}${Math.floor(Math.random() * 1000)}`;
      }
      user.username = username;
      await user.save();
      console.log(`Assigned username @${username} to ${user.name}`);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
