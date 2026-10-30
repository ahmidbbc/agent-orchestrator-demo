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
- `POST /tasks` — creates a task and returns it with the running task total.
  Send a JSON object with all four required fields:
  `title` (a non-empty string, trimmed before storage),
  `category` (`"Feature"`, `"Bug"`, or `"Chore"`),
  `priority` (`"Low"`, `"Medium"`, or `"High"`), and
  `urgent` (a boolean).

With the app running locally (`npm run dev`), create a task:

```sh
curl -i -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Add task creation","category":"Feature","priority":"High","urgent":true}'
```

Returns HTTP `201` with the created task and `total` in the same JSON object:

```json
{
  "id": "a8c6c40b-fb42-4bfa-8ea0-3ebaaf2a81c9",
  "title": "Add task creation",
  "category": "Feature",
  "priority": "High",
  "urgent": true,
  "total": 1
}
```

`id` is a generated UUID. `total` includes the newly created task; rejected
requests do not increase it. Storage is in memory for the server process's
lifetime, so the count resets on restart and is not shared across serverless
instances. Use `total` from this POST response when displaying the result;
a separate summary request may reach a different instance.

Invalid JSON or invalid/missing fields return HTTP `400` with an
`{"error":"..."}` object. For example, a missing, empty, or whitespace-only
title returns `{"error":"title is required and must be a non-empty string"}`.

<!-- vercel-deploy-check -->
