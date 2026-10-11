# Deployment Guide

See the **Deployment** section of [README.md](README.md) for step-by-step instructions. Quick reference:

Backend (Railway)
- Root directory: `backend`. `backend/railway.json` sets the Nixpacks build, `npm start`, and the `/api/health` health check.
- Required variables: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`. Railway provides `PORT`.
- The server exits at startup if `JWT_SECRET` or `MONGO_URI` is missing in production.
- The cron job runs in the web process, so run a single replica (or split the cron into a worker).

Frontend (Vercel)
- Root directory: `frontend`. Framework: Vite. Build: `npm run build`. Output: `dist`.
- Required variable: `VITE_API_URL=https://<backend-domain>/api` (read at build time).
- `frontend/vercel.json` handles SPA rewrites for react-router deep links.

Security
- Never commit `.env` files. Use the `.env.example` templates.
- Rate-limit the auth and AI endpoints if you expose the app widely or connect a paid LLM.
