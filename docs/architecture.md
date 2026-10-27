# Architecture

DeutschMaster is an offline Electron desktop application. React and TypeScript render one shared application; Vite produces the bundled renderer. Tailwind supplies the styling layer, with locally owned Button and Input components using Radix Slot and class-variance-authority. Runtime assets are bundled; no CDN is required.

## Boundaries

- `src/App.tsx` owns navigation, the responsive shell, theme application and the home dashboard.
- `src/features/Learning.tsx` owns vocabulary sessions, grammar, spaced review and mistake remediation.
- `src/features/Personal.tsx` owns dictionary CRUD, personal sets, atomic CSV import, filtered CSV export, statistics and settings.
- `src/data/` contains original A1–C2 learning content. `starterWords` combines the preserved 48 starter cards with `expansionWords`; the latter contains only new stable IDs used for additive upgrades. Grammar preserves existing topic titles and exercise IDs so recorded mistakes still resolve to their original questions.
- `src/lib/` provides pure checking, CSV, statistics and SM-2 functions, schema validation and the serialized persistence queue.
- `src/store.tsx` provides the hydrated application state. Features only mutate a cloned draft inside `await update(...)`.
- `electron/main.cjs` owns SQLite and authorized IPC handlers. `electron/preload.cjs` exposes only asynchronous `load` and `save` methods.

## Persistence and errors

Schema version 1 stores vocabulary, attempts, schedules, retained mistakes and preferences. Hydration completes before updates become available. Each update clones the previous committed snapshot, validates it, persists it and only then publishes it to the renderer. Failed writes leave the prior state intact and keep the user's answer/editor open. Corrupt data is reported rather than reset.

`createSerializedStore(storage, initial, upgrade?)` serializes hydration and updates through the same queue. Existing loaded profiles are validated, cloned and passed to the optional upgrade, then validated again. A changed result is saved before the private snapshot or ready renderer state is published. Fresh null storage uses the complete initial seed without an upgrade write. Failed upgrades leave the last committed snapshot available and can be retried.

The pure `mergeBuiltinWords(state, seeds)` rejects duplicate seed IDs and appends only missing new IDs. Existing IDs always win, including personal collisions. It never restores absent legacy cards or replaces saved edits, history, mistakes, schedules or settings. Repeated hydration performs no unnecessary save. The storage schema stays at version 1 because this is an additive content change.

The desktop uses bundled sql.js (SQLite WASM). The development database is `data/deutschmaster.sqlite`; an installed application uses Electron's writable per-user application directory. `DEUTSCHMASTER_DATA_DIR` is a development-only test seam restricted to absolute paths within the workspace, with symlink escape checks. Browser preview uses `deutschmaster.state.v1` in LocalStorage and labels this storage mode visibly. Browser and desktop stores are independent.

Statistics are projections of recorded attempts, grouped by local calendar date. There is no synthetic activity. Deleted personal cards leave attempt history intact, while review excludes ids absent from the current dictionary. Sets are word metadata; creating or renaming a set means entering its name in the card editor. Imports append new ids and never overwrite existing words. CSV parsing validates every row before one store update. Spreadsheet formula prefixes are neutralized on export.

## Desktop security

The renderer runs with context isolation and without Node integration. SQLite is inaccessible directly to renderer code. IPC checks the sending window and main frame URL. External navigation, popups and permission requests are denied. Production CSP permits bundled code and forbids network connections.

## Verification

`npm run check` runs TypeScript, Vitest and the production Vite build. `npm run test:e2e` runs browser workflows in fresh Playwright contexts. `node scripts/electron-smoke.mjs` launches the production renderer through Electron in a new project-local profile and checks SQLite save/restart. `npm run dist:win` builds a Windows NSIS installer plus an unpacked application in `release/`.

The Vite watcher excludes generated output and the resolved workspace-level runtime `data/` directory. Curriculum source under `src/data/` remains watched, including new content modules. `node tests/learning/browser.smoke.mjs` exercises all seven word modes against that development server. Browser regressions cover complete word/grammar sessions at each level and additive old-profile migration, including disk-full retry and legacy-card deletion. The packaged smoke additionally checks the running application version, saved card counts by level and a real C2 grammar lesson before and after SQLite restart.

Listening depends on an installed local German speech voice. When no supported voice exists, the UI explains the limitation. The application does not download voices or invoke an online speech service.
