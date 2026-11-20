# @ashwinop/api-response-kit — React & Express Fullstack Demo

A fullstack demo application showcasing **[@ashwinop/api-response-kit](https://www.npmjs.com/package/@ashwinop/api-response-kit)** with an Express REST API and a modern interactive React frontend.

---

## 📁 Project Structure

```
Packages-demo/
├── client/                     # Modern React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx             # Interactive API explorer UI
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express API using @ashwinop/api-response-kit
│   ├── server.js               # API endpoints demonstrating all kit features
│   └── package.json
├── vercel.json                 # 1-click Vercel deployment configuration
├── package.json                # Root orchestration scripts
└── README.md
```

---

## ⚡ Features Demonstrated

| Feature | Kit Implementation | HTTP Status |
|---|---|---|
| Standard Success | `res.sendSuccess()` | `200 OK` |
| Created Resource | `res.sendCreated()` | `201 Created` |
| Pagination + HATEOAS | `res.sendPaginated()` | `200 OK` (with total, totalPages, next, prev) |
| Resource Not Found | `throw ApiError.notFound()` | `404 Not Found` |
| Unauthorized Error | `throw ApiError.unauthorized()` | `401 Unauthorized` |
| Validation Details | `throw ApiError.unprocessable()` | `422 Unprocessable Entity` (with field errors) |
| Centralized Error Handling | `errorHandler()` | `500 Internal Server Error` |
| Request Tracing | `requestId()` middleware | Automatically echoes `X-Request-Id` |

---

## 🚀 Quick Start (Local Development)

### 1. Install dependencies
```bash
# In the root directory:
npm run install:all
```

### 2. Start the Express API server
```bash
npm run server
# Runs Express on http://localhost:5001
```

### 3. Start the React frontend
```bash
npm run client
# Runs React (Vite) on http://localhost:3000
```

Open **`http://localhost:3000`** to test all responses interactively!

---

## 📦 NPM Package Details

- **Package Name:** `@ashwinop/api-response-kit`
- **NPM Link:** [https://www.npmjs.com/package/@ashwinop/api-response-kit](https://www.npmjs.com/package/@ashwinop/api-response-kit)
- **GitHub Repository:** [https://github.com/ashwinalwa30/Package](https://github.com/ashwinalwa30/Package)

---

## 📄 License
MIT © Ashwin Alwa
