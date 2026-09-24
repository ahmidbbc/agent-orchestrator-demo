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
  Send a JSON object with all four required fields: `title` (a nonempty string,
  trimmed before storage), `category` (`"Feature"`, `"Bug"`, or `"Chore"`),
  `priority` (`"Low"`, `"Medium"`, or `"High"`), and `urgent` (a boolean).
  Returns `201 Created` on success or `400` with `{"error":"..."}` for invalid
  JSON or missing/invalid fields, including blank titles.

Example request:

```sh
curl -i -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Add search","category":"Feature","priority":"High","urgent":true}'
```

Example JSON response (the first task created in this server process):

```json
{
  "id": "e412e614-1ec5-4d33-ae62-1d9538cf931f",
  "title": "Add search",
  "category": "Feature",
  "priority": "High",
  "urgent": true,
  "total": 1
}
```

`id` is a generated UUID. `total` includes the newly created task and is returned
in the POST response itself. Storage is in memory: the count resets on restart
and is not shared across server instances. Use this response's `total` when
displaying the count after creation; a separate request may reach another
instance with a different count.

<!-- vercel-deploy-check -->
