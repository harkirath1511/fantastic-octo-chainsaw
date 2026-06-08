# TaskFlow — REST API with Auth & Role-Based Access

A full-stack task management app built with Node.js, PostgreSQL (Supabase), and React.

---

## Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Backend  | Node.js, Express, PostgreSQL (via Supabase) |
| Auth     | JWT stored in HTTP-only cookies           |
| Frontend | React (Vite), Axios                       |
| Docs     | Swagger UI (`/api-docs`)                  |

---

## Project Structure

```
├── backend/
│   └── src/
│       ├── config/       # DB connection, Swagger spec, SQL schema
│       ├── controllers/  # Route handlers
│       ├── middleware/   # JWT auth, input validation
│       ├── models/       # DB query layer
│       ├── routes/v1/    # Versioned API routes
│       ├── utils/        # JWT helpers, response helpers
│       └── validators/   # express-validator rule sets
└── frontend/
    └── src/
        ├── api/          # Axios instance + endpoint functions
        ├── context/      # Auth context (session rehydration)
        ├── components/   # Navbar, TaskCard, TaskModal
        └── pages/        # Login, Register, Dashboard, NotFound
```

---

## Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (or any PostgreSQL instance)

### 1. Database

Run the schema against your Postgres database:

```bash
psql "$DATABASE_URL" -f backend/src/config/schema.sql
```

Or paste the contents of `schema.sql` into the Supabase SQL editor.

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # http://localhost:5000
```

**`backend/.env`**

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend

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

### Auth

| Method | Endpoint          | Auth | Description          |
|--------|-------------------|------|----------------------|
| POST   | /auth/register    | —    | Register new user    |
| POST   | /auth/login       | —    | Login, sets cookie   |
| GET    | /auth/me          | ✓    | Get current user     |
| POST   | /auth/logout      | —    | Clear session cookie |

### Tasks

| Method | Endpoint      | Auth | Description                        |
|--------|---------------|------|------------------------------------|
| GET    | /tasks        | ✓    | List tasks (paginated, filterable) |
| POST   | /tasks        | ✓    | Create task                        |
| GET    | /tasks/:id    | ✓    | Get single task                    |
| PATCH  | /tasks/:id    | ✓    | Update task                        |
| DELETE | /tasks/:id    | ✓    | Delete task                        |

### Users (Admin only)

| Method | Endpoint | Auth  | Description     |
|--------|----------|-------|-----------------|
| GET    | /users   | Admin | List all users  |

**Role behaviour:** users see only their own tasks; admins see all tasks across all users.

---

## Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT stored in **HTTP-only, SameSite=Lax** cookie — inaccessible to JavaScript
- `secure: true` enforced in production (HTTPS only)
- Input sanitised and validated with **express-validator** on every route
- CORS restricted to the configured `FRONTEND_URL`
- Helmet sets secure HTTP headers

---

## Making a User an Admin

All registrations default to the `user` role. To promote someone:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Run this once via the Supabase SQL editor or psql after the user registers.

---

## Scalability Notes

### What's already in place
- **API versioning** (`/api/v1`) — add `/api/v2` without breaking existing clients
- **Modular structure** — add a new entity by dropping files in `models/`, `controllers/`, `routes/v1/`; wire in one line in `routes/v1/index.js`
- **Pagination** on all list endpoints — safe at any data volume
- **DB indexes** on `tasks.user_id` and `tasks.status`

### Next steps for production scale

| Concern | Approach |
|---|---|
| **Horizontal scaling** | App is stateless (cookie auth, no in-memory state) — deploy multiple instances behind a load balancer (e.g. AWS ALB) without coordination |
| **Caching** | Add Redis for `/auth/me` and task list responses; cache-invalidate on write |
| **Rate limiting** | Add `express-rate-limit` on auth endpoints to prevent brute force |
| **Logging** | Replace `morgan` with structured logging (Winston + Datadog/Loki) |
| **Microservices** | Split auth and tasks into separate services once team/traffic warrants it; the existing module boundaries make this a clean cut |
| **Docker** | Each service gets a `Dockerfile`; `docker-compose.yml` for local dev with Postgres + Redis |
| **CI/CD** | GitHub Actions → run tests → build Docker image → push to ECR → deploy to ECS/Railway |
