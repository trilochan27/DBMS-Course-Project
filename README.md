# Transport Management Dashboard

**Presentation-III UI** for the DBMS course project:
*"Design and Implementation of a Database Management System for School Transport Route and Student Pickup Management System"*

A full-stack dashboard (React + Vite frontend, Node/Express backend, MySQL database) that connects
live to your existing, already-populated `school_transport_db` database. It does **not** modify,
recreate, or redesign your schema — it only reads from and writes to it through parameterized queries.

---

## Features

- **Live Dashboard** — real counts for every table, pulled from MySQL on every load.
- **Students page** — the main demo screen:
  - **View**: searchable, filterable, paginated table straight from `SELECT ... FROM student`.
  - **Insert**: "Add Student" modal with validation, duplicate-ID prevention, and a one-click
    "Load Demo Student" button that pre-fills the `S286 / Trilochan Demo` record from the brief.
  - **Delete**: confirmation dialog, with safe handling — a student with related
    `student_transport` / `pickup_record` / `transport_fee` rows cannot be silently deleted.
- **Transport page** — the full 5-table JOIN (student → pickup → route → bus → driver).
- **Routes page** — route cards with ordered stops and a live bus-capacity progress bar.
- **Buses, Pickup & Drop Points, Pickup Records, Transport Fees** — dedicated views, all backed
  by real SQL queries with status badges, search and pagination where relevant.
- Toast notifications, loading skeletons, empty states, and a live MySQL connection indicator
  in the top bar.

No mock data, no hard-coded counts — every number and row on screen comes from a live API call.

---

## Tech Stack

**Frontend:** React 18, Vite, React Router, Lucide icons, plain modern CSS (no framework).
**Backend:** Node.js, Express, `mysql2/promise`, `dotenv`, `cors`.
**Database:** MySQL (your existing `school_transport_db` — untouched).

---

## Project Structure

```
dbms-transport-ui/
├── backend/
│   ├── server.js            # Express entry point, health check, route mounting
│   ├── db/pool.js           # mysql2 connection pool (env-based)
│   ├── controllers/         # one file per resource, real SQL in every handler
│   ├── routes/              # Express routers
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, Students, Transport, Routes, Buses, ...
│   │   ├── components/      # Sidebar, Topbar, Modal, ConfirmDialog, Toast, ...
│   │   ├── api.js           # fetch wrapper for every backend endpoint
│   │   └── index.css        # the entire design system
│   ├── index.html
│   ├── vite.config.js       # dev-server proxy: /api -> http://localhost:5000
│   └── package.json
├── README.md
└── .gitignore
```

---

## 1. Database Setup

This project assumes `school_transport_db` already exists in your MySQL server with the 9 tables
described in the brief (`driver`, `bus`, `route`, `pickup_point`, `drop_point`, `student`,
`student_transport`, `pickup_record`, `transport_fee`) and is already populated. **No schema
changes are made by this application.**

If your `pickup_point` / `drop_point` tables don't yet have a `stop_order` column that the
Routes and Pickup & Drop Points pages rely on, add it to match your existing data model — this
app only reads it, it never creates it for you.

Just make sure:
- MySQL is running.
- You know the host, port, username, password, and database name.

---

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your real credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_transport_db
DB_PORT=3306
PORT=5000
```

Run it:

```bash
npm run dev
```

You should see:

```
🚍  Transport Dashboard API running on http://localhost:5000
✅  MySQL connection established
```

Verify manually: open `http://localhost:5000/api/health` — it should return
`{"success":true,"server":"running","database":"connected"}`.

---

## 3. Frontend Setup

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (typically `http://localhost:5173`). The Vite dev server proxies every
`/api/*` request to the backend on port 5000, so no extra configuration is needed.

---

## 4. Environment Variables

| Variable      | Location        | Description                              |
|---------------|------------------|-------------------------------------------|
| `DB_HOST`     | `backend/.env`   | MySQL host                                |
| `DB_USER`     | `backend/.env`   | MySQL username                            |
| `DB_PASSWORD` | `backend/.env`   | MySQL password (never hard-coded)         |
| `DB_NAME`     | `backend/.env`   | `school_transport_db`                     |
| `DB_PORT`     | `backend/.env`   | Usually `3306`                            |
| `PORT`        | `backend/.env`   | Backend API port (default `5000`)         |

`backend/.env` is gitignored. Only `.env.example` (no real password) is committed.

---

## API Endpoints

| Method | Endpoint                     | Description                                      |
|--------|-------------------------------|---------------------------------------------------|
| GET    | `/api/health`                 | Backend + MySQL connectivity check                |
| GET    | `/api/dashboard/stats`        | Live counts for all 9 tables                      |
| GET    | `/api/students`                | Paginated, searchable, filterable student list    |
| GET    | `/api/students/courses`        | Distinct course list (for the filter dropdown)    |
| GET    | `/api/students/:id`            | Single student                                    |
| POST   | `/api/students`                | Insert a new student (validated, duplicate-safe)  |
| DELETE | `/api/students/:id`            | Delete a student (blocked if dependents exist)    |
| GET    | `/api/transport`               | 5-table JOIN: student → pickup → route → bus → driver |
| GET    | `/api/routes`                  | Routes with ordered stops                         |
| GET    | `/api/routes/capacity`         | Bus capacity vs. assigned students per route       |
| GET    | `/api/buses`                   | Buses with assigned driver                         |
| GET    | `/api/pickup-points`           | Pickup & drop points grouped by route              |
| GET    | `/api/pickup-records`          | Paginated pickup status log                         |
| GET    | `/api/transport-fees`          | Paginated fee records                               |

Every handler uses parameterized queries (`?` placeholders via `mysql2`), returns proper HTTP
status codes (`400` validation, `404` not found, `409` conflict/duplicate, `500` server/DB error),
and never swallows a MySQL error silently.

---

## Presentation Demo Sequence (10 minutes)

1. **Dashboard** — open the app, show the live stat cards. Mention they're fetched fresh from
   MySQL on every load (not hard-coded).
2. **Students → View** — navigate to Students. Point out the real 285 records, try the search box,
   filter by Course, flip a page.
3. **Students → Insert**
   - Click **"Load Demo Student"** (pre-fills `S286 / Trilochan Demo`), or **"Add Student"** and
     type the values manually.
   - Submit → success toast → modal closes → `S286` appears at the top highlighted row →
     **Dashboard** student count goes from 285 to 286 on next visit/refresh.
   - *(Optional but convincing)* Run `SELECT * FROM student WHERE student_id = 'S286';` in your
     MySQL client side-by-side to show it's really there.
4. **Students → Delete**
   - Click the delete icon on the `S286` row → confirm in the dialog → success toast → row
     disappears → count drops back to 285.
   - Re-run the `SELECT` in MySQL to show it's gone.
5. **Transport page** — show the live JOIN across 5 tables for real assigned students.
6. **Routes page** — show the capacity bars (e.g. `R001 40/40`) computed live by a `GROUP BY`
   aggregation query, plus the ordered stop list per route.
7. Briefly tour **Buses**, **Pickup & Drop Points**, **Pickup Records**, and **Transport Fees** to
   show the remaining tables are all wired to real data with status badges.

---

## Screenshots to Capture

1. Dashboard with live stat cards.
2. Students table showing the full, searchable, paginated list.
3. "Add Student" modal filled with the `S286` demo data.
4. Success toast + `S286` row highlighted in the table (post-insert).
5. MySQL client showing `SELECT * FROM student WHERE student_id='S286';` with a result row.
6. Delete confirmation dialog for `S286`.
7. Success toast after deletion + `S286` gone from the table.
8. MySQL client showing the same `SELECT` now returning 0 rows.
9. Transport page with the full JOIN table.
10. Routes page showing capacity bars and ordered stops.

---

## Safety Notes

- **No CASCADE deletes** are added or assumed. If a student has rows in `student_transport`,
  `pickup_record`, or `transport_fee`, the DELETE endpoint returns `409 Conflict` with the message
  *"This student has related transport records. Delete dependent records first."* — it never
  silently removes real student data.
- All SQL uses prepared statements (`?` placeholders) — no string concatenation, no SQL injection
  surface.
- Database credentials live only in `backend/.env`, which is gitignored. The frontend never sees
  them — it only talks to `/api/*` on the backend.

---

## Troubleshooting

- **"DB Offline" pill in the top bar / "Unable to connect to database" toasts** — check that
  MySQL is running and that `backend/.env` has the correct credentials, then restart
  `npm run dev` in `backend/`.
- **CORS errors in the browser console** — make sure the backend is running on port 5000 (or
  update `vite.config.js`'s proxy target if you changed `PORT`).
- **Empty tables everywhere** — confirm `DB_NAME` in `.env` matches your populated database
  exactly (`school_transport_db`), and that you're pointing at the right MySQL instance/port.
