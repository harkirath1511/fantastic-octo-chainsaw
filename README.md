# TaskFlow — REST API with Auth & Role-Based Access

A full-stack task management app built with Node.js, PostgreSQL (Supabase), and React.

---

## Stack

| Layer         | Tech                                        |
|---------------|---------------------------------------------|
| Backend       | Node.js, Express, PostgreSQL (via Supabase) |
| Auth          | JWT in HTTP-only cookies (bcrypt + JWT)     |
| Caching       | Redis via ioredis (optional)                |
| Rate Limiting | express-rate-limit                          |
| Frontend      | React (Vite), Axios                         |
| Docs          | Swagger UI (`/api-docs`)                    |
| Container     | Docker (backend), docker-compose (Redis)    |

---

## Project Structure

```
├── docker-compose.yml         # Redis container only
├── TaskFlow.postman_collection.json
├── backend/
│   ├── Dockerfile             # Node.js app image
│   ├── env.example
│   └── src/
│       ├── config/            # DB (pg), Redis (ioredis), Swagger, schema.sql
│       ├── controllers/       # auth, task, user
│       ├── middleware/        # authenticate, authorize, cache, rateLimit, validate
│       ├── models/            # user.model, task.model
│       ├── routes/v1/         # auth, tasks, users, index
│       ├── utils/             # jwt, response
│       └── validators/        # auth.validator, task.validator
└── frontend/
    └── src/
        ├── api/               # axios instance, auth, tasks, users
        ├── context/           # AuthContext (cookie-based session rehydration)
        ├── components/        # Navbar, TaskCard, TaskModal
        └── pages/             # Login, Register, Dashboard, Users, NotFound
```

---

## Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- Docker Desktop (only needed to run Redis)

### 1. Database

Paste `backend/src/config/schema.sql` into the **Supabase SQL editor** and run it. This creates the `users` and `tasks` tables with indexes and triggers.

---

### 2. Backend

```bash
cd backend
cp env.example .env    # fill in your values
npm install
npm run dev            # http://localhost:5000
```

**`backend/.env`**
```env
PORT=5000
NODE_ENV=development

# Supabase connection string — append ?family=4 to force IPv4
DATABASE_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres?family=4

JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173

# Redis — run docker-compose up redis to start it locally
# Leave empty to disable caching entirely
REDIS_URL=redis://localhost:6379
```

---

### 3. Redis (optional)

Redis is used for caching. If `REDIS_URL` is empty, the app works normally without caching.

To run Redis locally via Docker:

```bash
# from repo root
docker-compose up redis
```

This starts Redis on `localhost:6379` using a persistent named volume. Keep this running alongside `npm run dev`.

---

### 4. Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## API Reference

Base URL: `http://localhost:5000/api/v1`  
Interactive docs: `http://localhost:5000/api-docs`  
Postman: import `TaskFlow.postman_collection.json`

### Auth

| Method | Endpoint        | Auth | Rate limit  | Cache  | Description          |
|--------|-----------------|------|-------------|--------|----------------------|
| POST   | /auth/register  | —    | 10 / 15 min | —      | Register new user    |
| POST   | /auth/login     | —    | 10 / 15 min | —      | Login, sets cookie   |
| GET    | /auth/me        | ✓    | 60 / min    | 5 min  | Get current user     |
| POST   | /auth/logout    | —    | 60 / min    | —      | Clear session cookie |

### Tasks

| Method | Endpoint     | Auth | Rate limit | Cache  | Description                        |
|--------|--------------|------|------------|--------|------------------------------------|
| GET    | /tasks       | ✓    | 60 / min   | 30 sec | List tasks (paginated, filterable) |
| POST   | /tasks       | ✓    | 60 / min   | busts  | Create task                        |
| GET    | /tasks/:id   | ✓    | 60 / min   | —      | Get single task                    |
| PATCH  | /tasks/:id   | ✓    | 60 / min   | busts  | Update task                        |
| DELETE | /tasks/:id   | ✓    | 60 / min   | busts  | Delete task                        |

### Users (Admin only)

| Method | Endpoint              | Auth  | Cache  | Description            |
|--------|-----------------------|-------|--------|------------------------|
| GET    | /users                | Admin | 60 sec | List all users         |
| PATCH  | /users/:id/make-admin | Admin | busts  | Promote user to admin  |

**Role behaviour:** users see only their own tasks; admins see all tasks and all users.  
**Cache busts:** any write deletes all cached responses for that user so the next read is always fresh.  
**Query params for `GET /tasks`:** `status`, `priority`, `page`, `limit`

---

## Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT stored in **HTTP-only, SameSite=Lax** cookie — inaccessible to JS, safe from XSS
- `secure: true` enforced in production (HTTPS only)
- **Rate limiting** — 10 req / 15 min on auth endpoints; 60 req / min globally
- Input sanitised and validated with **express-validator** on every route
- CORS restricted to `FRONTEND_URL`
- **Helmet** sets secure HTTP response headers

---

## Making a User an Admin

All registrations default to `user` role. Two ways to promote:

**1. SQL — first admin setup**
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```
Run once in the Supabase SQL editor after the user registers.

**2. API — admin promotes another user**
```
PATCH /api/v1/users/:id/make-admin
```
Admin-only. Also available via the Users page in the frontend.

---

## Docker

The `Dockerfile` builds the Node.js backend into a standalone image.  
The `docker-compose.yml` runs **Redis only** — the backend connects to Supabase directly so no local Postgres is needed.

```bash
# Start Redis container (keep running alongside npm run dev)
docker-compose up redis

# Or build and run just the backend image manually
docker build -t taskflow-api ./backend
docker run -p 5000:5000 --env-file ./backend/.env taskflow-api
```

---

## Scalability Notes

### Already in place

| Feature | Detail |
|---|---|
| **API versioning** | `/api/v1` — add `/api/v2` without breaking existing clients |
| **Modular structure** | New entity = files in `models/`, `controllers/`, `routes/v1/` + one line in the router |
| **Redis caching** | Per-user response cache, auto-busted on writes, gracefully disabled without Redis |
| **Rate limiting** | Brute-force protection on auth, general cap on all routes |
| **Pagination** | All list endpoints paginated — safe at any data volume |
| **DB indexes** | `tasks.user_id`, `tasks.status` |
| **Stateless auth** | Cookie JWT — no server-side sessions, safe to scale horizontally |

### Next steps for production

| Concern | Approach |
|---|---|
| **Horizontal scaling** | Fully stateless — deploy N instances behind AWS ALB or Nginx |
| **Redis HA** | Swap to Redis Cluster or [Upstash](https://upstash.com) (serverless Redis) |
| **Structured logging** | Replace `morgan` with Winston + Datadog / Loki |
| **Microservices** | Auth and Tasks are module-isolated — clean cut into separate services when needed |
| **CI/CD** | GitHub Actions → build Docker image → push to ECR → deploy to ECS / Railway |
