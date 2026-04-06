const express = require('express');
const { getSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard summary analytics
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StandardResponse'
 *       401:
 *         description: Missing or invalid Bearer token
 */

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard stats
 *     description: Alias of the summary endpoint for interviewer testing.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StandardResponse'
 *       401:
 *         description: Missing or invalid Bearer token
 */
router.get('/summary', authorize('admin', 'analyst', 'user'), getSummary);
router.get('/stats', authorize('admin', 'analyst', 'user'), getSummary);

module.exports = router;
