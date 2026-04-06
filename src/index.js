require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const { swaggerSpec } = require('./config/swagger');
const { apiRateLimiter, authRateLimiter, isRateLimitingEnabled } = require('./middleware/rateLimiter');
const { seedAdmin } = require('./scripts/seed');
require('./models/User');
require('./models/Transaction');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiRateLimiter);

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Finance Dashboard API' });
});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
    },
  })
);

app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server;
let isShuttingDown = false;
let bootstrapPromise;

const hasPlaceholderMongoUri = (uri) => {
  if (!uri) return true;

  return [
    'username:password',
    '<username>',
    '<password>',
    'your_password',
    'cluster0.example.mongodb.net',
    'example.mongodb.net',
  ].some((token) => uri.toLowerCase().includes(token.toLowerCase()));
};

const validateMongoUri = () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MongoDB Atlas URI is missing. Set MONGODB_URI in the .env file.');
  }

  if (hasPlaceholderMongoUri(mongoUri)) {
    throw new Error('MONGODB_URI still contains placeholder values. Replace it with your real MongoDB Atlas connection string for finance_dashboard.');
  }

  if (!/\/finance_dashboard(?:\?|$)/i.test(mongoUri)) {
    throw new Error('MONGODB_URI must target the finance_dashboard database.');
  }
};

const bootstrapApp = async () => {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      validateMongoUri();
      await connectDB();

      // Initialize indexes only after MongoDB is connected to avoid buffering timeouts.
      await Promise.all([mongoose.model('User').init(), mongoose.model('Transaction').init()]);
      await seedAdmin();

      console.log('Successfully connected to MongoDB Atlas (finance_dashboard).');
      if (!isRateLimitingEnabled()) {
        console.log('Rate limiting is disabled via RATE_LIMITING_ENABLED=false');
      }
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
};

const startServer = async () => {
  try {
    await bootstrapApp();

    server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Connection Error: ${error.message}`);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error(`Connection Error: ${error.message}`);
  } finally {
    if (server) {
      server.close(() => process.exit(0));
    } else {
      process.exit(0);
    }
  }
});

module.exports = app;
module.exports.bootstrapApp = bootstrapApp;

if (process.env.NODE_ENV !== 'production') {
  startServer();
} else {
  bootstrapApp().catch((error) => {
    console.error(`Connection Error: ${error.message}`);
  });
}
