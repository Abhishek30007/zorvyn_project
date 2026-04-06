require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const { APP_ROLES } = require('../utils/roles');

const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';

const seedAdmin = async () => {
  let adminUser = await User.findOne({ username: DEFAULT_ADMIN_USERNAME });

  if (!adminUser) {
    adminUser = new User({
      username: DEFAULT_ADMIN_USERNAME,
      password: DEFAULT_ADMIN_PASSWORD,
      role: APP_ROLES.ADMIN,
      isActive: true,
    });
  } else {
    adminUser.password = DEFAULT_ADMIN_PASSWORD;
    adminUser.role = APP_ROLES.ADMIN;
    adminUser.isActive = true;
  }

  await adminUser.save();
  console.log('Admin synchronized successfully. You can now login with the credentials in your .env.');
  return adminUser;
};

const runSeedScript = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

if (require.main === module) {
  runSeedScript();
}

module.exports = {
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME,
  runSeedScript,
  seedAdmin,
};
