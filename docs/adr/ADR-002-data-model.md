# ADR-002: Data Model for Users and Notes

**Status:** Proposed
**Date:** 2026-06-01
**Relates to:** US-001, US-002, ADR-001, ADR-003

## Context

User stories require one account per email, notes owned by a single user, private note access, plain-text title and body (both required), newest-first listing, and persistence across restarts. US-001 explicitly depends on US-002 for signed-in identity.

The data model must enforce **ownership on every note query** and stay minimal (no folders, tags, edit history, or pagination tables in v1).

## Decision

We will persist data in **SQLite** using **Entity Framework Core**, with **ASP.NET Core Identity** owning the user store and a dedicated **`Note`** entity for application data.

### User identity (ASP.NET Core Identity)

Identity provides the `users` store and related tables (e.g. `AspNetUsers`). For v1 we use a single application user type:

| Concept | Implementation |
|---------|----------------|
| Primary key | `string` (Identity default) or `Guid` if the team configures it consistently in one place |
| Email | Unique login identifier; normalized for lookups |
| Password | Stored only as a hash via Identity (see ADR-003); never plain text |
| Timestamps | Use Identity/base entity fields or add `CreatedAt` on a custom `ApplicationUser` if needed for auditing |

**Rule:** One account per email address (US-002). Enforce unique email through Identity configuration and database unique index.

### Application entity: `Note`

| Field | Type | Constraints |
|-------|------|-------------|
| `Id` | `Guid` (or `int` identity) | Primary key |
| `UserId` | same type as Identity user PK | Foreign key to user; **not null** |
| `Title` | `string` / `text` | **Not null** |
| `Body` | `string` / `text` | **Not null** |
| `CreatedAt` | `DateTimeOffset` | **Not null**; set on create; used for newest-first sort |
| `UpdatedAt` | `DateTimeOffset` | **Not null**; set on create/update |

### Relationships

- **User 1 — N Notes** — Each note has exactly one `UserId`. Deleting a user should cascade-delete or block per product policy; for v1, **cascade delete notes when user is deleted** is acceptable because account deletion is out of scope but keeps the model consistent.

### Indexes

- **Unique:** normalized email on Identity user table (Identity default).
- **Non-unique:** `(UserId, CreatedAt DESC)` on `Notes` for list performance.

### Access rules (API + EF queries)

- **Create note:** set `UserId` from the authenticated user’s id; reject if not authenticated.
- **List notes:** `WHERE UserId == currentUserId ORDER BY CreatedAt DESC`.
- **Get by id:** always include `UserId == currentUserId`; never fetch a note by id alone.

### Validation (application layer)

- Sign-up/login: per US-002 and ADR-003 (Identity + API validation).
- Note create: trim `Title` and `Body`; reject if either is null/empty/whitespace after trim (US-001).
- No maximum length in the database for v1 (`text` columns or unconstrained strings).

### EF Core

- Single `DbContext` (e.g. `NotesDbContext`) extending or composing Identity’s context (`IdentityDbContext<ApplicationUser>`).
- Schema changes via **EF Core migrations** applied to the SQLite file.

## Alternatives Considered

- **Custom `users` table without Identity** — Full control but reinvents password hashing and user storage; rejected in favor of Identity (ADR-003).
- **Separate `sessions` table** — Useful for opaque server sessions; rejected when using Identity’s cookie-based sign-in for v1 (session state carried in the auth cookie; logout via Identity sign-out).
- **Document/NoSQL store for notes** — Weaker relational guarantees for per-user filtering; rejected.
- **PostgreSQL provider** — Valid for production scale; rejected for v1 per stack decision (SQLite).

## Consequences

**Positive:**

- `Note.UserId` makes ownership explicit and easy to test in every query.
- Identity + EF Core is a standard .NET 8 pairing with good tooling.
- SQLite file is portable for demos and local development.

**Negative / tradeoffs:**

- Identity brings extra tables beyond `Notes`; acceptable overhead for built-in auth.
- Unbounded text fields allow very large notes; acceptable for v1 per US-001.
- SQLite file locking may matter under heavy parallel writes; unlikely at v1 scale.

## Notes

- Do not expose `UserId` from the client for authorization; set it server-side from `User` claims.
- List endpoint returns only fields needed by the UI (at minimum `Id`, `Title`, `CreatedAt` for list; include `Body` only when a detail view exists—in v1 list may show title only per US-001).
- Prisma/PostgreSQL references in earlier drafts do not apply; this ADR supersedes any prior stack-specific data model.

**Risks / open technical questions:**

- If note volume grows large, full in-memory list without pagination (US-001) may need a follow-up story/ADR.
