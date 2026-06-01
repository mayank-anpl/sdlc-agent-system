# ADR-001: Tech Stack for v1 Notes Web Application

**Status:** Proposed
**Date:** 2026-06-01
**Relates to:** US-001, US-002

## Context

The product is a browser-based notes application with user accounts, private per-user data, and persistence across sessions. v1 requires a real backend for credentials and note storage, plus a web UI for sign-up, login, logout, create note, and list notes.

Forces at play:

- **Stakeholder stack preference** — Angular 18 frontend, ASP.NET 8 backend, SQLite database.
- **Web application** — SPA in the browser; server enforces authentication and data access.
- **Relational ownership** — users own many notes; queries must scope by account.
- **v1 simplicity** — proven frameworks, minimal moving parts, easy local development.

## Decision

We will build v1 as a **two-part web application**:

| Layer | Choice |
|-------|--------|
| **Frontend** | **Angular 18** (standalone components, typed services, Angular router) |
| **Backend** | **ASP.NET 8** Web API (REST JSON endpoints) |
| **Data access** | **Entity Framework Core 8** with **SQLite** as the database |
| **Auth foundation** | **ASP.NET Core Identity** (see ADR-003) backed by the same SQLite database |

### High-level structure

- **Angular SPA** — UI, routing, forms, and HTTP calls to the API. Does not store passwords or authoritative note data beyond transient UI state.
- **ASP.NET 8 API** — Auth endpoints, note endpoints, validation, and authorization. All business rules and ownership checks run here.
- **SQLite file database** — Single-file persistence for users (Identity) and notes in development and v1 deployment.

Communication: **HTTPS JSON REST** from Angular `HttpClient` to API controllers. In development, the API runs on a separate origin/port from the Angular dev server with **CORS** configured to allow credentialed requests (cookies) from the Angular origin.

## Alternatives Considered

- **Next.js full-stack (TypeScript monolith)** — Fewer deployables but does not match the chosen Angular + .NET stack.
- **PostgreSQL instead of SQLite** — Better for large concurrent production loads; rejected for v1 in favor of stakeholder preference and zero external DB setup for local work.
- **Blazor instead of Angular** — Keeps UI in .NET but conflicts with the Angular 18 requirement.
- **Angular + Node/Express API** — Common SPA pattern but splits the backend from the requested ASP.NET 8 stack.

## Consequences

**Positive:**

- Aligns with team/stakeholder skills: Angular 18 and ASP.NET 8 are mature, documented platforms.
- SQLite requires no separate database server for v1; EF Core migrations work the same as with other providers.
- ASP.NET Core Identity provides a proven email/password path without custom crypto.
- Clear separation: UI in Angular, rules and data in the API.

**Negative / tradeoffs:**

- Two applications to build, run, and deploy (SPA + API) with CORS and cookie/credentials configuration in dev.
- SQLite has lower write concurrency than server databases; acceptable for v1 scope but may need migration later if traffic grows.
- EF Core + Identity migrations must be applied before the API can run against a fresh database.

## Notes

- Solution layout: e.g. `src/NotesApp.Api` (ASP.NET 8) and `src/notes-app-web` (Angular 18); exact folder names are an implementation detail.
- Store connection string in configuration (e.g. `Data Source=notes.db`); do not commit secrets.
- Production may host the Angular build as static files behind the API or on a separate static host; both are acceptable if cookies/CORS remain consistent.

**Risks / open technical questions:**

- Confirm production hosting model (API-only vs API + static files) before CI/CD setup; does not block starting development.
