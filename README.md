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
- `POST /tasks` — creates a task. Accepts a JSON object with a string `title`
  and returns HTTP `201` with `{ "id": string, "title": string }`, where `id`
  is a generated UUID and `title` is the supplied value.

With the app running locally (`npm run dev`), create a task:

```sh
curl -i -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Write a demo test"}'
```

Example response body (HTTP `201 Created`):

```json
{"id":"a51cef5d-8a42-4b89-9c5e-36b159c97a0d","title":"Write a demo test"}
```

A missing or non-string `title` returns HTTP `400` with
`{"error":"title must be a string"}`. Malformed JSON returns HTTP `400` with
`{"error":"Invalid JSON body"}`. Tasks are stored in memory for the lifetime
of the server process and are not shared across server instances.

<!-- vercel-deploy-check -->
