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

- `title` — a non-empty string; leading/trailing whitespace is trimmed.
- `category` — `"Feature"`, `"Bug"`, or `"Chore"` (case-sensitive).
- `priority` — `"Low"`, `"Medium"`, or `"High"` (case-sensitive).
- `urgent` — a boolean (`true` or `false`).

With the app running locally (`npm run dev`):

```sh
curl -i -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Fix the sign-in button","category":"Bug","priority":"High","urgent":true}'
```

Returns `201 Created` with the task fields, a generated `id`, and `total` in
the same JSON response. Example for the first task:

```json
{
  "id": "e680f241-41d2-4d22-8ed4-cd71b97c0ef2",
  "title": "Fix the sign-in button",
  "category": "Bug",
  "priority": "High",
  "urgent": true,
  "total": 1
}
```

`total` includes the newly created task and excludes rejected requests. Tasks
are stored in memory per server instance and reset on restart. Read the count
directly from this POST response: a separate request may reach another instance
with a different count.

Invalid JSON or missing/invalid fields return `400 Bad Request` with an
`{"error":"..."}` JSON body. A missing, empty, or whitespace-only title returns
`{"error":"title is required"}`.

<!-- vercel-deploy-check -->
