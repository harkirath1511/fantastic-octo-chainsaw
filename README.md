# TaskFlow — REST API with Auth & Role-Based Access

---

## Stack

| Layer        | Tech                                        |
|--------------|---------------------------------------------|
| Backend      | Node.js, Express, PostgreSQL (via Supabase) |
| Auth         | JWT in HTTP-only cookies                    |
| Caching      | Redis (optional)                            |
| Rate Limiting| express-rate-limit                          |
| Frontend     | React (Vite), Axios                         |
| Docs         | Swagger UI (`/api-docs`)                    |
| Container    | Docker + docker-compose                     |

---

## Project Structure

```
├── docker-compose.yml         # API + Redis containers
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── config/            # DB, Redis, Swagger, SQL schema
│       ├── controllers/       # Route handlers
│       ├── middleware/        # JWT auth, validation, cache, rate limit
│       ├── models/            # DB query layer
│       ├── routes/v1/         # Versioned API routes
│       ├── utils/             # JWT helpers, response helpers
│       └── validators/        # express-validator rule sets
└── frontend/
    └── src/
        ├── api/               # Axios instance + endpoint functions
        ├── context/           # Auth context (session rehydration)
        ├── components/        # Navbar, TaskCard, TaskModal
        └── pages/             # Login, Register, Dashboard, Users, NotFound
```

---

## Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (or any PostgreSQL instance)
- Docker (optional — for running with Redis)

### 1. Database

Run the schema against your Postgres database:

```bash
psql "$DATABASE_URL" -f backend/src/config/schema.sql
```

Or paste `backend/src/config/schema.sql` into the Supabase SQL editor.

---

### Option A — Run locally (no Docker)

**Backend**
```bash
cd backend
cp env.example .env   # fill in your values
npm install
npm run dev           # http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev           # http://localhost:5173
```

---

### Option B — Run with Docker (API + Redis)

```bash
# 1. Fill in backend/.env first (DATABASE_URL, JWT_SECRET, etc.)
# 2. From the repo root:
docker-compose up --build
```

The compose file starts:
- `api` — Node.js backend on port 5000, with `REDIS_URL` pre-wired to the Redis container
- `redis` — Redis 7 Alpine on port 6379, with a named volume for persistence

The backend connects to Supabase directly — no local Postgres container needed.

---

### Environment Variables

**`backend/.env`**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# Optional — leave empty to disable caching
REDIS_URL=redis://localhost:6379
```

> When using docker-compose, `REDIS_URL` is set automatically via the compose `environment` block — you don't need it in `.env`.

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## API Reference

Base URL: `http://localhost:5000/api/v1`  
Interactive docs: `http://localhost:5000/api-docs`

### Auth

| Method | Endpoint       | Auth  | Rate limit       | Cache   | Description        |
|--------|----------------|-------|------------------|---------|--------------------|
| POST   | /auth/register | —     | 10 / 15 min      | —       | Register new user  |
| POST   | /auth/login    | —     | 10 / 15 min      | —       | Login, sets cookie |
| GET    | /auth/me       | ✓     | 60 / min         | 5 min   | Get current user   |
| POST   | /auth/logout   | —     | 60 / min         | —       | Clear cookie       |

### Tasks

| Method | Endpoint    | Auth | Rate limit | Cache  | Description                        |
|--------|-------------|------|------------|--------|------------------------------------|
| GET    | /tasks      | ✓    | 60 / min   | 30 sec | List tasks (paginated, filterable) |
| POST   | /tasks      | ✓    | 60 / min   | busts  | Create task                        |
| GET    | /tasks/:id  | ✓    | 60 / min   | —      | Get single task                    |
| PATCH  | /tasks/:id  | ✓    | 60 / min   | busts  | Update task                        |
| DELETE | /tasks/:id  | ✓    | 60 / min   | busts  | Delete task                        |

### Users (Admin only)

| Method | Endpoint             | Auth  | Cache  | Description           |
|--------|----------------------|-------|--------|-----------------------|
| GET    | /users               | Admin | 60 sec | List all users        |
| PATCH  | /users/:id/make-admin| Admin | busts  | Promote user to admin |

**Role behaviour:** users see only their own tasks; admins see all tasks and all users.

**Cache busts:** any write operation deletes all cached responses for that user so the next read is always fresh.

---

## Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT stored in **HTTP-only, SameSite=Lax** cookie — inaccessible to JavaScript, safe from XSS
- `secure: true` enforced in production (HTTPS only)
- **Rate limiting** — 10 req/15 min on auth endpoints, 60 req/min globally
- Input sanitised and validated with **express-validator** on every route
- CORS restricted to `FRONTEND_URL`
- Helmet sets secure HTTP headers

---

## Making a User an Admin

All registrations default to `user` role. Two ways to promote:

**1. SQL (first admin)**
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```
Run via the Supabase SQL editor after the user registers.

**2. API (admin promoting another user)**
```
PATCH /api/v1/users/:id/make-admin
```
Admin-only, available in the Users page of the frontend.

---

## Scalability Notes

### What's already in place

| Feature | Detail |
|---|---|
| **API versioning** | `/api/v1` — add `/api/v2` without touching existing clients |
| **Modular structure** | New entity = new files in `models/`, `controllers/`, `routes/v1/` + one line in the router |
| **Redis caching** | Per-user response caching with automatic cache busting on writes |
| **Rate limiting** | Brute-force protection on auth, general cap on all API routes |
| **Pagination** | All list endpoints are paginated — safe at any data volume |
| **DB indexes** | `tasks.user_id`, `tasks.status` |
| **Stateless auth** | Cookie-based JWT — no server-side session storage, safe to scale horizontally |

### Next steps for production scale

| Concern | Approach |
|---|---|
| **Horizontal scaling** | App is fully stateless — deploy N instances behind a load balancer (AWS ALB, Nginx) without coordination |
| **Redis cluster** | Swap `ioredis` single-node for Redis Cluster or Upstash (serverless Redis) for HA caching |
| **Structured logging** | Replace `morgan` with Winston + Datadog/Loki for queryable, persistent logs |
| **Microservices** | Auth and Tasks are already isolated by module — clean cut into separate services when traffic warrants it |
| **CI/CD** | GitHub Actions → build Docker image → push to ECR → deploy to ECS / Railway |
