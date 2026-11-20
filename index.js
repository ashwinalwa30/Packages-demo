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

// ─── React Frontend HTML Dashboard (Direct Delivery) ─────────────────────────
const REACT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@ashwinop/api-response-kit • Live React Demo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    :root {
      --bg: #090d16;
      --surface: #111827;
      --border: #1e293b;
      --text: #f8fafc;
      --muted: #94a3b8;
      --primary: #6366f1;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      padding: 2rem 1.5rem;
    }
    code, pre { font-family: 'Fira Code', monospace; }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect } = React;

    const ENDPOINTS = [
      { id: 'health', title: 'Health Check', method: 'GET', path: '/api/health', status: 200, kitMethod: 'res.sendSuccess()', desc: 'Standard success response with auto-generated metadata.' },
      { id: 'create', title: 'Create User', method: 'POST', path: '/api/users', body: { name: 'Sarah Connor', email: 'sarah@skynet.net', role: 'architect' }, status: 201, kitMethod: 'res.sendCreated()', desc: 'Automatic 201 Created response.' },
      { id: 'paginate', title: 'Paginated Users', method: 'GET', path: '/api/users?page=1&limit=4', status: 200, kitMethod: 'res.sendPaginated()', desc: 'Auto-calculated pagination and HATEOAS links.' },
      { id: 'notfound', title: 'User Not Found', method: 'GET', path: '/api/users/99', status: 404, kitMethod: 'ApiError.notFound()', desc: '404 resource not found with error code.' },
      { id: 'unauth', title: 'Protected Route', method: 'GET', path: '/api/protected', status: 401, kitMethod: 'ApiError.unauthorized()', desc: '401 Unauthorized with documentation links.' },
      { id: 'validate', title: 'Validation Error', method: 'GET', path: '/api/validation-demo', status: 422, kitMethod: 'ApiError.unprocessable()', desc: '422 Unprocessable with field details.' },
      { id: 'crash', title: 'Internal Crash', method: 'GET', path: '/api/crash-demo', status: 500, kitMethod: 'errorHandler()', desc: 'Centralized error handler catching uncaught exceptions.' }
    ];

    function App() {
      const [selected, setSelected] = useState(ENDPOINTS[0]);
      const [response, setResponse] = useState(null);
      const [loading, setLoading] = useState(false);
      const [latency, setLatency] = useState(null);
      const [copied, setCopied] = useState(false);

      const runRequest = async (ep) => {
        setLoading(true);
        const start = performance.now();
        try {
          const opts = { method: ep.method, headers: { 'Content-Type': 'application/json' } };
          if (ep.body) opts.body = JSON.stringify(ep.body);
          const res = await fetch(ep.path, opts);
          const data = await res.json();
          setLatency(Math.round(performance.now() - start));
          setResponse({ status: res.status, statusText: res.statusText, data });
        } catch (e) {
          setResponse({ error: true, data: { message: e.message } });
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => { runRequest(selected); }, [selected]);

      const copyJson = () => {
        if (!response?.data) return;
        navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      };

      return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-block', padding: '0.35rem 0.9rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.35)', color: '#818cf8', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              ⚛️ Live React + Express Demo
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
              @ashwinop/api-response-kit
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              Standard response handler for Express APIs — standardized success & error responses, auto status codes, pagination & TypeScript support.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.9rem' }}>
              <a href="https://github.com/ashwinalwa30/Package" target="_blank" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>📦 Package GitHub</a>
              <span style={{ color: 'var(--border)' }}>•</span>
              <a href="https://www.npmjs.com/package/@ashwinop/api-response-kit" target="_blank" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>🚀 NPM Package</a>
              <span style={{ color: 'var(--border)' }}>•</span>
              <a href="https://github.com/ashwinalwa30/Packages-demo" target="_blank" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>💻 Demo Repo</a>
            </div>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1rem', height: 'fit-content' }}>
              <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                Endpoints
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ENDPOINTS.map(ep => {
                  const active = selected.id === ep.id;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => setSelected(ep)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.75rem 0.9rem',
                        background: active ? '#1e293b' : 'transparent',
                        border: active ? '1px solid var(--primary)' : '1px solid transparent',
                        borderRadius: '0.5rem', color: 'var(--text)', cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'inherit'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ep.method === 'GET' ? '#38bdf8' : '#a855f7' }}>{ep.method}</span>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ep.title}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace' }}>{ep.kitMethod}</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontFamily: 'monospace', background: ep.status < 300 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: ep.status < 300 ? '#34d399' : '#f87171' }}>
                        {ep.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', borderRadius: '0.25rem', marginBottom: '0.25rem', fontFamily: 'monospace' }}>
                      {selected.kitMethod}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{selected.title}</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{selected.desc}</p>
                  </div>
                  <button
                    onClick={() => runRequest(selected)}
                    disabled={loading}
                    style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.85rem', cursor: loading ? 'not-allowed' : 'pointer' }}
                  >
                    {loading ? 'Sending...' : '⚡ Send'}
                  </button>
                </div>
                <div style={{ padding: '0.6rem 0.85rem', background: '#090d16', border: '1px solid var(--border)', borderRadius: '0.4rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  <span style={{ color: selected.method === 'GET' ? '#38bdf8' : '#a855f7', fontWeight: 700, marginRight: '0.5rem' }}>{selected.method}</span>
                  <span>{selected.path}</span>
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Response</span>
                    {response && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'monospace', background: response.status < 300 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: response.status < 300 ? '#34d399' : '#f87171' }}>
                        {response.status} {response.statusText}
                      </span>
                    )}
                    {latency && <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontFamily: 'monospace' }}>⚡ {latency}ms</span>}
                  </div>
                  <button
                    onClick={copyJson}
                    style={{ padding: '0.35rem 0.75rem', background: '#1e293b', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '0.35rem', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    {copied ? '✓ Copied' : '📋 Copy JSON'}
                  </button>
                </div>
                <pre style={{ background: '#070a11', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #131c2e', color: '#e2e8f0', fontSize: '0.85rem', lineHeight: '1.5', overflowX: 'auto', minHeight: '320px' }}>
                  {loading ? '// Executing request...' : response?.data ? JSON.stringify(response.data, null, 2) : '// Ready'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>`;

// Serve React App directly at root /
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(REACT_HTML);
});

// Catch-all 404 for unmatched API routes
app.all('/api/*', notFound({ message: 'The route {path} could not be found.' }));

// Centralized error handler
app.use(errorHandler({ version: 'v1.0' }));

const PORT = process.env.PORT || 5001;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Demo server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
