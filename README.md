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
- `POST /tasks` — creates a task. Accepts JSON `{"title": string}` and returns
  HTTP `201 Created` with JSON `{"id": string, "title": string}`; `id` is a
  generated UUID and `title` matches the request. Tasks are stored in memory
  for the lifetime of the server instance.

With the app running locally (`npm run dev`), create a task:

```sh
curl -i -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Demo task"}'
```

Example response body (HTTP `201 Created`):

```json
{"id":"550e8400-e29b-41d4-a716-446655440000","title":"Demo task"}
```

A missing or non-string `title` returns HTTP `400 Bad Request` with
`{"error":"title must be a string"}`. Malformed JSON returns HTTP `400 Bad Request`
with `{"error":"Invalid JSON body"}`.

<!-- vercel-deploy-check -->
