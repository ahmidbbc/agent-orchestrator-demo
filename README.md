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
- `POST /tasks` — creates a task from a JSON body and returns the created task
  with the running total in the same response (`201 Created`).

All four request fields are required: `title` must be a non-empty string
(surrounding whitespace is trimmed), `category` must be `Feature`, `Bug`, or
`Chore`, `priority` must be `Low`, `Medium`, or `High`, and `urgent` must be a
boolean. Malformed JSON or invalid fields return `400` with an
`{"error": "..."}` response.

Example request against the local development server:

```sh
curl -i -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Add task filters","category":"Feature","priority":"High","urgent":true}'
```

Example JSON response for the first task created:

```json
{
  "id": "c53d5cb3-651b-4c7e-a9ba-28989765d517",
  "title": "Add task filters",
  "category": "Feature",
  "priority": "High",
  "urgent": true,
  "total": 1
}
```

`id` is a generated UUID. `total` counts successfully created tasks, including
the task just created, and is available directly from the POST response without
a separate GET request. Tasks and their total are stored in memory per server
instance and reset on restart; rejected requests do not increase the total.

<!-- vercel-deploy-check -->
