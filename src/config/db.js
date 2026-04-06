const mongoose = require('mongoose');

const connectDB = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MongoDB Atlas URI is missing. Set MONGODB_URI in the .env file.');
  }

  try {
    return await mongoose.connect(MONGODB_URI);
  } catch (error) {
    const message = String(error.message || '');

    if (/auth|authentication failed|bad auth/i.test(message)) {
      throw new Error('MongoDB Atlas authentication failed. Check the username and password in MONGODB_URI.');
    }

    throw new Error(`MongoDB Atlas connection failed: ${message}`);
  }
};

module.exports = connectDB;
