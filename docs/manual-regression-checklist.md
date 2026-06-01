# Manual Regression Checklist — Notes App v1

**Purpose:** Verify US-001 and US-002 before handoff to Code Reviewer / QA.  
**Relates to:** [notes-app-design.md](design/notes-app-design.md), [build-plan.md](build-plan.md)

## Setup

1. From repo root, apply DB migrations (see [src/README.md](../src/README.md)).
2. Terminal 1 — API: `dotnet run --project src/NotesApp.Api --launch-profile https`
3. Terminal 2 — Web: `cd src/notes-app-web && npm install && npm start`
4. Open `http://localhost:4200` (accept API dev certificate if prompted).

Use a private/incognito window for clean-session tests when noted.

### Optional: API smoke script (before UI pass)

With the API running:

```powershell
.\scripts\run-api-smoke.ps1
```

Covers register, create, list, logout/401, login, newest-first, and two-user isolation at the **API** layer. Mark matching **API** columns below when this passes.

| Step | Pass | Fail | Notes |
|------|:----:|:----:|-------|
| API responds at `https://localhost:7014/swagger` | ☐ | ☐ | |
| Angular loads at `http://localhost:4200` | ☐ | ☐ | |

---

## Flow A — First-time user (sign up → notes)

| # | Step | Expected | AC | UI | API |
|---|------|----------|-----|:--:|:--:|
| A1 | Open `/` while signed out | Redirect to **Log in** | US-002 | ☐ | — |
| A2 | Go to **Sign up**, valid email + password (≥ 8 chars) | Lands on **My notes**, signed in | US-002 AC 1 | ☐ | ☐ |
| A3 | New user notes list | **No notes yet** empty state + Create note CTA | US-001 AC 5 | ☐ | — |
| A4 | **New note** → title + body → **Save** | Returns to list; **Note created.** banner | US-001 AC 1 | ☐ | ☐ |
| A5 | List after create | Note visible with **title** and **date** | US-001 AC 2, AC 4 | ☐ | ☐ |

---

## Flow B — Returning user (log in / log out)

| # | Step | Expected | AC | UI | API |
|---|------|----------|-----|:--:|:--:|
| B1 | **Log out** from header | Redirect to **Log in**; `/notes` blocked | US-002 AC 5, AC 6 | ☐ | ☐ |
| B2 | **Log in** with valid credentials | **My notes** loads | US-002 AC 3 | ☐ | ☐ |
| B3 | Refresh page while signed in | Still on notes (session persists) | US-002 | ☐ | — |

---

## Flow C — Additional note

| # | Step | Expected | AC | UI | API |
|---|------|----------|-----|:--:|:--:|
| C1 | Create second note (different title) | New note appears **first** in list | US-001 AC 3 | ☐ | ☐ |

---

## Flow D — Cancel create

| # | Step | Expected | AC | UI | API |
|---|------|----------|-----|:--:|:--:|
| D1 | **New note** → **Cancel** | Back to list; no new note | — | ☐ | — |

---

## Flow E — Validation and errors

| # | Step | Expected | AC | UI | API |
|---|------|----------|-----|:--:|:--:|
| E1 | Sign up with email already registered | “This email is already in use.” | US-002 AC 2 | ☐ | ☐ |
| E2 | Log in with wrong password | “Invalid email or password.” (generic) | US-002 AC 4 | ☐ | ☐ |
| E3 | Create note with empty title (whitespace ok) | “Title is required.”; no save | US-001 AC 6 | ☐ | ☐ |
| E4 | Create note with empty body | “Body is required.”; no save | US-001 AC 6 | ☐ | ☐ |
| E5 | While signed out, open `/notes` | Redirect to **Log in** | US-002 AC 6 | ☐ | — |
| E6 | While signed out, open `/notes/new` | Redirect to **Log in** | US-002 AC 6 | ☐ | — |
| E7 | While signed in, open `/login` | Redirect to **My notes** | — | ☐ | — |

---

## Flow F — Data isolation (two users)

| # | Step | Expected | AC | UI | API |
|---|------|----------|-----|:--:|:--:|
| F1 | User A: create note “A-only” | Visible in A’s list | US-001 AC 2 | ☐ | ☐ |
| F2 | User B: separate account, create “B-only” | B sees only B’s note | US-001 AC 7, US-002 AC 7 | ☐ | ☐ |
| F3 | User A list again | Still only A’s notes (not B’s) | US-001 AC 7 | ☐ | ☐ |

---

## Acceptance criteria sign-off

| ID | Criterion | Verified |
|----|-----------|:--------:|
| US-002 AC 1 | Sign up creates account and signs in | ☐ |
| US-002 AC 2 | Duplicate email rejected | ☐ |
| US-002 AC 3 | Login success | ☐ |
| US-002 AC 4 | Invalid credentials message | ☐ |
| US-002 AC 5 | Logout clears session | ☐ |
| US-002 AC 6 | Unauthenticated cannot use notes | ☐ |
| US-002 AC 7 | Actions tied to account / isolation | ☐ |
| US-001 AC 1 | Create note + confirmation | ☐ |
| US-001 AC 2 | List shows all own notes | ☐ |
| US-001 AC 3 | Newest first | ☐ |
| US-001 AC 4 | Title (+ date) on each row | ☐ |
| US-001 AC 5 | Empty state | ☐ |
| US-001 AC 6 | Title/body validation | ☐ |
| US-001 AC 7 | No cross-user notes | ☐ |

---

## Out of scope (confirm NOT implemented)

- ☐ Password reset / forgot password  
- ☐ Email verification  
- ☐ OAuth / social login  
- ☐ Edit or delete notes  
- ☐ Search, filter, folders, tags  
- ☐ Note detail view from list  

---

## Sign-off

| Role | Name | Date | Result |
|------|------|------|--------|
| Engineer | | | ☐ Pass / ☐ Fail |
| Reviewer / QA | | | ☐ Pass / ☐ Fail |

**Handoff artifacts:** `src/NotesApp.Api`, `src/notes-app-web`, `docs/stories/`, `docs/adr/`, `docs/design/`.

---

## Engineer notes (Phase 7)

- **Task 29:** This checklist + `scripts/run-api-smoke.ps1` for repeatable API verification.  
- **Task 30:** [README.md](../README.md) (repo root) and [src/README.md](../src/README.md) (runbook).  
- **Task 31:** Optional automated test project — **not** included for v1; use manual checklist + API smoke script instead.
