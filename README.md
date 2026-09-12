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
- `POST /api/tasks` — creates a task. Body: `{"title": string}`. Returns the
  created task as JSON with a `201` status, or a `400` with an `error`
  message if `title` is missing or empty.

  ```
  curl -X POST http://localhost:3000/api/tasks \
    -H "Content-Type: application/json" \
    -d '{"title": "Write the README"}'
  ```

  ```json
  {"id": "1136771d-e3d7-489d-96a8-8bfda167681e", "title": "Write the README"}
  ```

<!-- vercel-deploy-check -->
