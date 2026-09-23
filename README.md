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
- `POST /tasks` — creates a task. Accepts a JSON body with a string `title`
  (`{"title":"Prepare the live demo"}`) and returns HTTP 201 with
  `{"id":"<generated UUID>","title":"Prepare the live demo"}`.
  A missing or non-string `title` returns HTTP 400 with
  `{"error":"title must be a string"}`; malformed JSON returns HTTP 400 with
  `{"error":"Invalid JSON body"}`. Tasks are stored in memory per server
  process and are lost when it restarts.

With the app running locally (`npm run dev`):

```sh
curl -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Prepare the live demo"}'
```

Example response (HTTP 201):

```json
{"id":"550e8400-e29b-41d4-a716-446655440000","title":"Prepare the live demo"}
```

<!-- vercel-deploy-check -->
