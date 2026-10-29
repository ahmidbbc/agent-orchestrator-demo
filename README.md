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

### Create a task

Send a JSON object with all four fields:

- `title`: a required string that cannot be empty or whitespace-only.
- `category`: `"Feature"`, `"Bug"`, or `"Chore"` (case-sensitive).
- `priority`: `"Low"`, `"Medium"`, or `"High"` (case-sensitive).
- `urgent`: a boolean (`true` or `false`).

With the app running locally (`npm run dev`):

```sh
curl -i -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Fix the demo","category":"Bug","priority":"High","urgent":true}'
```

Returns `201 Created` with the submitted fields, a generated `id`, and a
top-level `total` that includes the newly created task. Example first response:

```json
{
  "id": "ea890d86-a1c4-4cdf-9a1f-0c3e408b2fa6",
  "title": "Fix the demo",
  "category": "Bug",
  "priority": "High",
  "urgent": true,
  "total": 1
}
```

Tasks are stored in memory within each server process. The running total resets
on restart and is not shared across server instances. Read `total` directly from
this POST response; a separate request may reach an instance with different data.

Invalid JSON or invalid/missing fields return `400 Bad Request` with an `error`
string. For example, a missing or empty title returns:

```json
{"error":"title is required"}
```

<!-- vercel-deploy-check -->
