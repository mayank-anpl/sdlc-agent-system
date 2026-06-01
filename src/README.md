# Notes App — source

## Prerequisites

| Tool | Check | Install |
|------|--------|---------|
| .NET 8+ SDK (`net8.0` target) | `dotnet --version` | [.NET download](https://dotnet.microsoft.com/download) |
| EF Core CLI | `dotnet ef --version` | `dotnet tool install --global dotnet-ef` |
| Node.js LTS | `node --version` | [nodejs.org](https://nodejs.org/) |
| Angular CLI 18 (optional) | `npx @angular/cli@18 version` | `npm install -g @angular/cli@18` |

## Projects

| Path | Stack |
|------|--------|
| `NotesApp.Api/` | ASP.NET 8 Web API, SQLite (`notes.db`) |
| `notes-app-web/` | Angular 18 SPA |

Solution: `NotesApp.slnx`

---

## First-time setup (fresh clone)

Run from the **repository root** unless noted.

### 1. Restore and migrate database

```bash
dotnet restore src/NotesApp.slnx
dotnet ef database update --project src/NotesApp.Api
```

Creates `src/NotesApp.Api/notes.db` with Identity and `Notes` tables.  
(Migrations already exist in `NotesApp.Api/Data/Migrations/` — you do **not** need `migrations add` unless changing the model.)

### 2. Install frontend dependencies

```bash
cd src/notes-app-web
npm install
cd ../..
```

### 3. Trust dev HTTPS certificate (once per machine)

```bash
dotnet dev-certs https --trust
```

---

## Run locally (every day)

Use **two terminals**.

### Terminal 1 — API (HTTPS)

From repo root:

```bash
dotnet run --project src/NotesApp.Api --launch-profile https
```

| Item | Value |
|------|--------|
| HTTPS | `https://localhost:7014` |
| HTTP | `http://localhost:5138` |
| Swagger | `https://localhost:7014/swagger` |

### Terminal 2 — Angular

```bash
cd src/notes-app-web
npm start
```

| Item | Value |
|------|--------|
| App | `http://localhost:4200` |

### End-to-end smoke test

1. Open `http://localhost:4200` → **Log in** page.  
2. **Sign up** → empty **My notes** → **New note** → save → note appears with **Note created.** banner.  
3. API smoke (optional): `.\scripts\run-api-smoke.ps1` from repo root.  
4. Full checklist: [docs/manual-regression-checklist.md](../docs/manual-regression-checklist.md).

---

## Configuration

### API base URL (Angular)

`notes-app-web/src/environments/environment.development.ts`:

- `apiBaseUrl`: `https://localhost:7014` (must match API HTTPS port)

### CORS and cookies (dev)

- Angular origin: `http://localhost:4200`  
- API CORS: `WithOrigins("http://localhost:4200")` + `AllowCredentials()` — **no wildcard** with credentials  
- Auth cookie: `NotesApp.Auth`, **HttpOnly**, **Secure**, **SameSite=None** in Development (cross-origin SPA → API)  
- Angular `HttpClient` uses `withCredentials: true` (see `provideApiClient()`)

If you see **401 on every request**, check API is on HTTPS, CORS origin matches, and the browser sends cookies (DevTools → Network → request → Cookies).

### Identity (v1)

- `RequireConfirmedAccount` / `RequireConfirmedEmail`: **false** (no email verification flow)

---

## API reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account + sign in |
| POST | `/api/auth/login` | No | Sign in |
| POST | `/api/auth/logout` | Yes | Sign out |
| GET | `/api/auth/me` | Yes | `{ id, email }` |
| GET | `/api/notes` | Yes | List own notes (newest first) |
| POST | `/api/notes` | Yes | `{ title, body }` — `userId` from session only |

Sample HTTP file: `NotesApp.Api/NotesApp.Api.http`

---

## Angular routes

| Path | Guard | Screen |
|------|-------|--------|
| `/login` | guest | Log in |
| `/signup` | guest | Sign up |
| `/notes` | auth | Notes list |
| `/notes/new` | auth | Create note |
| `/notes?created=true` | auth | List + success banner |

---

## Build

```bash
dotnet build src/NotesApp.slnx
cd src/notes-app-web && npm run build
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| 401 on all API calls from UI | CORS/cookie misconfig | API running with HTTPS profile; only `localhost:4200` in CORS; `withCredentials` enabled |
| `dotnet run` file locked | Previous API still running | Stop `NotesApp.Api` process |
| `GET /api/notes` 500 (SQLite) | Old build before sort fix | Pull latest; list sorts in memory after fetch |
| EF “no migrations” | DB never updated | `dotnet ef database update --project src/NotesApp.Api` |
| Angular SSL errors | Untrusted dev cert | `dotnet dev-certs https --trust` |

---

## Known limitations (v1)

- No password reset, email verification, OAuth, MFA  
- No edit/delete note, search, folders, or note detail from list  
- No pagination on notes list  
- SQLite single-file DB (fine for v1; not for high concurrent write load)

---

## Handoff

Code Reviewer / QA: run [docs/manual-regression-checklist.md](../docs/manual-regression-checklist.md) and confirm all US-001 / US-002 acceptance criteria.
