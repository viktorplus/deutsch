# ADR 0002: Typed learning logic and serialized persistence

Status: Accepted

## Context

Vocabulary, grammar, review, mistakes, statistics, and settings share local state. Repeated submissions, interrupted sessions, and storage failures must not duplicate attempts or lose submitted results. German answer feedback must be predictable without implying unrestricted linguistic analysis.

## Decision

Share the explicit TypeScript domain contracts in `src/types.ts`: words, grammar exercises/topics, attempts, schedules, mistakes, settings, and versioned application state. Validate persisted data at the storage boundary; TypeScript types alone do not validate loaded bytes.

Features access state through `useAppStore()` and await its `update` promise before advancing. The agreed store contract clones state, serializes updates, persists before publishing the new state, and reports failures without publishing the failed update. Hydration must finish before defaults may be saved. Features do not call storage directly.

Keep answer checking behind the pure `checkAnswer(actual, expected, strict, alternatives?)` boundary. It returns a correctness flag, a category (`correct`, `spelling`, `grammar`, or `wrong`), and an explanation. Strict checking preserves significant German distinctions. Soft checking permits the specified whitespace, terminal punctuation, and transliteration tolerance, while still requiring significant articles, pronouns, and grammar. Exercise-specific alternatives and explanations provide the authoritative context.

Record each submitted attempt once. A failed save retains the answer and presents the error. Successful remediation changes the relevant mistake's resolved state while preserving attempt history.

## Rationale

One asynchronous update path gives every learning surface the same persistence ordering and failure behavior. Pure checking and scheduling seams can be tested without UI or desktop runtime dependencies. Conservative, exercise-bound feedback supports useful explanations without claiming a general German grammar engine.

Alternatives and costs:

- Direct storage calls in each feature: initially short code, but duplicated validation, ordering, and error handling invite inconsistent results.
- Publish UI state before persistence: faster apparent progression, but a failed write can make completion appear saved when it is not.
- Remote or unrestricted language analysis: introduces unavailable offline dependencies or unjustified correctness claims. The chosen checker instead requires curated answers and exercise explanations.

## Consequences

Every consumer must await updates and prevent repeat submissions while a submission is pending. Serialized whole-state updates cost cloning and persistence time. New schema fields require validation and compatibility work at the shared boundary. A future storage adapter must preserve the same observable contract; no Supabase implementation is claimed by this decision.
