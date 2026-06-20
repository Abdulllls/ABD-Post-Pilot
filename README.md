<div align="center">

# 🕷️ ABD Post Pilot

### AI-Assisted Instagram Multi-Account Auto Posting & Smart Scheduler SaaS

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Storage-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Celery](https://img.shields.io/badge/Celery-Redis-37814A?logo=celery&logoColor=white)](https://docs.celeryq.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📌 Overview

Managing several Instagram Business accounts by hand doesn't scale. Captions go
inconsistent, posting windows get missed, and one bad night of manual uploads
costs real reach and engagement.

**ABD Post Pilot** is a cloud-based SaaS dashboard that solves this end-to-end:
connect every Instagram account you manage, batch-upload your content (5–15
images at a time), write the caption once, set a schedule — and a background
worker publishes it on time, automatically, through Meta's **official Instagram
Graph API**. No scraping. No banned-account risk. No babysitting a queue at 2 AM.

This project was built as a full production-grade SaaS architecture — covering
authentication, multi-tenant data isolation, cloud storage, a real task queue
with retries, and a containerized deployment pipeline — rather than a toy demo.

---

## ✨ Key Features

| Feature | What it does |
|---|---|
| 🔗 **Multi-account management** | Connect, pause, or remove multiple Instagram Business accounts from one dashboard |
| 📦 **Batch posting** | Upload 5–15 images per batch with a shared caption, hashtags, and location |
| ⏰ **Smart scheduling** | Schedule a one-off post or set a recurring interval (e.g. every 2 hours) |
| 🧮 **Live analytics dashboard** | Real-time counts of total, scheduled, published, and failed posts per account |
| 🔁 **Self-healing queue** | Pending → Scheduled → Publishing → Published/Failed, with automatic bounded retries |
| 🔒 **True data isolation** | Postgres Row Level Security ensures every user can only ever query their own rows |
| 🐳 **Cloud-native deployment** | Fully Dockerized — backend, worker, frontend, and Redis spin up with one command |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, React Router, Axios |
| **Backend** | FastAPI (Python 3.12), Pydantic, httpx |
| **Database** | Supabase PostgreSQL (cloud-hosted, Row Level Security enabled) |
| **File Storage** | Supabase Storage (signed/public URLs for media assets) |
| **Task Queue** | Celery + Redis (minute-interval beat scheduler) |
| **Authentication** | Supabase Auth — email/password, JWT session tokens |
| **Deployment** | Docker, docker-compose, devcontainer.json (GitHub Codespaces-ready) |

---

## 🏗️ How It Works — Architecture Walkthrough

```
┌──────────┐      ┌──────────────┐      ┌──────────────────────┐
│ Frontend │ ───▶ │   FastAPI    │ ───▶ │  Supabase (Postgres  │
│ (React)  │ ◀─── │   Backend    │ ◀─── │   + Storage + Auth)  │
└──────────┘      └──────┬───────┘      └───────────┬──────────┘
                          │                          │
                          ▼                          ▼
                  ┌───────────────┐         ┌──────────────────┐
                  │ Celery Worker │ ───────▶│ scheduled_posts  │
                  │ (beat: 1/min) │         │     queue table  │
                  └───────┬───────┘         └──────────────────┘
                          ▼
              ┌────────────────────────────┐
              │ Instagram Graph API (Meta) │
              │  official, OAuth-scoped    │
              └────────────────────────────┘
```

**1. Authentication.** A user signs up/logs in through Supabase Auth directly
from the React app. Supabase issues a JWT session token, which the frontend
attaches to every backend request. FastAPI verifies that token on each
protected route and extracts the `user_id` — so every query, upload, and post
is automatically scoped to exactly one user.

**2. Connecting an Instagram account.** The user submits their Instagram
Business Account ID and a Graph API access token (obtained through Meta's
OAuth flow). The backend immediately calls the **real Graph API** to verify
the token and account before storing anything — invalid or expired tokens are
rejected on the spot, not discovered later when a post fails.

**3. Creating a batch.** The user uploads 5–15 images (validated for type and
size before upload), writes a caption, hashtags, and a location, and either
picks a specific publish time or a recurring interval. Images go to Supabase
Storage; the batch metadata goes into the `post_batches` and `batch_images`
tables; a corresponding row is created in `scheduled_posts` — this is the
actual job queue.

**4. The scheduler tick.** A Celery Beat task runs **every single minute** and
scans `scheduled_posts` for anything whose `scheduled_at` time has arrived. Due
items get dispatched as individual publish jobs — this keeps the scanning
cheap and the publishing parallelizable.

**5. Publishing.** For each due post, the worker builds the right Graph API
payload: a single image becomes a standard media container; multiple images
become a **carousel** container with child references. The container is
created, then published via the two-step Graph API flow
(`/media` → `/media_publish`). On success, the post moves to `published` and
a row is written to `published_posts` for the history page. On a recurring
batch, the next occurrence is automatically queued.

**6. Failure handling.** If the Graph API call fails (expired token, rate
limit, network blip), the job is retried automatically with backoff — up to
3 attempts — before the post is marked `failed` with the error captured for
the Queue page. Failed posts can be retried manually with one click.

**7. The dashboard.** Aggregates live counts of total/scheduled/published/failed
posts and connected accounts per user, queried straight from the same tables
the worker writes to — so the numbers are always a live reflection of the
actual queue state, never a cached approximation.

---

## 📁 Project Structure

```
abd-post-pilot/
├── backend/
│   ├── app/
│   │   ├── core/        # config, logging, JWT security, Supabase client, rate limiting
│   │   ├── models/      # Pydantic request/response schemas
│   │   ├── routers/     # auth, instagram-accounts, batches, queue, history, dashboard
│   │   ├── services/    # Instagram Graph API logic, storage, batch business logic
│   │   ├── worker/      # Celery app + beat schedule + publish/retry tasks
│   │   └── main.py
│   ├── supabase/schema.sql      # full DB schema + RLS policies + storage bucket
│   ├── requirements.txt
│   ├── Dockerfile / Dockerfile.worker
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/        # Landing, Login, Signup, Dashboard, Accounts, CreateBatch,
│   │   │                   Scheduler Calendar, Queue, History, Settings
│   │   ├── components/   # Sidebar, Topbar, GlassCard, StatCard, ProtectedRoute, AppLayout
│   │   ├── context/      # AuthContext (Supabase session state)
│   │   └── lib/          # supabaseClient, axios API wrapper (auto-attaches JWT)
│   ├── Dockerfile / nginx.conf
│   └── .env.example
├── .devcontainer/devcontainer.json   # GitHub Codespaces / cloud IDE ready
├── docker-compose.yml                # backend + worker + frontend + redis, one command
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/AbdulRehmanRaza03/abd-post-pilot.git
cd abd-post-pilot
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Run `backend/supabase/schema.sql` in the Supabase SQL editor — creates every
   table, enables Row Level Security, and creates the `batch-images` storage bucket.
3. Copy your Project URL, anon key, and service-role key.

### 3. Configure environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Fill in the values described in the table below.

### 4. Run locally without Docker
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
Spins up the backend (`:8000`), frontend (`:5173`), Redis, and the Celery worker together.

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase service-role key (backend only — never expose to frontend) |
| `SUPABASE_ANON_KEY` | Supabase anon/public key (safe for frontend) |
| `DATABASE_URL` | Direct Postgres connection string (optional, for migrations) |
| `SECRET_KEY` | JWT signing secret — must match your Supabase project's JWT secret |
| `INSTAGRAM_API_KEY` | Meta App ID |
| `INSTAGRAM_APP_SECRET` | Meta App Secret |
| `REDIS_URL` | Redis connection string for the Celery broker/backend |

Full list in `backend/.env.example` and `frontend/.env.example`.

---

## 📘 Instagram Graph API Setup

ABD Post Pilot uses only Meta's **official, documented** Instagram Graph API —
no scraping, no unofficial endpoints, no headless browser tricks.

1. Create an app at [developers.facebook.com](https://developers.facebook.com/apps).
2. Add the **Instagram Graph API** product to your app.
3. Convert target Instagram accounts to **Business** or **Creator** and link
   them to a Facebook Page.
4. Configure OAuth redirect URIs matching `INSTAGRAM_REDIRECT_URI`.
5. Request the `instagram_basic`, `instagram_content_publish`, and
   `pages_show_list` permissions — these require Meta App Review before going
   live with accounts you don't own.
6. Each connected account stores its own access token, account ID, and expiry,
   generated through this OAuth flow.

---

## 🔒 Security

- All secrets load from environment variables — nothing hardcoded in source
- JWT verification on every protected backend route, scoped to a single `user_id`
- Postgres Row Level Security enforced at the database layer, independent of any API bug
- File upload validation on type and size before any image reaches storage
- Rate limiting on auth and publish-triggering endpoints
- Instagram tokens are stored per-account and read only by the backend/worker — never sent back to the frontend after creation

## 🧭 Roadmap

- AI caption generation & image analysis (Gemini / OpenAI)
- Subscription billing (Stripe / local Pakistani payment gateways)
- Team accounts with role-based access
- Custom automation rules (auto-repost top performers, smart hashtag suggestions)
- Analytics dashboard (reach & engagement trends per account)

---

## 👤 About the Developer

**Abdul Rehman Raza**
BS Data Science student, Superior University Lahore — building production-grade
full-stack SaaS products alongside coursework, with a focus on practical,
monetizable tools for the Pakistani market.

- 📧 **Email:** [abdulrehmanraza60@gmail.com](mailto:abdulrehmanraza60@gmail.com)
- 📱 **Phone:** +92 318 1678758
- 💻 **GitHub:** [github.com/AbdulRehmanRaza03](https://github.com/AbdulRehmanRaza03)
- 💼 **LinkedIn:** [linkedin.com/in/abdul-rehman-raza-7a125b332](https://www.linkedin.com/in/abdul-rehman-raza-7a125b332)
- 🌐 **Portfolio:** [abdulrehmanraza03.github.io/My-Portfolio](https://abdulrehmanraza03.github.io/My-Portfolio/)

### Other Projects

| Project | Link |
|---|---|
| 🛍️ ABD Wears — fashion e-commerce store | [Live demo](https://abdulrehmanraza03.github.io/ABD-Wears-Weabsite/#/) |
| 🍕 FFC Pizza Restaurant — restaurant site | [Live demo](https://abdulrehmanraza03.github.io/FFC_Pizza_Restaurent/) |
| 🛠️ Service automation tool | [Live demo](https://replit-tool--theabdulservice.replit.app/#collections) |
| 🎥 Screen Recorder Web App | [Live demo](https://abd-screen-recorder-web-app.streamlit.app/) |
| 📊 Customer Churn Prediction — ML/Data Science project | [Live demo](https://customer-churn-prediction-analytics-5syak8uuar5rp4f8ihphvs.streamlit.app/) |

---

## 📄 License

MIT — see [LICENSE](LICENSE).
