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
- `POST /tasks` — creates a task from a JSON body and returns `201 Created`
  with the created task and a running `total` in the same response.

All request fields are required: `title` must be a non-empty string (surrounding
whitespace is trimmed), `category` must be `Feature`, `Bug`, or `Chore`,
`priority` must be `Low`, `Medium`, or `High`, and `urgent` must be a boolean.
Invalid JSON or invalid/missing fields return `400` with `{ "error": "..." }`.

Example request:

```sh
curl -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Add task filters","category":"Feature","priority":"High","urgent":true}'
```

Example response (first task created):

```json
{
  "id": "c130c7ec-7e46-42c6-8b23-809868052e92",
  "title": "Add task filters",
  "category": "Feature",
  "priority": "High",
  "urgent": true,
  "total": 1
}
```

`id` is a generated UUID. `total` includes the task just created, so callers
can read the running count directly from the POST response without a separate
GET request. Tasks and their count are stored in memory within one server
process and reset when that process restarts.

<!-- vercel-deploy-check -->
