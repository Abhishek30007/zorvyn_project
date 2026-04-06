const express = require('express');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransactionStatus,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createTransactionSchema,
  updateTransactionSchema,
  updateTransactionStatusSchema
} = require('../validators/transactionValidators');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: List transactions
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StandardResponse'
 *       401:
 *         description: Missing or invalid Bearer token
 *   post:
 *     tags:
 *       - Transactions
 *     summary: Create a transaction
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *               - date
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 6610c9f13d4f1b6e84fd1234
 *               amount:
 *                 type: number
 *                 example: 199.99
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *                 example: Food
 *               notes:
 *                 type: string
 *                 example: Team lunch
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StandardResponse'
 *       401:
 *         description: Missing or invalid Bearer token
 */
router.route('/')
  .get(authorize('admin', 'analyst', 'user'), getTransactions)
  .post(authorize('admin', 'user'), validate(createTransactionSchema), createTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get one transaction
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction returned successfully
 *       401:
 *         description: Missing or invalid Bearer token
 *   put:
 *     tags:
 *       - Transactions
 *     summary: Update a transaction
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       401:
 *         description: Missing or invalid Bearer token
 *   delete:
 *     tags:
 *       - Transactions
 *     summary: Delete a transaction
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       401:
 *         description: Missing or invalid Bearer token
 */
router.route('/:id')
  .get(authorize('admin', 'analyst', 'user'), getTransaction)
  .put(authorize('admin'), validate(updateTransactionSchema), updateTransaction)
  .delete(authorize('admin'), deleteTransaction);

/**
 * @swagger
 * /api/transactions/{id}/status:
 *   patch:
 *     tags:
 *       - Transactions
 *     summary: Update transaction approval status
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       401:
 *         description: Missing or invalid Bearer token
 */
router.patch('/:id/status', authorize('admin'), validate(updateTransactionStatusSchema), updateTransactionStatus);

module.exports = router;
