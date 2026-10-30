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

- `title` — required string, non-empty after trimming whitespace.
- `category` — `"Feature"`, `"Bug"`, or `"Chore"` (case-sensitive).
- `priority` — `"Low"`, `"Medium"`, or `"High"` (case-sensitive).
- `urgent` — boolean (`true` or `false`).

With the app running locally (`npm run dev`):

```sh
curl -i -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Fix the login button","category":"Bug","priority":"High","urgent":true}'
```

Returns `201 Created` with the task fields, a generated UUID `id`, and `total`
including the newly created task. Example response for the first task:

```json
{
  "id": "123e4567-e89b-42d3-a456-426614174000",
  "title": "Fix the login button",
  "category": "Bug",
  "priority": "High",
  "urgent": true,
  "total": 1
}
```

The returned title is trimmed. Invalid JSON or missing/invalid fields return
`400 Bad Request` with an `error` string, for example
`{"error":"title is required"}` for a missing or empty title. Rejected requests
do not increase the total.

Tasks are stored in memory: `total` counts successful creations in the current
server process and resets when that process restarts. Serverless instances do
not share this store. Use `total` from the POST response itself when displaying
the result; a separate summary request may reach a different instance.

<!-- vercel-deploy-check -->
