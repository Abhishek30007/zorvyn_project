const rateLimit = require('express-rate-limit');

const isRateLimitingEnabled = () => process.env.RATE_LIMITING_ENABLED !== 'false';

const disabledLimiter = (_req, _res, next) => next();

const buildLimiter = (options) => {
  if (!isRateLimitingEnabled()) {
    return disabledLimiter;
  }

  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
};

const apiRateLimiter = buildLimiter({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    data: {},
    message: 'Too many requests. Please try again in 5 minutes.',
  },
});

const authRateLimiter = buildLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    data: {},
    message: 'Too many login attempts. Please try again in 5 minutes.',
  },
});

module.exports = {
  apiRateLimiter,
  authRateLimiter,
  isRateLimitingEnabled,
};
