# FloodWatch: Flood Management System (MERN)

A web platform for flood alerts, community incident reporting and response coordination.
Built from the project presentation by Shivangi Singh, Shivam Upadhyay, Shaurya Singh and Satyam Upadhyay.

**Stack:** MongoDB, Express.js, React (Vite), Node.js.

> This is a student prototype, not an official emergency service. The app shows this disclaimer on every page.

## What is in the project

| Module from the slides | Where it lives |
|---|---|
| User and authentication (register, login, roles) | `server/src/routes/auth.js`, `client/src/pages/Login.jsx`, `Register.jsx` |
| Flood alerts (feed, severity, affected location) | `server/src/routes/alerts.js`, `client/src/pages/Alerts.jsx` |
| Incident reporting (water level, photo, location, description) | `server/src/routes/incidents.js`, `client/src/pages/Report.jsx` |
| Help and rescue requests | `server/src/routes/requests.js`, `client/src/pages/Help.jsx` |
| Admin dashboard (review, prioritise, update, filter, search) | `client/src/pages/Manage.jsx` |
| Reports and analytics (counts, trends, affected areas) | `server/src/routes/stats.js`, `client/src/pages/Dashboard.jsx` |

**Workflow:** a resident submits a report, the API validates it, MongoDB stores it with a status and timestamp, a responder or admin reviews it, and the resident sees the progress.
**Status flow:** Submitted → Under Review → Assigned → Resolved (every change is recorded in the record's `history`).

## Roles

| Role | Can do |
|---|---|
| Visitor | Read active alerts |
| Resident | Everything above, plus submit reports and help requests, and see only their own |
| Responder | See all reports and requests, change status, priority and assignee, publish and withdraw alerts |
| Admin | Everything a responder can, plus delete alerts |

Public registration always creates a resident. To promote someone, change `role` on their user document in MongoDB.

## Run it

You need Node 20+ and MongoDB (local, or an Atlas connection string).

```bash
npm run install:all                 # installs root, server and client dependencies
cp server/.env.example server/.env  # then edit MONGO_URI and set a long random JWT_SECRET
npm run seed                        # optional demo data (wipes the database, refuses to run in production)
npm run dev                         # API on :5000, web app on :5173
```

Demo logins created by the seed script:

| Role | Email | Password |
|---|---|---|
| Admin | admin@floodwatch.test | Admin@12345 |
| Responder | responder@floodwatch.test | Responder@123 |
| Resident | resident@floodwatch.test | Resident@123 |

## API

| Method and path | Access | Purpose |
|---|---|---|
| `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` | public / signed in | Accounts |
| `GET /api/alerts` | public | Active alerts |
| `GET /api/alerts/all`, `POST /api/alerts`, `PATCH /api/alerts/:id` | staff | Manage alerts |
| `DELETE /api/alerts/:id` | admin | Remove an alert |
| `POST /api/incidents` (multipart, optional `photo`) | signed in | Submit an incident |
| `GET /api/incidents?status=&priority=&q=` | signed in | Own records (residents) or all (staff) |
| `PATCH /api/incidents/:id` | staff | Update `status`, `priority`, `assignedTo` |
| `POST /api/requests`, `GET /api/requests`, `PATCH /api/requests/:id` | as above | Help requests |
| `GET /api/stats` | signed in | Dashboard counts and analytics |
| `GET /api/health` | public | Uptime and database status |

## Security and reliability checklist (from the slides)

- **Authentication:** passwords hashed with bcrypt (cost 12); JWT bearer tokens that expire after `JWT_EXPIRES_IN`.
- **Authorization:** role checks on the server for every protected route (the client only hides links).
- **Validation:** `express-validator` on every input, which also rejects NoSQL operator injection such as `{"$gt": ""}`; uploads limited to one JPG, PNG or WebP up to 3 MB with random file names; Helmet headers; CORS limited to `CLIENT_ORIGIN`; rate limiting on `/api/auth`.
- **Backups:** `mongodump --uri "$MONGO_URI" --out backups/$(date +%F)` and test with `mongorestore`. On Atlas, enable scheduled snapshots.
- **Monitoring:** request logging with Morgan and the `/api/health` endpoint for uptime checks.
- **Emergency disclaimer:** shown in the footer and on the report and help forms.

## Deploying

`npm run build` creates `client/dist`. Host it on any static host and set `VITE_SERVER_URL` to the API origin at build time, and set `CLIENT_ORIGIN` on the server to the web app's origin. Uploaded photos are stored on the server's disk (`server/uploads`); use object storage (S3 and similar) if the host has an ephemeral disk.

## Future scope (not built yet)

Live map integration, weather and river-level APIs, SMS/email/push notifications, offline-friendly mobile experience, and AI risk insights using verified data.
