# Technical overview

## Stack

**Frontend** (`frontend/`) — React + TypeScript, built with Vite. Installable PWA via
`vite-plugin-pwa`. Plain CSS (no framework) driven by CSS custom properties for
theming — see `src/index.css`. Icons from
[`@tabler/icons-react`](https://tabler.io/icons). Font is
[Nunito Sans](https://fonts.google.com/specimen/Nunito+Sans), self-hosted via
`@fontsource-variable/nunito-sans` so the PWA works offline without a Google Fonts
dependency.

**Backend** (`backend/`) — Express + TypeScript, with SQLite (via `better-sqlite3`)
for storage. No ORM; queries are plain SQL in `src/routes/`. Entries and settings are
each a single table — see [Data model](#data-model) below.

**Deployment** — Docker Compose with two services. `frontend` is a multi-stage build
that compiles the Vite app and serves it from a Caddy container, which also reverse
proxies `/api/*` to the `backend` container over the internal compose network — so
only `frontend` needs a public domain. `backend` persists its SQLite file to a named
volume (`bean-data`) so data survives redeploys.

## Data model

Two SQLite tables, both accessed through a single opaque JSON blob pattern for
settings:

- **`entries`** — one row per logged event. `type` is the category (`diaper`,
  `bottle`, etc.), `occurred_at` is the user-entered `dd/mm/yyyy - HH:MM` string,
  `occurred_at_sort` is a derived `yyyy-mm-dd HH:MM` string used only for chronological
  sorting (the display string doesn't sort correctly on its own since the day comes
  first), and `data` is a JSON blob of whatever fields that category needs.
- **`settings`** — a single row holding one JSON blob: `{ defaults, enabledCategories
}`. `defaults` holds the shared per-field pre-fill values shown in Settings;
  `enabledCategories` is a `{ [type]: boolean }` map (missing/`true` = shown,
  `false` = hidden). The backend treats this blob as opaque — it doesn't validate or
  migrate its shape, so the frontend owns the contract.

Adding a new category means: add it to `ENTRY_TYPES` in both
`backend/src/types.ts` and `frontend/src/types.ts`, add its data interface and default
color tokens, add an icon entry in `frontend/src/entryMeta.ts`, and add its field
inputs to `EntryForm.tsx` and `SettingsPanel.tsx`.

## Category colors

Each category has a set of CSS custom properties (`--<type>-bg`,
`--<type>-bg-strong`, `--<type>-accent`, `--<type>-fill`, `--<type>-on-accent`)
defined for both light and dark mode in `index.css`. Rather than writing separate CSS
rules per category, components set generic `--cat-*` properties via inline style
(see `categoryVars()` in `entryMeta.ts`), pointing them at that category's actual
tokens — so e.g. `.log-entry { background: var(--cat-bg); }` works for every
category without a rule per type.

`--fill` exists separately from `--accent` because the bright `--accent` color
doesn't have enough contrast for white button text in light mode — `--fill` is a
darker shade of the same color used specifically for solid buttons, while `--accent`
stays reserved for borders and decorative accents where there's no text sitting on
top of it.

## Theming

Theme (light/dark/auto) is stored in `localStorage` and applied as a `data-theme`
attribute on `<html>`. An inline script in `index.html` sets it before React mounts,
to avoid a flash of the wrong theme on load. `auto` follows `prefers-color-scheme`;
an explicit choice overrides it regardless of system setting.

## Local-only vs shared state

Two different persistence scopes are in play:

- **Local** (`localStorage`, per device): who's currently using the app
  (`utils/whoami.ts`), theme preference (`utils/theme.ts`), and whether onboarding has
  been completed (`utils/onboarding.ts`).
- **Shared** (backend, via `/api/settings`): default field values and which
  categories are enabled — both partners see the same categories and defaults.

The "who am I" value gets stamped onto each entry as a hidden `createdBy` field but
isn't surfaced in the UI anywhere yet.
