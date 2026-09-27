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
- `POST /tasks` — creates a task and returns it with the running total.

Send a JSON object with all four fields:

```json
{
  "title": "Ship the demo",
  "category": "Feature",
  "priority": "High",
  "urgent": true
}
```

`title` must be a non-empty string (whitespace is trimmed). `category` must be
`Feature`, `Bug`, or `Chore`; `priority` must be `Low`, `Medium`, or `High`.
`urgent` must be a boolean. Invalid requests return `400` with a JSON `error`
message; a missing or empty title returns `{"error":"title is required"}`.

With the app running locally (`npm run dev`):

```sh
curl -i http://localhost:3000/tasks \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"title":"Ship the demo","category":"Feature","priority":"High","urgent":true}'
```

Returns `201 Created` with the task fields, a generated UUID `id`, and `total`
including the newly created task. Example response for the first task:

```json
{
  "id": "c2dc9568-167b-4925-a97d-34d27b8ca881",
  "title": "Ship the demo",
  "category": "Feature",
  "priority": "High",
  "urgent": true,
  "total": 1
}
```

Tasks are stored in memory. The total counts successful creations in the server
instance handling the request and resets when that instance restarts. Rejected
requests do not increase it. Read `total` directly from the POST response; a
separate request on a serverless deployment may reach a different instance.

<!-- vercel-deploy-check -->
