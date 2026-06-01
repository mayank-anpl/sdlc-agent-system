# Build Plan: Notes App v1

**Status:** Ready to execute  
**Date:** 2026-06-01  
**Relates to:** US-001, US-002, ADR-001, ADR-002, ADR-003, [notes-app-design.md](design/notes-app-design.md)

## How to use this plan

- Execute tasks **in order**; do not skip scaffolding or auth before notes.
- After **each** task: build/run the affected project(s) and complete the **Verify** step before continuing.
- **No code** is written in this document; implementation follows stories, ADRs, design spec, and `.cursor/rules/00-project.mdc`.
- Label verification **manual** unless a test project exists and tests are written for that task.

## Prerequisites (before Task 1)

Confirm tooling is installed; if any are missing, install and re-check:

| Tool | Purpose |
|------|---------|
| .NET 8 SDK | ASP.NET API, EF Core |
| `dotnet-ef` global tool | EF migrations |
| Node.js LTS + npm | Angular CLI |
| Angular CLI v18 | `ng` scaffold (`npm install -g @angular/cli@18` or use `npx`) |

**Manual verify:** `dotnet --version`, `dotnet ef --version`, `node --version`, `ng version` (or `npx @angular/cli@18 version`).

---

## Phase 1 — Solution scaffolding

### Task 1 — Create repository layout and solution file

**Delivers:** `src/` folder, solution file wiring API + web projects (empty shells acceptable).

**Steps:** Add `NotesApp.sln` (or equivalent) under `src/`; placeholder paths per project rules: `src/NotesApp.Api`, `src/notes-app-web`.

**Verify (manual):** Solution opens; `dotnet build` succeeds (may build empty API only until Angular exists).

**AC:** None (foundation).

---

### Task 2 — Scaffold ASP.NET 8 Web API project

**Delivers:** `src/NotesApp.Api` — Web API template, HTTPS dev profile, `appsettings` with SQLite connection string placeholder (`Data Source=notes.db`), `.gitignore` entry for `*.db` if not already present.

**Verify (manual):** `dotnet run --project src/NotesApp.Api` — API starts; Swagger or minimal health responds.

**AC:** None (foundation).

---

### Task 3 — Scaffold Angular 18 SPA

**Delivers:** `src/notes-app-web` — Angular 18 app with routing, standalone components default, strict TypeScript.

**Verify (manual):** `ng serve` (or npm script) — app at `http://localhost:4200`.

**AC:** None (foundation).

---

### Task 4 — Wire environment config for API base URL

**Delivers:** Angular `environment.ts` / `environment.development.ts` with API base URL (HTTPS dev port from API launchSettings); shared `ApiClient` or `HttpClient` provider pattern documented in README snippet.

**Verify (manual):** Angular builds; no runtime call required yet.

**AC:** None (foundation).

---

## Phase 2 — Data layer and API host configuration

### Task 5 — Add EF Core, SQLite, and Identity packages

**Delivers:** NuGet packages: `Microsoft.AspNetCore.Identity.EntityFrameworkCore`, `Microsoft.EntityFrameworkCore.Sqlite`, `Microsoft.EntityFrameworkCore.Design`; password options (min length 8 per ADR-003).

**Verify (manual):** `dotnet build` succeeds.

**AC:** None (foundation).

---

### Task 6 — Implement `ApplicationUser` and `NotesDbContext`

**Delivers:** `ApplicationUser` extending `IdentityUser`; `NotesDbContext` : `IdentityDbContext<ApplicationUser>` registered in DI; connection to SQLite.

**Verify (manual):** API starts without migration applied (may log DB pending) or with ensure-created only for local smoke — prefer migrations in Task 7.

**AC:** None (foundation).

---

### Task 7 — Initial EF migration (Identity tables only)

**Delivers:** First migration creating Identity schema in SQLite; README or comment with `dotnet ef database update` command.

**Verify (manual):** Run migration; `notes.db` contains Identity tables.

**AC:** None (foundation).

---

### Task 8 — Configure CORS, cookies, and CSRF posture

**Delivers:** CORS policy: `WithOrigins("http://localhost:4200")` + `AllowCredentials()` — **no wildcard origin with credentials**. Cookie auth: **HttpOnly**, **SameSite=Lax**, **Secure** in non-Development (per project rules). Identity: `RequireConfirmedAccount = false`, `RequireConfirmedEmail = false`. Cookie expiration ~30 days sliding (ADR-003). Document CSRF mitigation: SameSite=Lax + credentialed POST only to API (no antiforgery token for JSON API in v1 unless team adds it later).

**Verify (manual):** API starts; no functional auth yet — confirm middleware order placeholder for auth.

**AC:** None (enables US-002).

---

## Phase 3 — Authentication API (US-002 backend)

### Task 9 — Auth DTOs and `AuthController` register endpoint

**Delivers:** `POST /api/auth/register` — email + password; normalize email; create user; **sign in** on success; duplicate email → 400 with clear message.

**Verify (manual):** POST register via Swagger/curl — 200 + `Set-Cookie`; duplicate email → error body matches US-002 AC 2.

**AC:** **US-002 AC 1**, **AC 2** (API side).

---

### Task 10 — Login and logout endpoints

**Delivers:** `POST /api/auth/login` (invalid credentials → generic message); `POST /api/auth/logout` (clears cookie / sign-out).

**Verify (manual):** Login sets cookie; wrong password → same error shape; logout clears session; subsequent protected call returns 401.

**AC:** **US-002 AC 3**, **AC 4**, **AC 5** (API side).

---

### Task 11 — Auth session check endpoint

**Delivers:** `GET /api/auth/me` (or equivalent) — returns 200 with minimal user info when cookie valid, 401 when not (supports Angular guards without guessing).

**Verify (manual):** After login, GET returns authenticated; after logout, 401.

**AC:** Supports **US-002 AC 6** (guard input), **AC 7** (server knows current user).

---

### Task 12 — Placeholder protected endpoint (notes stub)

**Delivers:** Temporary `GET /api/notes` with `[Authorize]` returning empty array OR defer to Task 16 — **prefer** adding `[Authorize]` attribute test on a minimal `NotesController` stub here so cookie auth is proven before Angular work.

**Verify (manual):** Without cookie → 401; with cookie → 200.

**AC:** **US-002 AC 6** (API rejects unauthenticated).

---

## Phase 4 — Authentication UI (US-002 frontend)

### Task 13 — HTTP interceptor / client: `withCredentials: true`

**Delivers:** All API calls send cookies; global error hook for 401 on protected routes (foundation for later tasks).

**Verify (manual):** DevTools shows credentialed requests to API after login.

**AC:** Enables cookie auth (ADR-003).

---

### Task 14 — Auth service and route structure

**Delivers:** `AuthService` (register, login, logout, `getCurrentUser`/`checkSession`); routes: `/login`, `/signup`, `/notes`, `/notes/new`, default redirects per design spec.

**Verify (manual):** Navigate routes; no UI polish required yet.

**AC:** None (wiring).

---

### Task 15 — `authGuard` and `guestGuard`

**Delivers:** Unauthenticated access to `/notes` and `/notes/new` → redirect `/login`; authenticated visit to `/login` or `/signup` → redirect `/notes`.

**Verify (manual):** Direct URL `/notes` while logged out → login page.

**AC:** **US-002 AC 6** (UI side).

---

### Task 16 — Sign Up screen (all states)

**Delivers:** Sign Up component per design spec — client validation, loading, duplicate-email error, success → `/notes`.

**Verify (manual):** Full sign-up flow; lands on notes route (list may be empty or error until notes API exists).

**AC:** **US-002 AC 1**, **AC 2** (E2E UI).

---

### Task 17 — Log In screen (all states)

**Delivers:** Log In component — validation, invalid credentials banner, success → `/notes`; link to Sign Up.

**Verify (manual):** Login existing user; wrong password shows generic message.

**AC:** **US-002 AC 3**, **AC 4** (E2E UI).

---

### Task 18 — App header with Log out (authenticated shell)

**Delivers:** Shared header component; logout calls API then navigates to `/login`.

**Verify (manual):** Logout → cannot access `/notes` without login; API returns 401 on protected stub.

**AC:** **US-002 AC 5** (UI); reinforces **AC 6**.

---

### Task 19 — Notes list shell (placeholder content)

**Delivers:** Notes List route with header + “My notes” + “New note” button; static empty or “loading notes…” until Task 23 — allows auth E2E to have a real landing page.

**Verify (manual):** After sign-up/login, user sees notes shell without errors.

**AC:** Partial **US-001 AC 5** (layout only; empty copy in Task 26).

---

## Phase 5 — Notes data and API (US-001 backend)

### Task 20 — Add `Note` entity and migration

**Delivers:** `Note` model (`Id`, `UserId`, `Title`, `Body`, `CreatedAt`, `UpdatedAt`); FK to user; cascade delete; index `(UserId, CreatedAt)`; second migration.

**Verify (manual):** DB has `Notes` table; migration applies cleanly.

**AC:** Foundation for **US-001 AC 1–7**.

---

### Task 21 — `POST /api/notes` create endpoint

**Delivers:** `[Authorize]` controller; body: title + body only (**never** accept `UserId` from client); set `UserId` from claims; trim and validate non-empty; 201 on success.

**Verify (manual):** Create note as User A via API; inspect DB — `UserId` matches A.

**AC:** **US-001 AC 1** (API), **US-002 AC 7** (ownership on write).

---

### Task 22 — `GET /api/notes` list endpoint

**Delivers:** Returns current user’s notes only, ordered `CreatedAt` descending; DTO with `Id`, `Title`, `CreatedAt` (no body on list per ADR-002).

**Verify (manual):** User B cannot see User A’s notes (two accounts, manual API or DB check).

**AC:** **US-001 AC 2**, **AC 3**, **AC 4**, **AC 7** (API).

---

### Task 23 — Remove notes API stub; wire real controller

**Delivers:** Replace Task 12 stub with production `NotesController`; consistent error shapes (401, 400 validation).

**Verify (manual):** Swagger/curl list + create against authenticated session.

**AC:** Consolidates **US-001** API criteria.

---

## Phase 6 — Notes UI (US-001 frontend)

### Task 24 — Notes service

**Delivers:** `NotesService` — `getNotes()`, `createNote(title, body)` using credentialed HTTP.

**Verify (manual):** Service calls succeed when logged in from browser console or temporary debug button.

**AC:** Wiring for **US-001**.

---

### Task 25 — Notes List: loading, populated, error, retry

**Delivers:** Fetch on init; loading state; list rows (title + formatted date); error banner + Retry; newest first from API order.

**Verify (manual):** Two notes created — newer appears first; failed API shows retry.

**AC:** **US-001 AC 2**, **AC 3**, **AC 4**; partial **AC 1** (confirmation in Task 27).

---

### Task 26 — Notes List: empty state

**Delivers:** “No notes yet” copy + “Create note” CTA per design spec when array empty.

**Verify (manual):** New user after sign-up sees empty state.

**AC:** **US-001 AC 5**.

---

### Task 27 — Create Note screen (all states)

**Delivers:** Form title + body; client validation; Save/Cancel; loading; server errors; 401 → login with message; success navigates to `/notes` with success flag.

**Verify (manual):** Create note → list shows it at top with “Note created.” banner.

**AC:** **US-001 AC 1**, **AC 6**; **US-002 AC 7** (via API).

---

### Task 28 — Route param or state for success banner

**Delivers:** Query param or router state (e.g. `?created=true`) so Notes List shows transient “Note created.” banner (auto-dismiss).

**Verify (manual):** Banner appears once after save; dismiss works.

**AC:** **US-001 AC 1** (confirmation UX).

---

## Phase 7 — End-to-end verification and handoff

### Task 29 — Full regression walkthrough (manual test script)

**Delivers:** Short checklist in `docs/` or PR description covering all flows from design spec (Flows A–E).

**Verify (manual):** Execute checklist once; all US-001 and US-002 ACs marked pass/fail.

| Flow | ACs covered |
|------|-------------|
| Sign up → empty list → create note | US-002 AC 1; US-001 AC 1, 5 |
| Login / logout | US-002 AC 3–5 |
| Duplicate email / bad login | US-002 AC 2, 4 |
| Guard on `/notes` | US-002 AC 6 |
| Two users, isolated lists | US-001 AC 7; US-002 AC 7 |
| Validation on note create | US-001 AC 6 |
| Newest-first list | US-001 AC 3 |

**AC:** Full story coverage sign-off.

---

### Task 30 — README: run locally

**Delivers:** Root or `src/README.md` — start API (HTTPS + migration), start Angular (`4200`), CORS/cookie notes, known limitations (no password reset).

**Verify (manual):** Fresh clone steps work on dev machine.

**AC:** None (developer experience).

---

### Task 31 — (Optional) Test project scaffold

**Delivers:** `NotesApp.Api.Tests` with WebApplicationFactory; one smoke test for register + list notes — **only if** team wants automated verification before QA handoff.

**Verify (automated):** `dotnet test` passes.

**AC:** Regression safety net (not required for v1 definition of done per current repo).

---

## Acceptance criteria coverage matrix

| AC | Introduced (task) | Completed when |
|----|-------------------|----------------|
| US-002 AC 1 | 9, 16 | 16 E2E |
| US-002 AC 2 | 9, 16 | 16 E2E |
| US-002 AC 3 | 10, 17 | 17 E2E |
| US-002 AC 4 | 10, 17 | 17 E2E |
| US-002 AC 5 | 10, 18 | 18 E2E |
| US-002 AC 6 | 12, 15, 22 | 15 UI + 12/22 API |
| US-002 AC 7 | 21, 22 | 22 API + 27 E2E |
| US-001 AC 1 | 21, 27, 28 | 28 E2E |
| US-001 AC 2 | 22, 25 | 25 E2E |
| US-001 AC 3 | 22, 25 | 25 E2E |
| US-001 AC 4 | 22, 25 | 25 E2E |
| US-001 AC 5 | 26 | 26 E2E |
| US-001 AC 6 | 21, 27 | 27 E2E |
| US-001 AC 7 | 22 | 29 two-user test |

---

## Explicitly out of build plan (per stories)

Password reset, email verification, OAuth, edit/delete note, search/filter/sort UI, note detail view, pagination, profile settings, admin tools.

---

## Handoff after Task 29

Deliver to **Code Reviewer** and **QA/SDET:** `src/NotesApp.Api`, `src/notes-app-web`, and this matrix mapping tasks to ACs.
