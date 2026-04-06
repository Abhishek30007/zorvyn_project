const { z } = require('zod');

exports.createTransactionSchema = z.object({
  body: z.object({
    amount: z.number({ required_error: 'Amount is required' }).positive(),
    type: z.enum(['income', 'expense'], { required_error: 'Type is required and must be either income or expense' }),
    category: z.string({ required_error: 'Category is required' }).min(1),
    date: z.coerce.date().optional(),
    notes: z.string().optional(),
    // userId is required: admin provides it explicitly; non-admin gets it injected by controller
    userId: z.string().optional(),
  }),
});

exports.updateTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive().optional(),
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().min(1).optional(),
    date: z.coerce.date().optional(),
    notes: z.string().optional(),
  }),
});

exports.updateTransactionStatusSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected']),
  }),
});
