# ADR-003: Authentication, Password Storage, and Sessions

**Status:** Proposed
**Date:** 2026-06-01
**Relates to:** US-002, US-001, ADR-001, ADR-002

## Context

US-002 requires email/password sign-up, login, logout, and blocking unauthenticated note access. US-001 requires every note operation to run under the signed-in account. Stories exclude password reset, email verification, OAuth, and MFA for v1.

The frontend is **Angular 18**; the backend is **ASP.NET 8**. The SPA must not be the source of trust for identity—only the API may decide who is signed in.

## Decision

We will use **ASP.NET Core Identity** on the API for user management and **cookie-based authentication** suitable for a browser SPA.

### Password storage

- Passwords are hashed by **ASP.NET Core Identity’s `PasswordHasher`** (PBKDF2-based; framework default). **Plain-text passwords are never stored or logged.**
- v1 password policy: **minimum 8 characters**; require digit and non-alphanumeric optional (keep policy simple—at minimum length + required password on sign-up).

### Sign-up

- Public API endpoint (e.g. `POST /api/auth/register`) accepts email and password.
- Normalize email (trim, lowercase) before uniqueness check.
- On duplicate email: return a clear error that the email is already in use (US-002 AC 2).
- On success: create Identity user and **sign the user in** (establish auth cookie) so they are immediately signed in (US-002 AC 1).

### Login

- Endpoint (e.g. `POST /api/auth/login`) accepts email and password.
- On success: issue auth cookie via `SignInManager.PasswordSignInAsync` (or equivalent).
- On failure: return a generic **invalid credentials** message for wrong email or wrong password (US-002 AC 4).

### Logout

- Endpoint (e.g. `POST /api/auth/logout`) calls Identity **sign-out**, which clears the authentication cookie (US-002 AC 5).

### Sessions (browser)

- Use Identity’s **application cookie** authentication scheme:
  - **HTTP-only** cookie
  - **Secure** in non-development environments
  - **SameSite** appropriate for SPA + API (typically `Lax` or `None` with `Secure` if cross-site in production—prefer same-site deployment when possible)
- Angular sends requests with **`withCredentials: true`** so the cookie is included.
- API configures **CORS** to allow the Angular origin and **credentials**.
- Session persists until logout or cookie expiration (US-002 assumption). Set cookie expiration (e.g. **30 days**, sliding expiration enabled) in cookie options.

### Authorization

- Note controllers require an authenticated user (`[Authorize]`).
- Resolve current user id from `User` claims (`UserManager.GetUserId` / `ClaimTypes.NameIdentifier`); use that id for all note queries and creates (US-002 AC 7, US-001 AC 2 and 7).
- Unauthenticated calls to note endpoints return **401 Unauthorized** (US-002 AC 6).
- Angular **route guards** redirect unauthenticated users to login/sign-up for note routes (UI complement; server remains authoritative).

### Protected vs public endpoints

| Public | Authenticated |
|--------|----------------|
| Register, Login | Logout, all note endpoints |

## Alternatives Considered

- **JWT in localStorage** — Vulnerable to XSS stealing tokens; rejected.
- **JWT in memory only** — Logout and refresh complexity; rejected for v1 in favor of HTTP-only cookie + Identity.
- **Custom bcrypt + manual session table** — Proven but duplicates Identity; rejected to stay idiomatic on ASP.NET 8.
- **Third-party auth (OAuth)** — Out of scope per US-002.
- **Next.js / server sessions in PostgreSQL** — From a prior stack option; does not apply to this Angular + .NET + SQLite decision.

## Consequences

**Positive:**

- Identity handles password hashing, user persistence, and sign-in/out with well-tested defaults.
- Cookie auth gives straightforward logout (clear server-side sign-in) without SPA token refresh logic.
- Aligns with Microsoft guidance for SPAs calling a same-trust or CORS-configured API.

**Negative / tradeoffs:**

- CORS + credentialed cookies require careful dev/prod configuration; misconfiguration shows up as “always 401”.
- Cookie-based SPA auth is less portable to native mobile clients without adaptation (not in v1 scope).
- No password reset in v1 (US-002 out of scope)—users who forget passwords need a future story or support process.
- Identity cookie auth is not bcrypt specifically; it uses the framework hasher—acceptable as the proven .NET approach.

## Notes

Engineers must:

- Use `[Authorize]` on note APIs and never trust `UserId` from the request body.
- Apply EF queries that always filter notes by the authenticated user’s id.
- Rate-limit auth endpoints in production when exposed publicly (hosting concern).
- Use HTTPS in production for `Secure` cookies.

Designers: sign-up, login, logout, and guarded note flows are separate screens; empty and validation states follow user stories.

**Risks / open technical questions:**

- **Cross-origin dev:** Angular (`localhost:4200`) and API (`localhost:5xxx`) must list exact origins in CORS and enable credentials.
- **Account recovery:** None in v1; document as known limitation.
- **Session fixation:** Identity sign-in creates a new authenticated session on login; follow standard Identity sign-in flow after registration.
