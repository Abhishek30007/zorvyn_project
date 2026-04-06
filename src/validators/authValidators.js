const { z } = require('zod');

exports.registerSchema = z.object({
  body: z.object({
    username: z.string({ required_error: 'Username is required' }).min(3).max(30),
    password: z.string({ required_error: 'Password is required' }).min(6),
    role: z.enum(['admin', 'analyst', 'user']).optional(),
  }),
});

exports.loginSchema = z.object({
  body: z.object({
    username: z.string({ required_error: 'Username is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});
