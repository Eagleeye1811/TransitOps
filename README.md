# TransitOps

Fleet & transport operations management platform for Indian logistics
teams — vehicles, drivers, trips/dispatch, maintenance, fuel & expenses,
safety/compliance, analytics, and role-based user administration, in one
app.

FastAPI backend + SQLModel ORM on the API side, React 19 + Vite + Tailwind
on the frontend. Started as an Odoo Hackathon build.

## Contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Demo credentials](#demo-credentials)
- [Roles & permissions](#roles--permissions)
- [Features](#features)
- [Testing](#testing)
- [API docs](#api-docs)
- [Environment variables](#environment-variables)

## Tech stack

**Backend** (`backend/`)
- Python 3.12, [FastAPI](https://fastapi.tiangolo.com/), [SQLModel](https://sqlmodel.tiangolo.com/) ORM
- SQLite by default (zero-setup local dev) — Postgres (via [Neon](https://neon.tech)) in production, managed with Alembic migrations
- JWT auth (`pyjwt` + `bcrypt`), APScheduler for background jobs, Cloudinary for document storage, Resend for transactional email
- Package manager: [uv](https://docs.astral.sh/uv/)

**Frontend** (`frontend/`)
- React 19, Vite 8, Tailwind CSS 4
- React Router 7, Zustand for state (auth/theme/toast stores)
- Recharts for analytics charts, Leaflet + OpenStreetMap for the trip route map, jsPDF for report export, Tesseract.js for document OCR

Both RBAC layers (frontend `config/permissions.js` and backend
`app/core/permissions.py`) are kept in sync by hand — the backend
independently re-enforces every permission check rather than trusting
whatever the UI already hid.

## Project structure

```
backend/
  app/
    routers/      one file per resource (auth, vehicles, drivers, trips,
                   maintenance, fuel_logs, expenses, users, settings,
                   safety, notifications, activity, documents, analytics)
    services/      business logic layer, one per resource
    models/        SQLModel ORM tables
    schemas/       Pydantic request/response schemas
    core/          config, roles, permissions, security (JWT/bcrypt), exceptions
    db/            engine/session setup
    jobs/          APScheduler background jobs (expiry reminders, Neon keep-warm)
  alembic/         Postgres migrations
  seed/            seed.py (idempotent) + seed_data.py (demo dataset)
  tests/           pytest suite

frontend/
  src/
    pages/         one page per route, incl. pages/settings/
    components/    dashboard/, layout/, common/ (UI kit), fleet/, drivers/,
                    trips/, maintenance/, expenses/, documents/, analytics/, settings/
    services/      one API client wrapper per resource
    context/       Zustand stores (auth, theme, toast)
    hooks/         useAuth, useTheme, usePermissions, useToast, useClickOutside
    config/        roles.js, permissions.js, navigation.js, pageMeta.js
    utils/         pdfExport, csvExport, mockVinDecode, validators, formatters
    data/          original frontend-only mock datasets (superseded by the API,
                    kept for reference)
```

## Getting started

### Backend

```bash
cd backend
uv sync                              # install dependencies
cp .env.example .env                 # optional — SQLite works with zero setup
uv run python -m seed.seed           # seed demo data (idempotent, safe to re-run)
uv run uvicorn app.main:app --reload # http://localhost:8000
```

No `.env` is required for local dev — `DATABASE_URL` defaults to a local
SQLite file (`./dev.db`). To use Postgres instead, set `DATABASE_URL` to a
Neon **pooled** connection string in `.env` and run migrations:

```bash
uv run alembic upgrade head
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local           # optional — defaults to http://localhost:8000
npm run dev                          # http://localhost:5173
```

Open `http://localhost:5173` and sign in with one of the [demo
accounts](#demo-credentials) below. The API's interactive docs are at
`http://localhost:8000/docs`.

## Demo credentials

All seeded accounts share the same password:

```
Password: Demo@123
```

| Email | Role | Status |
|---|---|---|
| admin@transitops.in | Admin | active |
| fleetmanager@transitops.in | Fleet Manager | active |
| dispatcher@transitops.in | Dispatcher | active |
| safetyofficer@transitops.in | Safety Officer | active |
| financialanalyst@transitops.in | Financial Analyst | active |
| suresh.iyer@transitops.in | Fleet Manager | active |
| kavita.deshmukh@transitops.in | Dispatcher | inactive |
| rohit.malhotra@transitops.in | Safety Officer | locked |

The last two are there to exercise the inactive/locked-account login
paths. Login requires selecting a role, and it must match the role
actually assigned to the account — picking the wrong one is rejected
server-side, not just hidden in the UI.

## Roles & permissions

| Role | Access summary |
|---|---|
| **Admin** | Every module, plus Users and Roles & Permissions |
| **Fleet Manager** | Full Fleet & Maintenance, operational view of Drivers, fleet-scoped Analytics — no Trips, Expenses, Compliance |
| **Dispatcher** | Full Trips (dispatch/cancel/complete), view-only Fleet & Maintenance, availability-only Drivers view — no Expenses/Analytics |
| **Safety Officer** | Full Drivers (licence/safety-score, suspend/reactivate, incidents) and Compliance, safety-scoped Analytics, view-only Trips |
| **Financial Analyst** | Full Fuel & Expenses (incl. export), financial view of Fleet, cost view of Maintenance, financial-scoped Analytics |

The full role × module matrix is browsable in-app at **Settings → Roles &
Permissions** once logged in as Admin, and is defined centrally in
`frontend/src/config/permissions.js` / `backend/app/core/permissions.py`.

## Features

- Role-specific dashboards (Admin, Fleet Manager, Dispatcher, Safety
  Officer, Financial Analyst)
- Fleet, driver, trip/dispatch, maintenance and fuel/expense management
- Compliance tracking with automated licence/document expiry email
  reminders (daily cron via Resend)
- Analytics with role-scoped charts (Recharts) and PDF/CSV export
- Document management with Cloudinary storage and best-effort OCR
  pre-fill (Tesseract.js) for expiry dates / document numbers
- Trip route map (Leaflet + OpenStreetMap tiles, geocoding via Nominatim,
  routing via OSRM — no API key required)
- Dark mode, persisted and OS-preference-aware
- Activity log / audit trail, in-app notifications
- Human-readable sequential record IDs (`VEH-001`, `TRIP-042`, ...)

## Testing

```bash
cd backend
uv run pytest
```

Covers auth (login success/failure/role-mismatch/lockouts), trip
dispatch, RBAC permission enforcement, and maintenance-record coupling.
Tests run against an in-memory SQLite database, independent of local
`dev.db` state.

## API docs

With the backend running, FastAPI serves interactive docs at:

- Swagger UI — `http://localhost:8000/docs`
- ReDoc — `http://localhost:8000/redoc`
- Health check — `http://localhost:8000/health`

## Environment variables

Everything below is optional for local dev — the app runs out of the box
against SQLite with no `.env` file at all. See `backend/.env.example` and
`frontend/.env.example` for the full annotated list.

**Backend**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite by default; set to a Neon pooled Postgres URL for production |
| `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES` | Auth token signing |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `RESEND_API_KEY`, `REMINDER_EMAIL_FROM`, `LICENCE_EXPIRY_REMINDER_DAYS`, `DEMO_RECIPIENT_OVERRIDE` | Expiry reminder emails ([resend.com](https://resend.com)) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Document upload storage ([cloudinary.com](https://cloudinary.com)) |

**Frontend**

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL, defaults to `http://localhost:8000` |
