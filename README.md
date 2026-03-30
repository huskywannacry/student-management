# Website Management – Mini LMS POC

FastAPI + Next.js + PostgreSQL application for managing Students, Parents, Classes, and Subscriptions.

## Project structure

```
website-management/
├── docker-compose.yml              # PostgreSQL + backend + frontend services
├── .env.example                    # Environment variable template
├── dockers/
│   ├── Dockerfile                  # Backend image
│   └── Dockerfile.frontend         # Frontend image (multi-stage, Next.js standalone)
└── services/
    ├── backend/
    │   ├── pyproject.toml
    │   └── src/backend/
    │       ├── main.py             # FastAPI app + lifespan
    │       ├── config.py           # Settings (pydantic-settings)
    │       ├── database.py         # SQLAlchemy engine/session/Base
    │       ├── utils.py            # Time-slot helpers
    │       ├── models/             # SQLAlchemy ORM models
    │       ├── schemas/            # Pydantic request/response schemas
    │       └── routers/            # API route handlers
    └── frontend/
        ├── package.json
        ├── next.config.mjs
        └── src/
            ├── app/
            │   ├── layout.tsx      # Navbar shell
            │   ├── page.tsx        # Redirects to /classes
            │   ├── classes/        # Weekly schedule + register modal
            │   ├── parents/        # Create & list parents
            │   └── students/       # Create & list students
            └── lib/
                └── api.ts          # All typed fetch helpers
```

## Quick start (Docker – recommended)

```bash
# 1. Copy env file and set your Postgres password
cp .env.example .env
# Edit .env: set POSTGRES_PASSWORD=<your_password>

# 2. Build & start all three services
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend (Next.js) | <http://localhost:3000> |
| Backend API (FastAPI) | <http://localhost:8000> |
| Interactive API docs | <http://localhost:8000/docs> |

> **Note:** `NEXT_PUBLIC_API_URL` is baked into the frontend bundle at build time as `http://localhost:8000`.  
> The browser calls the backend directly. Both ports (3000, 8000) are exposed on the host.

---

## Local development (without Docker)

### Backend

```bash
# Start only PostgreSQL
docker compose up postgres -d

# Install deps
cd services/backend
uv sync

# Run with auto-reload
PYTHONPATH=src DATABASE_URL=postgresql://postgres:<password>@localhost:5432/website_management \
  uv run uvicorn backend.main:app --reload
```

### Frontend

```bash
cd services/frontend
npm install

# Point at local backend
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

---

## Frontend pages

| Page | Path | Description |
|------|------|-------------|
| Weekly Schedule | `/classes` | 7-column table (Mon–Sun). Each day shows class cards with time slot & teacher. Buttons to add a class or register a student. |
| Parents | `/parents` | Create parent form + list table |
| Students | `/students` | Create student form (with parent select) + list table |

---

## Backend API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/parents` | Create a parent |
| GET | `/api/parents` | List all parents |
| GET | `/api/parents/{id}` | Get parent details |
| POST | `/api/students` | Create a student (with parent_id) |
| GET | `/api/students` | List all students |
| GET | `/api/students/{id}` | Get student details (includes parent) |
| POST | `/api/classes` | Create a class |
| GET | `/api/classes?day={weekday}` | List classes (optionally filter by day) |
| POST | `/api/classes/{class_id}/register` | Register a student in a class |
| DELETE | `/api/registrations/{id}` | Cancel a registration (with session refund logic) |
| POST | `/api/subscriptions` | Create a subscription package |
| GET | `/api/subscriptions/{id}` | Get subscription status |
| PATCH | `/api/subscriptions/{id}/use` | Mark one session as used |

### Registration business rules

- **Capacity check** – rejects if class has reached `max_students`.
- **Duplicate check** – student cannot register in the same class twice.
- **Time-slot conflict** – student cannot join two classes with overlapping time slots on the same day.
- **Subscription check** – student must have an active subscription (`end_date >= today`) with remaining sessions. One session is consumed on registration.

### Cancellation rules

- Cancel **> 24 h** before next class → registration deleted + 1 session refunded.
- Cancel **≤ 24 h** before next class → registration deleted, no refund.

### Formats

- `time_slot`: `HH:MM-HH:MM`, e.g. `"08:00-10:00"`
- `day_of_week`: `Monday | Tuesday | Wednesday | Thursday | Friday | Saturday | Sunday`


## Project structure

```
website-management/
├── docker-compose.yml          # PostgreSQL + backend services
├── dockers/Dockerfile          # Backend image
├── .env.example                # Environment variable template
└── services/
    └── backend/
        ├── pyproject.toml
        └── src/backend/
            ├── main.py         # FastAPI app + lifespan
            ├── config.py       # Settings (pydantic-settings)
            ├── database.py     # SQLAlchemy engine/session/Base
            ├── utils.py        # Time-slot helpers
            ├── models/         # SQLAlchemy ORM models
            │   ├── parent.py
            │   ├── student.py
            │   ├── class_.py
            │   ├── registration.py
            │   └── subscription.py
            ├── schemas/        # Pydantic request/response schemas
            │   ├── parent.py
            │   ├── student.py
            │   ├── class_.py
            │   ├── registration.py
            │   └── subscription.py
            └── routers/        # API route handlers
                ├── parents.py
                ├── students.py
                ├── classes.py
                ├── registrations.py
                └── subscriptions.py
```

## Quick start (Docker)

```bash
docker compose up --build
```

The API is available at <http://localhost:8000>.
Interactive docs: <http://localhost:8000/docs>

## Local development (uv)

```bash
# 1. Start only PostgreSQL
docker compose up postgres -d

# 2. Create .env
cp .env.example .env

# 3. Install deps & run
cd services/backend
uv sync
PYTHONPATH=src uv run uvicorn backend.main:app --reload
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/parents` | Create a parent |
| GET | `/api/parents/{id}` | Get parent details |
| POST | `/api/students` | Create a student (with parent_id) |
| GET | `/api/students/{id}` | Get student details (includes parent) |
| POST | `/api/classes` | Create a class |
| GET | `/api/classes?day={weekday}` | List classes (optionally filter by day) |
| POST | `/api/classes/{class_id}/register` | Register a student in a class |
| DELETE | `/api/registrations/{id}` | Cancel a registration (with session refund logic) |
| POST | `/api/subscriptions` | Create a subscription package |
| GET | `/api/subscriptions/{id}` | Get subscription status |
| PATCH | `/api/subscriptions/{id}/use` | Mark one session as used |

### Registration business rules

- **Capacity check** – rejects if class has reached `max_students`.
- **Duplicate check** – student cannot register in the same class twice.
- **Time-slot conflict** – student cannot join two classes with overlapping time slots on the same day.
- **Subscription check** – student must have an active subscription (`end_date >= today`) with remaining sessions (`used_sessions < total_sessions`). One session is consumed on registration.

### Cancellation rules

- Cancel **> 24 h** before next class → registration deleted + 1 session refunded.
- Cancel **≤ 24 h** before next class → registration deleted, no refund.

### time_slot format

`HH:MM-HH:MM`, e.g. `"08:00-10:00"`.

### day_of_week values

`Monday | Tuesday | Wednesday | Thursday | Friday | Saturday | Sunday`
