const express = require('express');
const cors = require('cors');
const {
  responseKit,
  errorHandler,
  requestId,
  notFound,
  ApiError,
  asyncHandler,
} = require('@ashwinop/api-response-kit');

const app = express();

app.use(cors());
app.use(express.json());

// 1. Request tracing middleware (adds req.id & X-Request-Id header)
app.use(requestId());

// 2. Response kit middleware (attaches res.sendSuccess, res.sendPaginated, etc.)
app.use(
  responseKit({
    version: 'v1.0',
    includeStackTrace: false,
    defaultSuccessMessage: 'Request completed successfully',
  })
);

// ─── API Routes ─────────────────────────────────────────────────────────────

// 1. Standard Success (200)
app.get('/api/health', (req, res) => {
  res.sendSuccess({
    data: {
      status: 'UP',
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
    },
    message: 'API is healthy and operational',
  });
});

// 2. Created Resource (201)
app.post(
  '/api/users',
  asyncHandler(async (req, res) => {
    const { name, email, role } = req.body || {};

    if (!email) {
      throw ApiError.unprocessable('Validation failed', [
        { field: 'email', message: 'Email address is required', code: 'REQUIRED_FIELD' },
      ]);
    }

    const newUser = {
      id: Math.floor(Math.random() * 9000) + 1000,
      name: name || 'Demo User',
      email,
      role: role || 'developer',
      createdAt: new Date().toISOString(),
    };

    res.sendCreated({
      data: newUser,
      message: 'User created successfully',
    });
  })
);

// 3. Paginated Response with HATEOAS Links
app.get('/api/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const total = 28;

  const mockUsers = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'admin' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'developer' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'designer' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'manager' },
  ];

  res.sendPaginated({
    data: mockUsers,
    page,
    limit,
    total,
    baseUrl: `${req.protocol}://${req.get('host')}/api/users`,
    message: 'User list retrieved successfully',
  });
});

// 4. Single Resource with 404 ApiError
app.get(
  '/api/users/:id',
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (id > 10) {
      throw ApiError.notFound(`User #${id}`, {
        code: 'USER_NOT_FOUND',
        description: 'No user matching the supplied ID exists in the database.',
      });
    }

    res.sendSuccess({
      data: { id, name: 'Alice Smith', email: 'alice@example.com' },
      message: `User #${id} retrieved`,
    });
  })
);

// 5. Protected Route (401 ApiError)
app.get(
  '/api/protected',
  asyncHandler(async () => {
    throw ApiError.unauthorized('Missing or invalid bearer token', {
      code: 'AUTH_REQUIRED',
      link: 'https://github.com/ashwinalwa30/Package#error-handling',
    });
  })
);

// 6. Validation Error Demo (422 with field errors)
app.get(
  '/api/validation-demo',
  asyncHandler(async () => {
    throw ApiError.unprocessable('Payload validation failed', [
      { field: 'email', message: 'Invalid email address format', code: 'INVALID_FORMAT' },
      { field: 'password', message: 'Password must be at least 8 characters', code: 'TOO_SHORT' },
      { field: 'age', message: 'Age must be 18 or above', code: 'MIN_VALUE' },
    ]);
  })
);

// 7. Internal Server Error Demo (500)
app.get(
  '/api/crash-demo',
  asyncHandler(async () => {
    throw new Error('Database connection timed out unexpected crash');
  })
);

// Catch-all 404 for unmatched API routes
app.all('/api/*', notFound({ message: 'The route {path} could not be found.' }));

// Centralized error handler
app.use(errorHandler({ version: 'v1.0' }));

module.exports = app;
