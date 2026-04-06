const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// GET /api/dashboard/summary?userId=<id>
exports.getSummary = async (req, res, next) => {
  try {
    const matchStage = {};
    const hasGlobalSummaryAccess = req.user.role === 'admin' || req.user.role === 'analyst';

    if (hasGlobalSummaryAccess) {
      if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
        matchStage.userId = new mongoose.Types.ObjectId(req.query.userId);
      }
    } else {
      matchStage.userId = req.user._id;
    }

    const approvedMatchStage = { ...matchStage, status: 'approved' };
    const $match = [{ $match: approvedMatchStage }];

    const pipeline = [
      ...$match,
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpense: 1,
          netBalance: { $subtract: ['$totalIncome', '$totalExpense'] },
        },
      },
    ];

    const categoryPipeline = [
      ...$match,
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          type: '$_id.type',
          category: '$_id.category',
          total: 1,
        },
      },
    ];

    const monthlyTrendPipeline = [
      ...$match,
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ];

    const [summaryResult, categoryResult, trendResult] = await Promise.all([
      Transaction.aggregate(pipeline),
      Transaction.aggregate(categoryPipeline),
      Transaction.aggregate(monthlyTrendPipeline),
    ]);

    const summary = summaryResult.length > 0
      ? summaryResult[0]
      : { totalIncome: 0, totalExpense: 0, netBalance: 0 };

    res.status(200).json({
      success: true,
      data: { summary, categories: categoryResult, trends: trendResult },
    });
  } catch (error) {
    next(error);
  }
};
