const express = require('express');
const { getUsers, updateUserRole, updateUserStatus } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin', 'analyst'), getUsers);
router.patch('/:id/role', authorize('admin'), updateUserRole);
router.patch('/:id/status', authorize('admin'), updateUserStatus);

module.exports = router;
