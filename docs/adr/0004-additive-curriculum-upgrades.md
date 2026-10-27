# ADR 0004: Additive curriculum upgrades with stable identifiers

Status: Accepted

## Context

The A1–A2 baseline already has persisted learner profiles. The curriculum expansion adds material for all six A1–C2 levels, but changing the initial dataset alone does not upgrade existing profiles. Those profiles may contain edited built-in cards, personal cards, missing legacy cards, attempts, mistakes, schedules, and settings that must survive the expansion.

The existing state has no applied-seed registry or deletion tombstones. An absent original card cannot safely be treated as an instruction to restore it. Grammar attempts and mistakes also refer to existing exercise identifiers, and weak-topic matching depends on existing topic titles.

## Decision

Upgrade existing profiles additively during hydration. Merge only the explicit `expansionWords` collection of new built-in words by stable identifier. Keep the full `starterWords` collection for a fresh empty store; do not use that full collection as the upgrade input for an existing profile.

An existing word with the same identifier always wins, including a custom card or an edited built-in card. Preserve existing words and their order, append only missing expansion identifiers, and never replace or remove stored cards. Do not resurrect absent cards from the original 48-word baseline. Reject duplicate identifiers in the expansion seeds as a content validation error rather than selecting an arbitrary winner.

Preserve all attempts, mistakes, schedules, and settings. Keep the original word identifiers and content, the original grammar topic identifiers and titles, and the original exercise identifiers, prompts, answers, and practice/final-test placement. Append new grammar exercises and topics without reassigning old identifiers. Grammar remains bundled content and does not require a profile migration.

Run the optional upgrade through the serialized storage boundary. Validate the loaded profile before merging and validate the result afterward. If an existing profile changes, await persistence before publishing the private snapshot or reporting hydration ready. A fresh empty store uses the complete initial dataset without a migration write; an unchanged existing profile requires no upgrade save.

Read, validation, and write failures must surface through the existing error and retry path. Retain the prior persisted and visible state when an upgrade fails. Repeating a successful upgrade adds nothing, and retrying a failed upgrade remains safe. No reset or deletion is part of this policy.

## Rationale

Stable identifiers keep historical references meaningful. Existing-record precedence protects learner edits and personal content even when an identifier collides. An explicit expansion-only collection distinguishes new teaching material from legacy cards whose absence must be respected. Validation and persistence before publication prevent the UI from claiming that an upgrade succeeded when its durable save failed.

Alternatives and costs:

- Replace stored words with the expanded built-in dataset: simple to implement, but discards personal cards and edits and can break the relationship between retained history and current content.
- Reset the profile to fresh defaults: guarantees a uniform dataset, but destroys learning history, schedules, mistakes, and preferences, contrary to the preservation requirement.
- Merge every card from the full `starterWords` dataset: retains existing collisions, but restores missing legacy cards because the state cannot distinguish intentional absence from missing initialization.
- Change only fresh-profile defaults: avoids a migration, but leaves existing learners without the new curriculum.

## Consequences

Content authors must maintain an explicit collection of new expansion words and globally unique, stable identifiers. This upgrade does not distribute corrections to existing cards or restore previously removed legacy cards; either behavior would need a separate compatibility policy. No new state field, database schema, or persistence engine is required by this additive expansion.

Verification must cover an old profile with personal content and history, missing legacy cards, identifier collisions, duplicate seed rejection, repeated hydration, invalid stored data, and failed-save retry. Restart checks must confirm both preserved progress and persisted additions. Course availability and selected level remain separate from earned progress and certified proficiency.
