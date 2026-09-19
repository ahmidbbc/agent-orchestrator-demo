# agent-orchestrator-demo

Minimal Next.js app used as the target repo for `agent-orchestrator`'s demo mode
(V46). A connected runner clones this repo into `$HOME` at install time; the
orchestrator's demo mini-sprint adds a `POST /tasks` endpoint, a test, a
README update, and a `GET /tasks/summary` endpoint (paused for validation) on
top of this starter.

Deployed automatically on every push via Vercel's native GitHub integration —
no deploy step lives in this repo.

## Endpoints

- `GET /healthz` — liveness check. Fixed contract checked by
  `agent-orchestrator`'s `internal/demo/playwright/demo.spec.js` — do not
  rename or change its response shape without updating that script.
- `GET /api/health` — same liveness check, Next.js-idiomatic path.
- `POST /tasks` — creates a task from a JSON body with a string `title`,
  e.g. `{"title":"Demo task"}`. Returns `201 Created` with
  `{"id":"<generated UUID>","title":"Demo task"}`. Malformed JSON or a missing
  or non-string `title` returns `400 Bad Request` with `{"error":"<message>"}`.
  Tasks are stored in memory for the lifetime of the server process and are not
  shared between server instances.

Example (with the app running locally via `npm run dev`):

```sh
curl -i -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Demo task"}'
```

<!-- vercel-deploy-check -->
