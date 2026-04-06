const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// GET /api/transactions?userId=<id>&status=<status>
exports.getTransactions = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'admin') {
      if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
        filter.userId = req.query.userId;
      }
    } else if (req.user.role === 'user') {
      filter.userId = req.user._id;
    }

    if (['pending', 'approved', 'rejected'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const transactions = await Transaction.find(filter)
      .populate('userId', 'username role isActive')
      .sort({ createdAt: -1, date: -1 });

    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    next(error);
  }
};

exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('userId', 'username role isActive');
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (req.user.role === 'user' && String(transaction.userId?._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this transaction.' });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && req.user.role !== 'user') {
      return res.status(403).json({ success: false, message: 'Not authorized to create transactions.' });
    }

    let ownerId = req.user._id;
    if (isAdmin) {
      if (!req.body.userId || !mongoose.Types.ObjectId.isValid(req.body.userId)) {
        return res.status(400).json({ success: false, message: 'Admin must provide a valid userId when creating a transaction.' });
      }
      ownerId = req.body.userId;
    }

    const transaction = await Transaction.create({
      userId: ownerId,
      amount: req.body.amount,
      type: req.body.type,
      category: req.body.category,
      date: req.body.date,
      notes: req.body.notes,
      status: isAdmin ? 'approved' : 'pending',
    });

    const populated = await transaction.populate('userId', 'username role isActive');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const { userId, status, ...updateData } = req.body;

    transaction = await Transaction.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('userId', 'username role isActive');

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    transaction.status = req.body.status;
    await transaction.save();

    const populated = await transaction.populate('userId', 'username role isActive');
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await transaction.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
