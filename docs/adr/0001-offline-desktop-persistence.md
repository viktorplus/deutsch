# ADR 0001: Offline desktop persistence with a browser preview adapter

Status: Accepted

## Context

DeutschMaster must work offline on Windows and preserve learning results across restarts. The brief also requests browser-style local persistence and allows a future Supabase integration. These requirements need one coherent primary runtime and a clear preview mode.

## Decision

Use Electron as the desktop runtime and SQLite in Electron main as the primary local persistence layer. Persist an `AppState` snapshot together with normalized attempt and review history. The foundation handoff specifies atomic file replacement after fsync and retention of original bytes when corrupt data cannot be read.

Expose only the narrow asynchronous `window.deutschStorage.load()` / `save(state)` preload boundary. Keep context isolation enabled, node integration disabled, and validate IPC senders. Bundle the WASM and application assets; runtime must not depend on CDN resources or a backend.

Use LocalStorage behind the same contract for browser development preview, and identify that storage mode in the UI. Development data belongs in project `data/`; packaged data belongs in a writable per-user directory. Isolated desktop test profiles must remain inside the workspace.

Keep the development integration constraints with this runtime decision:

- D01: Exclude generated dashboard, profile/data, build, and test output from Vite watching while keeping source HMR enabled. Generated HTML otherwise triggers full reloads during acceptance.
- D02: The execution host inherits `ELECTRON_RUN_AS_NODE`. The local Electron launcher removes it only from the child environment; it does not change the system or parent environment.
- D03: Scope the runtime-data watcher exclusion to the resolved project data directory. A broad data glob also excluded `src/data`, causing stale curriculum module exports. Curriculum source changes must remain watched.

## Rationale

Desktop SQLite satisfies the explicit Windows/offline requirement while a shared storage contract keeps browser preview useful. A snapshot restores the complete application state; normalized history preserves explicit attempt and review records. Keeping SQLite outside the renderer limits the renderer's access to filesystem operations.

Alternatives and costs:

- Browser-only LocalStorage: simpler packaging, but does not deliver the requested Windows desktop product and SQLite persistence.
- IndexedDB: adds another persistence implementation without a current requirement; it does not replace desktop SQLite.
- A hosted backend now: adds network and account dependencies inconsistent with the current offline scope. A future adapter may be considered separately.

## Consequences

Electron packaging, IPC validation, bundled assets, and restart verification remain required work. Snapshot and normalized histories must stay consistent within a save. Browser preview and desktop have different storage engines and must be verified separately. Whole-state snapshots impose copying and serialization costs as history grows; no scaling limit is asserted here.
