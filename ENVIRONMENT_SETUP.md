# Environment Configuration Guide

## Frontend (notkahootui)

### Development
Create `.env.local` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_BASE_URL=ws://localhost:3000
```

### Production
For production deployment, update `.env.local` with your actual domain:

```env
# For HTTPS (recommended for production)
VITE_API_BASE_URL=https://your-domain.com/api
VITE_WS_BASE_URL=wss://your-domain.com
```

**Note:** 
- Use `wss://` (WebSocket Secure) for HTTPS production
- Use `https://` for HTTPS APIs
- The WebSocket and API URLs should match your production domain

---

## Backend (notkahootb)

### Installation
```bash
cd notkahootb
npm install
```

### Development
Create `.env.local` file in the root directory:

```env
PORT=3000
HOST=0.0.0.0
ALLOWED_ORIGINS=http://localhost:3001
NODE_ENV=development
```

Then start the server:
```bash
npm run dev
```

### Production
Create `.env` file with production configuration:

```env
PORT=3000
HOST=0.0.0.0
ALLOWED_ORIGINS=https://your-domain.com
NODE_ENV=production
```

Start the server:
```bash
npm start
```

---

## CORS Configuration

### What is CORS?
CORS (Cross-Origin Resource Sharing) is a security feature that controls which domains can access your API.

### Production CORS Issues & Solutions

**Issue:** `Access to fetch at 'https://backend.com/api' from origin 'https://frontend.com' has been blocked by CORS policy`

**Solution:** Update `ALLOWED_ORIGINS` in backend `.env`:

```env
# Single origin
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Multiple origins (comma-separated)
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

### Important Notes

1. **WebSocket CORS:** WebSocket connections also respect CORS policy. Ensure the origin matches.

2. **Credentials Mode:** The backend is configured with `credentials: true`, which means:
   - Frontend requests must include `credentials: 'include'` (already handled by axios/fetch)
   - Backend CORS must explicitly list origins (cannot use `*`)

3. **Environment Variable:** Do NOT hardcode origins. Always use `ALLOWED_ORIGINS` environment variable.

---

## Deployment Checklist

- [ ] Update `VITE_API_BASE_URL` and `VITE_WS_BASE_URL` in frontend
- [ ] Update `ALLOWED_ORIGINS` in backend
- [ ] Ensure backend `.env.local` or `.env` is NOT committed to git
- [ ] Add `.env.local` and `.env` to `.gitignore`
- [ ] Install dependencies: `npm install dotenv` (backend)
- [ ] Test frontend and backend connectivity
- [ ] Use HTTPS in production (change `http://` to `https://` and `ws://` to `wss://`)

---

## Quick Reference

| Environment | Frontend API | Frontend WS | Backend CORS |
|---|---|---|---|
| Development | `http://localhost:3000` | `ws://localhost:3000` | `http://localhost:3001` |
| Production | `https://api.example.com` | `wss://api.example.com` | `https://app.example.com` |

