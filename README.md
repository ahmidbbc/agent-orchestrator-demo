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
- `POST /tasks` — creates a task. Accepts a JSON body `{ "title": string }`
  and returns `201 Created` with `{ "id": string, "title": string }`, where
  `id` is a generated UUID and `title` is the supplied title. Returns `400`
  with `{ "error": string }` for invalid JSON or a missing or non-string title.
  Tasks are stored in memory per server instance and are lost on restart.

Example request (with the app running locally):

```sh
curl -i -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Prepare the demo"}'
```

Example response body (`201 Created`):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Prepare the demo"
}
```

<!-- vercel-deploy-check -->
