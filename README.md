# ABD Post Pilot 🕷️

**AI-assisted Instagram multi-account auto posting & smart scheduler SaaS.**

Managing multiple Instagram Business accounts by hand doesn't scale — captions get
inconsistent, posting windows get missed, and a single bad night of manual uploads
costs you reach. ABD Post Pilot solves this with a cloud dashboard where you connect
every account you manage, batch-upload your content (5–15 images at a time), write the
caption once, set a schedule, and let a background worker publish on time through
Meta's **official Instagram Graph API** — every time, with retries built in.

---

## Features

- 🔗 **Multi-account support** — connect and manage several Instagram Business accounts from one dashboard
- 📦 **Batch posting** — upload 5–15 images per batch with shared caption, hashtags, and location
- ⏰ **Smart scheduling** — one-off time slots or recurring intervals (e.g. every 2 hours)
- 🧮 **Live dashboard** — total / scheduled / published / failed posts and connected accounts at a glance
- 🔁 **Automated queue** — pending → scheduled → publishing → published/failed, with bounded retries
- 🔒 **Strict data isolation** — Supabase Row Level Security ensures every user only ever sees their own data
- 🐳 **Cloud-native by default** — Supabase Postgres + Storage, Celery + Redis, fully Dockerized

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS, React Router |
| Backend | FastAPI (Python), Pydantic, httpx |
| Database | Supabase PostgreSQL (cloud-only, RLS enabled) |
| Storage | Supabase Storage |
| Scheduler | Celery + Redis (beat schedule ticks every minute) |
| Auth | Supabase Auth (email/password, JWT sessions) |
| Deployment | Docker, docker-compose |

## Architecture

```
User → Frontend (React) → Backend (FastAPI) → Supabase (Postgres + Storage)
                                  ↑                      ↓
                            Celery Worker  ←──────  Scheduled Posts Queue
                                  ↓
                     Instagram Graph API (official, OAuth-scoped)
```

The frontend never talks to Instagram directly. All publishing goes through the
FastAPI backend and the Celery worker, which is the only component holding
short-lived Graph API access tokens at call time.

## Project Structure

```
abd-post-pilot/
├── backend/
│   ├── app/
│   │   ├── core/        # config, logging, security (JWT), supabase client, rate limiting
│   │   ├── models/      # Pydantic schemas
│   │   ├── routers/     # auth, instagram-accounts, batches, queue, history, dashboard
│   │   ├── services/    # Instagram Graph API, storage, batch business logic
│   │   ├── worker/      # Celery app + scheduled publish tasks
│   │   └── main.py
│   ├── supabase/schema.sql
│   ├── requirements.txt
│   ├── Dockerfile / Dockerfile.worker
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/       # Landing, Login, Signup, Dashboard, Accounts, CreateBatch,
│   │   │                  Calendar, Queue, History, Settings
│   │   ├── components/  # Sidebar, Topbar, GlassCard, StatCard, ProtectedRoute
│   │   ├── context/      # AuthContext (Supabase session)
│   │   └── lib/          # supabaseClient, axios api wrapper
│   ├── Dockerfile / nginx.conf
│   └── .env.example
├── .devcontainer/devcontainer.json
├── docker-compose.yml
└── README.md
```

## Installation

### 1. Clone the repo
```bash
git clone https://github.com/your-username/abd-post-pilot.git
cd abd-post-pilot
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Run `backend/supabase/schema.sql` in the Supabase SQL editor — this creates all
   tables, enables Row Level Security, and creates the `batch-images` storage bucket.
3. Copy your Project URL, anon key, and service-role key.

### 3. Configure environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Fill in the values described below.

### 4. Install dependencies & run locally (without Docker)
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Worker (separate terminal)
celery -A app.worker.celery_app worker --beat --loglevel=info

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### 5. Or run everything with Docker
```bash
docker-compose up --build
```
This starts the backend (`:8000`), frontend (`:5173`), Redis, and the Celery worker
together.

## Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase service-role key (backend only — never expose to frontend) |
| `SUPABASE_ANON_KEY` | Supabase anon/public key (safe for frontend) |
| `DATABASE_URL` | Direct Postgres connection string (optional, for migrations) |
| `SECRET_KEY` | JWT signing secret — must match your Supabase project's JWT secret |
| `INSTAGRAM_API_KEY` | Meta App ID |
| `INSTAGRAM_APP_SECRET` | Meta App Secret |
| `REDIS_URL` | Redis connection string for Celery broker/backend |

See `backend/.env.example` and `frontend/.env.example` for the full list.

## Instagram Graph API Setup

ABD Post Pilot only uses Meta's **official, documented** Instagram Graph API — no
scraping, no unofficial endpoints, no headless browser automation.

1. Create an app at [developers.facebook.com](https://developers.facebook.com/apps).
2. Add the **Instagram Graph API** product to your app.
3. Convert the target Instagram accounts to **Business** or **Creator** accounts and
   link them to a Facebook Page.
4. Configure OAuth redirect URIs matching `INSTAGRAM_REDIRECT_URI`.
5. Request the `instagram_basic`, `instagram_content_publish`, and `pages_show_list`
   permissions — these require Meta App Review before going live with accounts you
   don't own.
6. Each connected account in ABD Post Pilot stores its own access token, account ID,
   and expiry — generated through this OAuth flow, never typed in by hand in production.

## Future Improvements

- AI caption generation and image analysis (Gemini / OpenAI)
- Subscription billing (Stripe / local Pakistani gateways)
- Team accounts with role-based access
- Custom automation rules (e.g. auto-repost top performers)
- Analytics dashboard (reach, engagement trends per account)

## Security

- All secrets load from environment variables — nothing hardcoded in source
- JWT verification on every protected backend route, scoped to a single `user_id`
- Supabase Row Level Security enforced at the database layer, independent of API bugs
- File upload validation on type and size before any image reaches storage
- Rate limiting on auth and publish-triggering endpoints
- Instagram tokens are stored per-account and only ever read by the backend/worker —
  never sent back to the frontend after creation

## License

MIT — see `LICENSE`.

## Contact

Built by Abdul — Lahore, Pakistan.
For questions or collaboration, open an issue on this repository.
