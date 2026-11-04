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
- `POST /tasks` — creates a task. Body:
  `{ "title": string, "category": "Feature"|"Bug"|"Chore", "priority": "Low"|"Medium"|"High", "urgent": boolean }`.
  `title` is required (`400` if missing/empty); `category` and `priority`
  must be one of the listed values (`400` otherwise). On success (`201`)
  returns the created task as JSON, plus a `total` field with the running
  count of tasks created so far in this same process — always read `total`
  from this response, never from a separate call, since the in-memory store
  is per server instance.

  ```bash
  curl -X POST http://localhost:3000/tasks \
    -H "Content-Type: application/json" \
    -d '{"title": "Fix login bug", "category": "Bug", "priority": "High", "urgent": true}'
  ```

  ```json
  {
    "id": "c1a2b3c4-5678-90ab-cdef-1234567890ab",
    "title": "Fix login bug",
    "category": "Bug",
    "priority": "High",
    "urgent": true,
    "createdAt": "2026-11-04T18:54:50.306Z",
    "total": 3
  }
  ```

<!-- vercel-deploy-check -->
