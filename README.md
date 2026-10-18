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

Send a JSON object with all four required fields:

- `title` — a string containing at least one non-whitespace character.
- `category` — `"Feature"`, `"Bug"`, or `"Chore"` (case-sensitive).
- `priority` — `"Low"`, `"Medium"`, or `"High"` (case-sensitive).
- `urgent` — a boolean (`true` or `false`).

With the app running locally (`npm run dev`):

```sh
curl -i -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Fix the save button","category":"Bug","priority":"High","urgent":true}'
```

Returns `201 Created` with the submitted fields, a generated string `id`, and
an integer `total` in the same JSON response. Example for the first task:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Fix the save button",
  "category": "Bug",
  "priority": "High",
  "urgent": true,
  "total": 1
}
```

`total` includes the task just created. Storage is in memory: tasks and the
count reset on server restart and are not shared across server instances.
Use the total from this POST response when displaying the result; a separate
request may reach another instance with a different count.

Invalid JSON or invalid/missing fields return `400 Bad Request` with a JSON
`error` string and do not increase the total. A missing, empty, or
whitespace-only title returns:

```json
{"error":"title is required"}
```

<!-- vercel-deploy-check -->
