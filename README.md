# Bean

Baby tracking, stripped down. React + Vite PWA frontend, Express + SQLite backend.

## Local development

Two servers, run in separate terminals:

```bash
cd backend && npm install && npm run dev
```

```bash
cd frontend && npm install && npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` to the backend on `:3001`.

## Local Docker test

```bash
docker compose up --build
```

Serves the full stack on `http://localhost:3000`. If that port is already taken on
your machine, change the `3000:80` mapping in `docker-compose.yml`.

## Deploying with Coolify

1. Push this repo to a git remote Coolify can reach.
2. In Coolify, create a new resource of type "Docker Compose" and point it at this
   repo (`docker-compose.yml` in the root).
3. Assign a domain to the `frontend` service (port 80 inside the container) — that's
   the only service that needs to be public. `backend` stays internal; `frontend`'s
   nginx proxies `/api/*` to it over the compose network.
4. The `bean-data` named volume holds the SQLite database — Coolify keeps it across
   redeploys as long as the volume isn't removed.

No auth. Anyone with the URL can read and write data — fine for personal/family use
behind a private domain, not for anything public.
