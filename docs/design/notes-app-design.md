# Design Spec: Notes App (v1)

**Status:** Draft
**Date:** 2026-06-01
**Relates to:** US-001, US-002, ADR-001, ADR-002, ADR-003

## Overview

This spec defines the Angular 18 SPA screens, states, and flows for v1: sign up, log in, notes list (including empty state), and create note. Authenticated screens share a simple app header with logout. Unauthenticated users cannot reach note screens; the server enforces the same rules via cookie auth (ADR-003).

---

## Screens

### Sign Up

- **Purpose:** Allow a new user to create an account with email and password and land signed in.
- **Key elements:**
  - Page title: “Create account” (or “Sign up”)
  - Email field (type email, single line)
  - Password field (masked, single line)
  - Primary button: “Sign up”
  - Secondary text link: “Already have an account? Log in” → navigates to Log In
  - Optional short hint under password: “At least 8 characters” (aligns with ADR-003; not a separate complexity checklist)
- **Layout:** Centered column on the page (max width ~400px on desktop). Title at top, fields stacked, primary button full width below fields, log-in link centered under the button. No app header (user is not authenticated).
- **States:**
  - **Default:** Empty fields; primary button enabled; no error messages.
  - **Loading:** After submit, primary button disabled and shows loading label (e.g. “Signing up…”); fields disabled; no duplicate submit.
  - **Validation (client, before API call):**
    - Email empty → inline error on email: “Email is required.”
    - Email format invalid → “Enter a valid email address.”
    - Password empty → inline error on password: “Password is required.”
    - Password fewer than 8 characters → “Password must be at least 8 characters.”
  - **Error (server):** Email already registered → single banner or email-field error: “This email is already in use.” Fields remain editable; user can correct email or go to Log In.
  - **Error (server/network):** Generic banner: “Something went wrong. Please try again.” No indication whether email exists (except duplicate-email case above).
  - **Success:** Account created and session established → navigate to Notes List (no separate “success” screen).
- **Satisfies:** US-002 AC 1, AC 2; supports US-002 assumption (invalid attempts rejected with clear feedback).

---

### Log In

- **Purpose:** Allow an existing user to sign in with email and password.
- **Key elements:**
  - Page title: “Log in”
  - Email field
  - Password field (masked)
  - Primary button: “Log in”
  - Secondary text link: “Don’t have an account? Sign up” → navigates to Sign Up
- **Layout:** Same centered column pattern as Sign Up for consistency.
- **States:**
  - **Default:** Empty fields; primary button enabled.
  - **Loading:** Primary button disabled, label e.g. “Logging in…”; fields disabled.
  - **Validation (client):**
    - Email empty → “Email is required.”
    - Email format invalid → “Enter a valid email address.”
    - Password empty → “Password is required.”
  - **Error (server):** Wrong email or password → single banner (not field-specific): “Invalid email or password.” (US-002 AC 4; do not reveal which field failed.)
  - **Error (server/network):** Generic banner: “Something went wrong. Please try again.”
  - **Success:** Session established → navigate to Notes List.
- **Satisfies:** US-002 AC 3, AC 4.

---

### Notes List (authenticated)

- **Purpose:** Show all of the signed-in user’s notes, newest first; entry point to create a note; access logout.
- **Key elements:**
  - **App header (shared):** Product name (e.g. “Notes”) on the left; **Log out** text button or button on the right.
  - Page heading: “My notes”
  - Primary action: **“New note”** button (prominent, above list or in header area)
  - **Note list:** Each row/card shows at minimum **title** (primary text); secondary line optional: **created date** in human-readable form (e.g. “Jun 1, 2026” or relative “2 days ago”) to help distinguish entries (US-001 AC 4). Body text is **not** shown on the list in v1.
  - Rows are not clickable for a detail view (no note detail screen in v1).
- **Layout:** Full-width content area below fixed app header. Heading and “New note” at top; scrollable list below. List items stacked vertically with clear separation (divider or card). On small screens, same structure; list uses full width with comfortable touch targets.
- **States:**
  - **Loading:** Initial fetch — centered loading indicator or skeleton rows; “New note” may be disabled or enabled per implementation (prefer disabled until first load completes to avoid empty-state flash).
  - **Empty:** No notes for this user — illustration or icon optional; heading text: “No notes yet”; supporting text: “Create your first note to get started.”; primary **“Create note”** button (same destination as “New note”).
  - **Populated (default):** All user’s notes shown, **newest first** (US-001 AC 2, AC 3). Only current user’s notes (enforced by API; UI never shows other users’ data). Each item shows title (+ optional date).
  - **Error:** Failed to load list — banner: “Couldn’t load your notes. Please try again.” with **Retry** control that re-fetches the list.
  - **Success (transient):** After returning from Create Note, optional success banner at top: “Note created.” (dismissible or auto-dismiss ~3–5s) — US-001 AC 1 confirmation.
- **Satisfies:** US-001 AC 2, AC 3, AC 4, AC 5; US-002 AC 5 (logout control present), AC 7 (only own notes shown); US-002 AC 6 enforced by guard + API (user reaches this screen only when signed in).

---

### Create Note (authenticated)

- **Purpose:** Capture a new note with required title and body, save to the user’s account, confirm success, return to list.
- **Key elements:**
  - App header (same as Notes List) with Log out
  - Page title: “New note”
  - **Title** field — single-line text input, label “Title”
  - **Body** field — multiline textarea, label “Body”, tall enough for several lines (e.g. min 6 rows visible)
  - Primary button: **“Save”**
  - Secondary control: **“Cancel”** link or button → returns to Notes List without saving (no confirmation dialog in v1)
- **Layout:** Header fixed; form below heading. Title field full width; body field full width under title; Save and Cancel grouped at bottom of form (Save primary, Cancel secondary left or below).
- **States:**
  - **Default:** Empty title and body; Save enabled (validation runs on submit, not only on blur, unless team adds blur validation consistently).
  - **Loading:** On Save, button disabled, label e.g. “Saving…”; fields disabled.
  - **Validation (client, on Save):** Trim whitespace before check.
    - Title missing or whitespace-only → inline error on title: “Title is required.”
    - Body missing or whitespace-only → inline error on body: “Body is required.”
    - Both invalid → show both messages; do not call API.
  - **Validation (server):** Same rules if API rejects → map to same field messages.
  - **Error:** Save failed (network/500) → banner: “Couldn’t save your note. Please try again.”
  - **Error (session):** 401 from API → clear message: “Your session has expired. Please log in again.” → redirect to Log In (ADR-003).
  - **Success:** Note persisted → navigate to Notes List with success confirmation (banner per Notes List transient success state) — US-001 AC 1.
- **Satisfies:** US-001 AC 1, AC 6; US-002 AC 7 (save associated with signed-in account via API).

---

## User Flows

### Flow A — First-time user (sign up → notes)

1. User opens app (unauthenticated).
2. User lands on **Log In** by default, or app home redirects unauthenticated users to **Log In**.
3. User follows “Sign up” link → **Sign Up**.
4. User enters email + password (≥ 8 characters) → **Sign up**.
5. On success → **Notes List** (empty state).
6. User taps **Create note** or **New note** → **Create Note**.
7. User enters title + body → **Save**.
8. On success → **Notes List** (populated, success banner).

### Flow B — Returning user (log in → notes)

1. Unauthenticated user → **Log In**.
2. Valid credentials → **Notes List** (loading → populated or empty).
3. User may **Log out** from header → session cleared → **Log In**.

### Flow C — Create additional note

1. From **Notes List** (populated) → **New note** → **Create Note**.
2. Save success → **Notes List** (new note appears at top).

### Flow D — Cancel create

1. **Create Note** → **Cancel** → **Notes List** (unchanged).

### Flow E — Validation and auth errors

1. **Sign Up** with existing email → stay on Sign Up, show “already in use.”
2. **Log In** with wrong password → stay on Log In, show “Invalid email or password.”
3. **Create Note** with empty title → stay on form, field errors, no API call.
4. Unauthenticated user navigates directly to `/notes` or `/notes/new` → **route guard** redirects to **Log In** (US-002 AC 6).
5. Signed-in user’s session expires during **Notes List** load or **Create Note** save → error message → **Log In**.

### Flow F — Sign up / log in cross-links

- **Sign Up** ↔ **Log In** via footer links only (no header on auth screens).

### Default routes (recommended)

| Condition | Route behavior |
|-----------|----------------|
| Signed out, visits `/` | Redirect to **Log In** |
| Signed in, visits `/` | Redirect to **Notes List** |
| Signed out, visits protected route | Redirect to **Log In** |
| Signed in, visits `/login` or `/signup` | Redirect to **Notes List** |

---

## Shared Components & Patterns

### App header (authenticated only)

- Left: app name (“Notes”), non-clickable or links to Notes List.
- Right: **Log out** — on click, call logout API, then navigate to **Log In** regardless of API timing (optimistic UI acceptable if errors show a brief retry message).

### Auth pages (Sign Up, Log In)

- No app header; visually distinct “auth card” centered on a neutral background.
- Consistent field styling: visible labels above inputs (not placeholder-only labels).
- Primary button: full width in auth column.
- Errors: form-level banner for server errors; inline text under field for validation.

### Forms

- Required fields marked in label text (e.g. “Email” with required implied via validation messages) or optional “(required)” in label.
- Disable autocomplete abuse where sensible: `autocomplete="email"` / `current-password` / `new-password` as appropriate.
- Password fields always `type="password"` with no show/hide toggle required in v1.

### Buttons

- One primary action per screen (Sign up, Log in, Save, New note / Create note).
- Secondary: text links for navigation between auth screens; Cancel on Create Note.

### Feedback

- **Inline validation:** red text below field; do not rely on color alone (include text).
- **Banners:** top of content area for server/network errors and success after note create.
- **Loading:** disable duplicate submission; change button label.

### List behavior

- Order: **newest `CreatedAt` first** (fixed; no sort UI in v1).
- No pagination UI in v1; single scrollable list.

---

## Accessibility & Responsiveness

- Every input has an associated `<label>` (or `aria-label` if design system uses floating labels with explicit accessible name).
- Logical focus order: top to bottom within each form; focus moves to first error on failed submit.
- Keyboard: Tab through fields and buttons; Enter on auth forms submits if valid.
- Log out and primary actions are reachable and activatable via keyboard.
- Error messages associated with fields via `aria-describedby` where possible.
- Color contrast: error and success states meet WCAG AA against background; errors are not color-only.
- **Responsive:** Auth column and form fields use full width on viewports &lt; 480px with horizontal padding 16–24px. List rows min height ~48px for touch. Header remains single row; on very narrow screens app name may truncate before Log out is hidden.

---

## Acceptance Criteria Traceability

| Criterion | Screen / behavior |
|-----------|-------------------|
| US-002 AC 1 | Sign Up success → Notes List |
| US-002 AC 2 | Sign Up error: email already in use |
| US-002 AC 3 | Log In success → Notes List |
| US-002 AC 4 | Log In error: invalid credentials banner |
| US-002 AC 5 | Log out in header → Log In |
| US-002 AC 6 | Route guard: protected routes → Log In |
| US-002 AC 7 | API-scoped data; UI only shows list returned for session |
| US-001 AC 1 | Create Note Save success → list + confirmation |
| US-001 AC 2 | Notes List populated shows all own notes |
| US-001 AC 3 | List order newest first |
| US-001 AC 4 | Each row shows title (+ optional date) |
| US-001 AC 5 | Notes List empty state + Create note CTA |
| US-001 AC 6 | Create Note validation for title/body |
| US-001 AC 7 | Server-only isolation; no UI for other users’ notes |

---

## Out of Scope

- Password reset, “Forgot password,” email verification
- OAuth / social login
- Note detail, edit, or delete
- Search, filter, sort controls, folders, tags
- Rich text, attachments, markdown preview
- User profile, account settings, change email
- Pagination or infinite scroll
- Showing note body on the list or opening a note from the list
- Remember-me checkbox (session length is server-defined per ADR-003)
- Registration of password complexity beyond minimum 8 characters

---

## Open Questions

- None for v1
