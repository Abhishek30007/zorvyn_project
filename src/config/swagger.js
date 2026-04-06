const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'System API',
      version: '1.0.0',
      description: 'Interviewer Test Environment',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
    security: [
      {
        BearerAuth: [],
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        StandardResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              additionalProperties: true,
            },
            message: {
              type: 'string',
              example: 'Request completed successfully.',
            },
          },
        },
        AuthRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'viewer@system.local',
            },
            password: {
              type: 'string',
              example: 'Password123',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'viewer01',
            },
            password: {
              type: 'string',
              example: 'Password123',
            },
            role: {
              type: 'string',
              example: 'user',
            },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '6610c9f13d4f1b6e84fd1234',
            },
            amount: {
              type: 'number',
              example: 2500,
            },
            type: {
              type: 'string',
              example: 'income',
            },
            category: {
              type: 'string',
              example: 'Salary',
            },
            date: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-06T00:00:00.000Z',
            },
            notes: {
              type: 'string',
              example: 'Monthly payroll',
            },
            status: {
              type: 'string',
              example: 'approved',
            },
          },
        },
        DashboardSummary: {
          type: 'object',
          properties: {
            totalIncome: {
              type: 'number',
              example: 12000,
            },
            totalExpense: {
              type: 'number',
              example: 4800,
            },
            netBalance: {
              type: 'number',
              example: 7200,
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js', path.join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = {
  swaggerOptions,
  swaggerSpec,
};
