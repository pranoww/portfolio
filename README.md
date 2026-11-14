# Pranav Lande · Portfolio

Personal site of Pranav Lande, full-stack and AI developer in Mumbai.

- **Frontend:** Next.js (App Router, JavaScript), Tailwind CSS, three.js, Lenis
- **Backend:** FastAPI + PostgreSQL in `backend/`, used by the contact form

## Run locally

```bash
# site, http://localhost:3000
npm install
npm run dev

# backend, http://localhost:8000 (see backend/README.md for the .env setup)
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

## Environment

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | site | Public site address for canonical links, sitemap and share images |
| `NEXT_PUBLIC_API_URL` | site | Backend address, defaults to `http://localhost:8000` |
| `backend/.env` | backend | Database, allowed origins and email settings (copy `backend/.env.example`) |

## Tests

```bash
npm test               # unit tests
npm run test:e2e       # browser tests
cd backend && uv run pytest
```
