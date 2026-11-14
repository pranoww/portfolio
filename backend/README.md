# Portfolio backend

FastAPI + Postgres. It does one job: `POST /api/contact` takes a message from the site's contact form (all routes live under `/api`, matching the Vercel route). The endpoint:

- checks name, email and message with the same rules as the form
- quietly drops bots that fill the hidden `website` field
- allows each visitor (identified by a hashed IP) `MESSAGES_PER_HOUR_LIMIT` messages per hour
- saves the message in `contact_messages`, a table it creates on startup
- emails the message to `CONTACT_INBOX_EMAIL` through Resend; if the email fails, the message stays in the database

## Run

```bash
cd backend
cp .env.example .env              # then fill in the values
createdb portfolio                # and portfolio_test for the tests
uv sync
uv run uvicorn app.main:app --reload --port 8000
uv run pytest
```

The site reads the API address from `NEXT_PUBLIC_API_URL` and falls back to `http://localhost:8000/api`. On Vercel set it to `/api`.

On Vercel the visitor's address comes from the `x-vercel-forwarded-for` header (used only when Vercel's own `VERCEL` variable is set). On another host behind a proxy, start uvicorn with `--proxy-headers --forwarded-allow-ips="*"` so the rate limit sees each visitor's real IP.
