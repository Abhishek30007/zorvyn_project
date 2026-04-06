# FinDash

FinDash is a MERN-based finance operations platform built for secure transaction tracking, approval workflows, and role-aware reporting. The backend is production-oriented, with JWT authentication, bcrypt-based password protection, automated admin seeding, request throttling, and interactive API documentation for technical reviewers.

## Architecture

FinDash follows a standard MERN architecture:

- MongoDB Atlas stores users, transactions, and dashboard aggregation data.
- Express provides the REST API, middleware pipeline, RBAC checks, validation, rate limiting, and Swagger documentation.
- React powers the frontend dashboards for admins, analysts, and viewers.
- Node.js hosts the backend runtime and startup lifecycle.

### Security Architecture

- JWT authentication protects all private API routes.
- Bcrypt hashes passwords through Mongoose middleware before persistence.
- Express Rate Limit defends the API globally and applies stricter throttling on login attempts.
- Role-based access control separates Viewer, Analyst, and Admin permissions at the route layer.
- Centralized error handling converts unexpected failures into consistent JSON responses.

## Key Features

- Role-Based Access Control: Different capabilities for Admin, Analyst, and Viewer accounts.
- Real-time Transaction Moderation: Submitted viewer transactions can be reviewed and approved before they affect totals.
- Automated Database Seeding: A startup-safe seed flow provisions or refreshes the default admin account from `.env`.
- Interactive API Docs: Swagger UI at `/api-docs` allows live endpoint testing.
- Postman Automation: The included collection automatically captures the JWT token after login for faster reviewer workflows.

## Functional Audit Summary

### RBAC Check

- Viewers are blocked from transaction mutation routes because `POST /api/transactions` only allows `admin` and `user`, while `PUT`, `PATCH /status`, and `DELETE` are restricted above the viewer scope.
- User management mutation routes are currently Admin-only, so Viewers cannot patch or delete users.
- Audit finding: Analysts are not allowed to update transactions today, even though the intended rule says they should be able to update but not delete. This is enforced in [transactionRoutes.js](/C:/Users/BIT/expense_track/src/routes/transactionRoutes.js).

### Auth Integrity

- Password hashing is enforced in the `User` model with a `pre('save')` hook and a `pre('findOneAndUpdate')` hook.
- Registration passes the raw password into Mongoose and relies on model-level hashing, which keeps hashing logic centralized.
- The seed script updates the default admin through a model save flow, so the seeded password is hashed before persistence.
- The `comparePassword` schema method is used by login, preventing repeated ad hoc bcrypt logic in controllers.

### Error Handling

- Controllers consistently call `next(error)` for unexpected failures and rely on the global error middleware in [errorHandler.js](/C:/Users/BIT/expense_track/src/middleware/errorHandler.js).
- Most explicit controller rejections use the JSON shape `{ success: false, message: "..." }`.
- Minor consistency gap: success responses are not fully standardized across all controllers yet. Some include `count`, some return `{ data: {} }`, and auth responses still return `token` and `user` at the top level rather than nesting inside a shared envelope.

## Technical Decisions

### Why Mongoose Middleware for Hashing

Hashing passwords at the model layer removes duplication and protects every write path, not just registration. This means normal user registration, admin credential refreshes, and future password updates all inherit the same security behavior automatically.

### Why JWT Authentication

JWTs make the API easy to test in Swagger, Postman, and the React client while keeping route protection explicit and stateless.

### Why Express Rate Limiting

Rate limiting adds a basic abuse-prevention layer around the API and a stronger brute-force defense around login attempts. It is also toggleable through `.env` for local debugging.

### Why Postman Automation

The automated Postman login test captures the JWT once and stores it in a collection variable. That makes reviewer validation faster and reduces copy-paste mistakes when moving through protected routes.

## Installation

### 1. Clone and Install

```bash
npm install
cd client
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend root based on [.env.example](/C:/Users/BIT/expense_track/.env.example).

Required backend variables:

- `PORT=5000`
- `MONGODB_URI=your-mongodb-atlas-uri-targeting-finance_dashboard`
- `JWT_SECRET=your_jwt_secret`
- `NODE_ENV=development`
- `RATE_LIMITING_ENABLED=true`
- `DEFAULT_ADMIN_USERNAME=admin`
- `DEFAULT_ADMIN_PASSWORD=Admin@123`

### 3. Seed the Default Admin

Run the seed script before reviewer testing:

```bash
npm run seed
```

This is the primary way recruiters and reviewers get immediate Admin access. The startup lifecycle also runs the admin synchronization step after a successful MongoDB connection.

Default reviewer credentials:

- Username: `admin`
- Password: `Admin@123`

### 4. Start the Backend

```bash
npm run dev
```

or

```bash
npm start
```

### 5. Start the Frontend

```bash
cd client
npm run dev
```

## API Testing

### Swagger UI

Swagger documentation is available at:

```text
http://localhost:5000/api-docs
```

Use it to:

- inspect endpoint contracts
- authorize once with a Bearer token
- execute live requests directly from the browser

Suggested reviewer flow:

1. Seed the admin account with `npm run seed`.
2. Start the backend.
3. Open `/api-docs`.
4. Log in via `POST /api/auth/login`.
5. Copy the returned JWT into the Swagger `Authorize` modal as `Bearer <token>`.
6. Test protected routes such as transactions, users, and dashboard analytics.

### Postman Collection

The Postman collection is stored at [FinDash.postman_collection.json](/C:/Users/BIT/expense_track/src/docs/api/FinDash.postman_collection.json).

It includes:

- collection-level Bearer auth using `{{jwt_token}}`
- automated token capture after login
- folders for Auth, Transactions, and Admin routes
- placeholder variables such as `{{baseUrl}}`, `{{transactionId}}`, and `{{userId}}`

Suggested reviewer flow:

1. Import [FinDash.postman_collection.json](/C:/Users/BIT/expense_track/src/docs/api/FinDash.postman_collection.json) into Postman.
2. Set `baseUrl` to `http://localhost:5000`.
3. Run `Auth -> Login`.
4. Confirm `jwt_token` is automatically filled at the collection level.
5. Run protected requests without manually pasting tokens.

## Project Structure

```text
src/
  config/        # Database and Swagger configuration
  controllers/   # Route handlers and business logic
  middleware/    # Auth, RBAC, validation, rate limiting, error handling
  models/        # Mongoose schemas and model hooks
  routes/        # Express route definitions
  scripts/       # Seed utilities
  docs/api/      # Postman collection for reviewer testing
client/
  src/           # React frontend
```

## Notes for Reviewers

- Use the seed script first if you want guaranteed Admin access.
- The backend expects MongoDB Atlas and a URI that targets the `finance_dashboard` database.
- Login throttling may block repeated failed attempts; set `RATE_LIMITING_ENABLED=false` temporarily for local debugging if needed.
- Current RBAC behavior is stricter than the intended Analyst update rule: Analysts can read global data, but transaction update routes are still Admin-only.
