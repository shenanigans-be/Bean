# Bean

A baby tracker for two people, self-hosted, no accounts. Deliberately minimal: "log
something, see what's been logged" — resist adding graphs/streaks/analytics. See
[README.md](README.md) for the product pitch and [docs/TECHNICAL.md](docs/TECHNICAL.md)
for the stack writeup.

## Shape of the app

- `frontend/` — Vite + React 19 + TS. `backend/` — Express 5 + better-sqlite3, one
  SQLite file (`backend/data/bean.db`).
- **Everything server-side is shared by everyone using the app** — there's one global
  settings row, no per-user accounts. `enabledCategories` and `defaults` in Settings
  affect every device. Only `localStorage` is per-device: `bean.whoami`, `bean.theme`,
  `bean.onboarded`, `bean.lastFetchedAt`. When touching Settings UI, keep being explicit
  in the copy about which is which (see `SettingsPanel.tsx` hint text) — this confused
  the user before.
- Category system is a registry, not a switch statement: `ENTRY_TYPES` in `types.ts`,
  display metadata in `entryMeta.ts` (`ENTRY_META`, `categoryVars()`), CSS colors as
  `--{type}-bg/-bg-strong/-accent/-fill/-on-accent` custom properties in `index.css`,
  mapped to generic `--cat-*` vars via `categoryVars()` so components style any category
  with one rule. Adding a category = add to `ENTRY_TYPES`, `ENTRY_META`, the CSS block,
  and the per-type branch in `EntryForm.tsx` / `SettingsPanel.tsx`.
- `occurredAt` is stored and transmitted as the literal string `"dd/mm/yyyy - HH:MM"`,
  not ISO — see `OCCURRED_AT_RE` in both `frontend/src/utils/datetime.ts` and
  `backend/src/types.ts` (duplicated, not shared). Sorting uses a derived
  `"yyyy-mm-dd HH:MM"` key, not `Date` parsing.
- **iOS input gotcha, do not reintroduce**: the date/time field must never get
  `inputMode="numeric"` — it kills the ability to type `/` and `:` on iOS. It's a plain
  text input with auto-formatting (`formatDateTimeInput` in `datetime.ts`) that inserts
  separators as you type digits.

## Dev workflow

- `.claude/launch.json` only starts the frontend (`npm run dev --host`, port 5173,
  proxies `/api` → `:3001`). The backend is not auto-started — run
  `cd backend && npm install && npm run dev` yourself first, or the proxy 404s.
- Before calling a UI change done: exercise it in the Browser pane preview (not just
  code-read), check both light and dark mode, run `cd frontend && npx tsc -b` and
  `npm run lint` clean. This user actually looks at screenshots/behavior, not just diffs.
- No test suite exists (frontend or backend) — verification is manual/browser-based plus
  typecheck + lint.

## Working style this user has confirmed (not just my defaults)

- **Commits happen proactively once a change is built and verified**, without waiting
  for an explicit "commit" each time — established over many turns across the prior
  session where features were shipped and committed turn after turn with no request to
  commit and no pushback. Still use judgment (batch related work into one commit, don't
  commit half-finished things), but don't ask permission first in this repo.
- Avoid dropdowns/native pickers/fiddly widgets for input — plain text fields with
  light-touch JS formatting are preferred (see the date field saga above).
- Keep feature scope tight; if a refactor rides along with a feature (e.g. the
  `--cat-*` CSS indirection), call that out explicitly as "cleanup in service of this
  feature" rather than silently expanding scope.
- README is written for non-technical users: lead with what/why + screenshots, keep
  install steps, push stack/architecture detail into `docs/TECHNICAL.md`.

## Icon / branding

- Brand green: `#6EA14D`. App icon artwork is Noun Project "beans" by Trend Icons
  (CC BY 3.0) — attribution lives in `README.md` under Credits; don't drop it if the
  icon changes again.
- `frontend/public/icon.svg` = white circle background + bean (app/PWA icon, used for
  `icon-192.png`, `icon-512.png`). `frontend/public/favicon.svg` = bean only, no
  background, tightly cropped (browser tab favicon, `favicon-64.png` fallback).
  Regenerate PNGs with ImageMagick: `magick -background none icon.svg -depth 8 -resize
  <N>x<N> icon-<N>.png` (no `rsvg-convert` installed, but `magick`'s built-in MSVG
  renderer handles these files fine — verify visually via the `Read` tool on the PNG,
  ImageMagick has no visual feedback of its own).
- Maskable-icon safe zone: keep the meaningful mark within ~76-80% of canvas diameter
  centered, even though the background circle can go closer to the edge.
- **`icon-180.png` (apple-touch-icon) must be fully opaque, no alpha channel at all.**
  If it has any transparency, iOS fills the transparent areas with black instead of
  leaving them alone — this actually happened (white circle on transparent bg → black
  box around it on the real device). Generate it separately from the other sizes with
  the transparency stripped: `magick -background white icon.svg -flatten -alpha remove
  -alpha off -depth 8 -resize 180x180 icon-180.png`. `icon-192.png`/`icon-512.png` (used
  via the web manifest, not this tag) can keep transparency — Android's install flow
  handles it correctly.
- **Third-party browsers on iOS (Firefox, Chrome, etc.) cannot create a proper Home
  Screen icon at all** — this is an Apple platform restriction, not fixable via any
  manifest/meta-tag config. Only Safari gets the system API to read
  `apple-touch-icon`/the web manifest when adding to Home Screen; other iOS browsers'
  "Add to Home Screen" just generates their own generic monogram tile (e.g. Firefox
  shows a plain "B"), ignoring the page's icons entirely. Don't spend time debugging
  this for a specific non-Safari iOS browser — confirm which platform/browser first, and
  if it's iOS + non-Safari, the only fix is "use Safari instead" or "use the actual
  browser's proper PWA-install flow if it has one" (Firefox for Android does support
  the manifest properly, unlike Firefox for iOS).

## Recent additions (this session, for context)

- Manual refresh button (`Log.tsx` toolbar, left side) + auto-refresh on app-resume
  after 5 min staleness (`utils/refresh.ts`, `visibilitychange` listener in `App.tsx`) +
  a shared "Loading…"/"Updating…" indicator in the header for all three loading states.
- Onboarding shows only the name field (no category picker) when entries already exist
  server-side — treated as a signal the app was already set up on another device
  (`App.tsx` passes `alreadyInUse={entries.length > 0}` to `Onboarding`).
