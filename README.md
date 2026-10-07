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

- `title` — a non-empty string; surrounding whitespace is trimmed.
- `category` — `"Feature"`, `"Bug"`, or `"Chore"` (case-sensitive).
- `priority` — `"Low"`, `"Medium"`, or `"High"` (case-sensitive).
- `urgent` — a boolean (`true` or `false`).

With the app running locally (`npm run dev`), create a task:

```sh
curl -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Add task filters","category":"Feature","priority":"High","urgent":true}'
```

Returns `201 Created` with the task fields, a generated UUID `id`, and `total`
in the same JSON response. For example, the first successful creation returns:

```json
{
  "id": "c7090cce-12ba-4c38-9433-926db321b741",
  "title": "Add task filters",
  "category": "Feature",
  "priority": "High",
  "urgent": true,
  "total": 1
}
```

`total` counts successful creations, including this task; no separate GET request
is needed. Tasks are stored in memory for the current server process, so tasks
and the total reset when it restarts and are not shared across server instances.

Malformed JSON, a non-object body, or missing or invalid fields return `400`
with a JSON error such as `{"error":"title is required"}`. Rejected requests do
not increase the total.

<!-- vercel-deploy-check -->
