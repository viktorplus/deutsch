# ADR 0003: SM-2 review and progress derived from recorded activity

Status: Accepted

## Context

The application needs due-word review, useful mistake practice, and honest progress across the home and statistics screens. Selected course level and completed exercises do not establish certified German ability. Empty and advanced-content states must not invent learning activity.

## Decision

Use SM-2 scheduling through the pure `scheduleReview(previous, rating, now?)` seam. Support Again, Hard, Good, and Easy; retain repetition count, interval, ease with a 1.3 floor, and due timestamp. Each rating produces one review event and one schedule update. The due queue excludes future items and deleted personal cards.

Derive activity metrics from recorded attempts and schedules through `getStats(state, now?)`. Group study history by the learner's local calendar day. Count correct answers, activity, word and grammar attempts, and due reviews from those records. Allow a streak to include yesterday while today's activity is still pending.

Daily assignments require five word attempts and three grammar attempts today. The configurable daily goal is a separate target. Achievements depend on real attempts and streaks. Zero activity remains zero. Resolve mistakes through successful targeted practice without deleting the original history.

Treat the selected A1–C2 level as a learning preference. The initial A1–A2 scope was expanded on 2026-10-20: version 1.1.0 provides real word and grammar material for all six levels. Availability and selected level still earn no progress; only saved attempts do. Original topic titles and exercise IDs remain compatible with recorded mistakes and history.

Upgrade existing profiles additively on hydration using only the new expansion word IDs. Keep existing card edits, personal content and all progress fields, validate before and after upgrade, and persist a changed profile before publishing it. Retry failed saves without resetting data. Existing legacy-card absence is respected; opening the application does not restore an original starter card removed from an old profile.

## Rationale

SM-2 supplies explicit review state and was selected in the specification instead of FSRS. Shared derivation gives the home screen, daily assignments, and statistics the same evidence. Separating attempts, schedules, and unresolved mistakes avoids treating activity, review timing, and remediation as interchangeable measures.

Alternatives and costs:

- FSRS: an alternative scheduling model, but outside the chosen scope and would require a different scheduling contract and validation.
- Independently incremented UI counters: convenient, but can diverge from persisted attempts after failures, reloads, or remediation.
- Progress inferred from the selected level or placeholder course content: easy to display, but misrepresents both recorded learning and available material.

## Consequences

Ratings and submitted exercises must remain deduplicated. Time-dependent behavior requires controlled dates in checks, including future due items and local-day boundaries. Deleted cards remain excluded from training while historical attempts remain available. Derived counts may require optimization as history grows. These metrics describe application activity; they do not certify language proficiency.
