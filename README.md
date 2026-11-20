# @ashwinop/api-response-kit — Demo Application

A live demo application showcasing `@ashwinop/api-response-kit` in Express.

## 🚀 Live Demo
**[Live Deployed URL (Render/Vercel) will be placed here]**

## 📦 Features Demonstrated
- Standardized Success responses (`res.sendSuccess()`)
- Created 201 responses (`res.sendCreated()`)
- Auto-calculated Pagination + HATEOAS links (`res.sendPaginated()`)
- Rich structured errors (`ApiError.notFound()`, `ApiError.unauthorized()`)
- Field-level validation errors (`ApiError.unprocessable()`)
- Request tracing and automatic `X-Request-Id` echo (`requestId()`)
- Centralized error handling (`errorHandler()`)

## 🛠️ Local Setup

```bash
# 1. Install dependencies (installs @ashwinop/api-response-kit from npm)
npm install

# 2. Start server
npm start
```

Visit `http://localhost:3000` to interact with the live tester UI.

## 📄 License
MIT
