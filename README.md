# Notes App (v1)

A private notes web application: users sign up, log in, create notes (title + body), and view their own notes (newest first).

## Documentation

| Area | Location |
|------|----------|
| User stories | [docs/stories/](docs/stories/) |
| Architecture (ADRs) | [docs/adr/](docs/adr/) |
| UI design spec | [docs/design/notes-app-design.md](docs/design/notes-app-design.md) |
| Build plan | [docs/build-plan.md](docs/build-plan.md) |
| **Regression checklist** | [docs/manual-regression-checklist.md](docs/manual-regression-checklist.md) |

## Source code

Implementation lives under [`src/`](src/):

- **NotesApp.Api** — ASP.NET 8 Web API, EF Core, SQLite, cookie auth  
- **notes-app-web** — Angular 18 SPA  

See **[src/README.md](src/README.md)** for prerequisites, migrations, run commands, and troubleshooting.

## Quick start

```bash
# 1. Database (from repo root)
dotnet ef database update --project src/NotesApp.Api

# 2. API
dotnet run --project src/NotesApp.Api --launch-profile https

# 3. Web (new terminal)
cd src/notes-app-web
npm install
npm start
```

Open `http://localhost:4200`.

**Regression:** [docs/manual-regression-checklist.md](docs/manual-regression-checklist.md) · **API smoke:** `.\scripts\run-api-smoke.ps1` (API must be running)

## Known limitations (v1)

- No password reset, email verification, or OAuth  
- No edit, delete, search, or note detail view  
- Notes list loads all notes (no pagination)  
