const User = require('../models/User');
const { APP_ROLES, normalizeRole } = require('../utils/roles');

const serializeUser = (user) => ({
  _id: user._id,
  id: user._id,
  username: user.username,
  role: normalizeRole(user.role),
  isActive: user.isActive !== false,
  createdAt: user.createdAt,
});

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, 'username role isActive createdAt').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(serializeUser),
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const nextRole = normalizeRole(req.body.role);

    if (![APP_ROLES.ANALYST, APP_ROLES.USER].includes(nextRole)) {
      return res.status(400).json({ success: false, message: 'Role must be viewer or analyst.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }

    if (normalizeRole(user.role) === APP_ROLES.ADMIN) {
      return res.status(400).json({ success: false, message: 'Admin accounts cannot be reassigned here.' });
    }

    user.role = nextRole;
    await user.save();

    res.status(200).json({ success: true, data: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    if (typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot change your own status.' });
    }

    user.isActive = req.body.isActive;
    await user.save();

    res.status(200).json({ success: true, data: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};
