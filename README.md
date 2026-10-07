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

```json
{
  "title": "Fix the demo button",
  "category": "Bug",
  "priority": "High",
  "urgent": true
}
```

- `title` — a required, non-empty string; surrounding whitespace is trimmed.
- `category` — one of `Feature`, `Bug`, or `Chore` (case-sensitive).
- `priority` — one of `Low`, `Medium`, or `High` (case-sensitive).
- `urgent` — a boolean (`true` or `false`).

With the app running locally (`npm run dev`):

```sh
curl -i -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Fix the demo button","category":"Bug","priority":"High","urgent":true}'
```

Success returns HTTP `201` with the created task, a generated UUID `id`, and
`total` in the same JSON response. For example, the first task returns:

```json
{
  "id": "a93c2f14-7b86-4d05-9c12-8e6f3b204a71",
  "title": "Fix the demo button",
  "category": "Bug",
  "priority": "High",
  "urgent": true,
  "total": 1
}
```

`total` includes the newly created task. Storage is in memory per server instance
and resets on restart; separate serverless instances can have different totals.
Use the total from this POST response when displaying the creation result.

Invalid JSON or invalid fields return HTTP `400` with an `error` string, without
creating a task. A missing, empty, or whitespace-only title returns:

```json
{ "error": "title is required" }
```

<!-- vercel-deploy-check -->
