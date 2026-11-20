import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ServerCrash,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Send,
  Zap,
} from 'lucide-react';

const ENDPOINTS = [
  {
    id: 'health',
    title: 'Health Check',
    method: 'GET',
    path: '/api/health',
    status: 200,
    type: 'success',
    kitMethod: 'res.sendSuccess()',
    description: 'Standard 200 response with automated timestamp, version, and metadata.',
  },
  {
    id: 'create-user',
    title: 'Create User',
    method: 'POST',
    path: '/api/users',
    body: { name: 'Sarah Connor', email: 'sarah@skynet.net', role: 'architect' },
    status: 201,
    type: 'created',
    kitMethod: 'res.sendCreated()',
    description: 'Automatic 201 Created status with resource payload and metadata.',
  },
  {
    id: 'pagination',
    title: 'Paginated Users',
    method: 'GET',
    path: '/api/users?page=2&limit=2',
    status: 200,
    type: 'paginated',
    kitMethod: 'res.sendPaginated()',
    description: 'Automatic pagination calculation, page counters, and HATEOAS links.',
  },
  {
    id: 'not-found',
    title: 'User Not Found',
    method: 'GET',
    path: '/api/users/99',
    status: 404,
    type: 'error',
    kitMethod: 'ApiError.notFound()',
    description: 'Structured 404 error with clean machine code and error description.',
  },
  {
    id: 'unauthorized',
    title: 'Protected Route',
    method: 'GET',
    path: '/api/protected',
    status: 401,
    type: 'error',
    kitMethod: 'ApiError.unauthorized()',
    description: 'Standardized 401 response with documentation links attached.',
  },
  {
    id: 'validation',
    title: 'Validation Error',
    method: 'GET',
    path: '/api/validation-demo',
    status: 422,
    type: 'validation',
    kitMethod: 'ApiError.unprocessable()',
    description: '422 Unprocessable Entity with per-field validation failure details.',
  },
  {
    id: 'crash',
    title: 'Internal Crash',
    method: 'GET',
    path: '/api/crash-demo',
    status: 500,
    type: 'server-error',
    kitMethod: 'errorHandler()',
    description: 'Centralized error handler catching uncaught exceptions gracefully.',
  },
];

export default function App() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState(null);
  const [copied, setCopied] = useState(false);

  const executeRequest = async (endpoint) => {
    setLoading(true);
    setResponse(null);
    const start = performance.now();

    try {
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'X-Client-App': 'react-demo',
        },
      };

      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }

      const res = await fetch(endpoint.path, options);
      const data = await res.json();
      const end = performance.now();

      setLatency(Math.round(end - start));
      setResponse({
        httpStatus: res.status,
        statusText: res.statusText,
        headers: {
          'x-request-id': res.headers.get('x-request-id') || 'gen-' + Math.random().toString(36).substring(7),
        },
        body: data,
      });
    } catch (err) {
      setResponse({
        error: true,
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeRequest(selectedEndpoint);
  }, [selectedEndpoint]);

  const handleCopy = () => {
    if (!response?.body) return;
    navigator.clipboard.writeText(JSON.stringify(response.body, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    if (status >= 200 && status < 300) return 'status-badge success';
    if (status >= 400 && status < 500) return 'status-badge warning';
    return 'status-badge danger';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '999px', color: '#818cf8', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
          <Sparkles size={16} /> React Interactive Demo
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
          @ashwinop/api-response-kit
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
          Standardized success and error response handler for Express APIs with automated status codes, pagination, and full TypeScript typing.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem' }}>
          <a
            href="https://github.com/ashwinalwa30/Package"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}
          >
            GitHub Repository <ExternalLink size={14} />
          </a>
          <span style={{ color: 'var(--border)' }}>•</span>
          <a
            href="https://www.npmjs.com/package/@ashwinop/api-response-kit"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}
          >
            NPM Package <ExternalLink size={14} />
          </a>
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem' }}>
        {/* Left Column: Endpoints Menu */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.25rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Demo Endpoints
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: isSelected ? '#1e293b' : 'transparent',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                    borderRadius: '0.6rem',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ep.method === 'GET' ? '#38bdf8' : '#a855f7' }}>
                        {ep.method}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ep.title}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                      {ep.kitMethod}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.3rem',
                      fontFamily: 'monospace',
                      background: ep.status < 300 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: ep.status < 300 ? '#34d399' : '#f87171',
                    }}
                  >
                    {ep.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Response Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Action Card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ display: 'inline-block', fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.6rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', borderRadius: '0.3rem', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                  {selectedEndpoint.kitMethod}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedEndpoint.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {selectedEndpoint.description}
                </p>
              </div>

              <button
                onClick={() => executeRequest(selectedEndpoint)}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.1rem',
                  background: 'var(--primary)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Send size={15} /> {loading ? 'Running...' : 'Send Request'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#090d16', border: '1px solid var(--border)', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
              <span style={{ color: selectedEndpoint.method === 'GET' ? '#38bdf8' : '#a855f7', fontWeight: 700 }}>
                {selectedEndpoint.method}
              </span>
              <span style={{ color: '#e2e8f0', wordBreak: 'break-all' }}>{selectedEndpoint.path}</span>
            </div>
          </div>

          {/* JSON Console Card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Response</span>
                {response && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.3rem',
                      fontFamily: 'monospace',
                      background: response.httpStatus < 300 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: response.httpStatus < 300 ? '#34d399' : '#f87171',
                    }}
                  >
                    {response.httpStatus} {response.statusText}
                  </span>
                )}
                {latency !== null && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                    <Zap size={12} color="#f59e0b" /> {latency}ms
                  </span>
                )}
              </div>

              <button
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.75rem',
                  background: '#1f2937',
                  border: '1px solid var(--border)',
                  borderRadius: '0.4rem',
                  color: 'var(--muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            </div>

            <pre
              style={{
                background: '#070a11',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #131c2e',
                color: '#e2e8f0',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                overflowX: 'auto',
                minHeight: '340px',
              }}
            >
              {loading ? '// Executing request...' : response?.body ? JSON.stringify(response.body, null, 2) : '// Ready'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
