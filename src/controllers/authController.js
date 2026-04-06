const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { APP_ROLES, normalizeRole } = require('../utils/roles');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key', {
    expiresIn: '30d',
  });
};

const serializeAuthUser = (user) => ({
  id: user._id,
  username: user.username,
  role: normalizeRole(user.role),
  isActive: user.isActive !== false,
});

exports.register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const userRole = normalizeRole(role || APP_ROLES.USER);

    const user = await User.create({
      username,
      password,
      role: userRole,
      isActive: true,
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: serializeAuthUser(user),
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'This account is inactive. Contact an admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: serializeAuthUser(user),
    });
  } catch (error) {
    next(error);
  }
};
