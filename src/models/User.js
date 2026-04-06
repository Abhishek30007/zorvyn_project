const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { APP_ROLES } = require('../utils/roles');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [APP_ROLES.ADMIN, APP_ROLES.ANALYST, APP_ROLES.USER],
    default: APP_ROLES.USER,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() || {};
  const nextPassword = update.password || update.$set?.password;

  if (!nextPassword) return;

  const hashedPassword = await bcrypt.hash(nextPassword, 10);

  if (update.password) update.password = hashedPassword;
  if (update.$set?.password) update.$set.password = hashedPassword;

  this.setUpdate(update);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
