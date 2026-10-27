# Expanded vocabulary: authorship and lexical references

Reviewed on 2026-10-20. The bundled vocabulary contains 360 cards: 60 at each teaching level A1, A2, B1, B2, C1 and C2. The expansion adds 312 cards (28 A1, 44 A2 and 60 each B1–C2) after the unchanged original 48. The level assignments are an editorial teaching sequence, not a certified CEFR assessment or an exhaustive examination word list.

## Authorship and scope

The new German teaching sentences and Russian translations were composed for this application. No dictionary definitions, sample sentences, proprietary exercises, audio or commercial word database were imported. The references below were consulted for spelling, grammatical gender, number forms, selected meanings and verb construction. Common headwords and grammatical facts are distinguished from original teaching prose.

Each new card has one primary Russian translation for the selected meaning. Examples show that meaning in context; they do not imply that other translations are incorrect. The application's exact-answer exercises use the displayed primary translation. Noun plurals are written out; Russian notes identify singular-only nouns, rare plurals and specialist usage. For example, `Kaffees` can denote portions or kinds of coffee; `Verhalten` has a specialist unchanged plural, while everyday behavior is normally singular. Less usual plurals of abstract nouns are not evidence that they are frequent in everyday speech.

The sets progress from family and everyday life through travel, work, ecology and public life to research, professional decisions, precise argumentation and interpretation. Advanced entries are contextual vocabulary, including reflexive verbs, separable verbs, connectors and distinctions in formal written German.

## Primary orientation sources

- [Goethe-Institut: A1 word list](https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf): orientation for common personal and everyday vocabulary.
- [Goethe-Institut: A2 word list](https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_A2_Wortliste.pdf): orientation for travel, housing, appointments and practical work situations.
- [Goethe-Institut: B1 word list](https://www.goethe.de/pro/relaunch/prf/de/Goethe-Zertifikat_B1_Wortliste.pdf): orientation for opinions, relationships, work and society. Its inclusion of a word does not establish an exclusive lower learning level.

These lists were reference material, not a source of copied German example sentences or translations. B2–C2 placement is the application's editorial selection, with lexical facts checked against Duden where needed.

## Checked lexical points

| Reference | Point checked for this dataset |
| --- | --- |
| [Duden: Arzt](https://www.duden.de/rechtschreibung/Arzt), [Name](https://www.duden.de/rechtschreibung/Name_Ruf_Benennung_Bezeichnung), [Kaffee](https://www.duden.de/rechtschreibung/Kaffee) | Masculine gender and the plurals Ärzte, Namen, Kaffees. |
| [Duden: Gepäck](https://www.duden.de/rechtschreibung/Gepaeck), [Gesundheit](https://www.duden.de/rechtschreibung/Gesundheit), [Müll](https://www.duden.de/rechtschreibung/Muell) | Gender and singular-only metadata. |
| [Duden: Verantwortung](https://www.duden.de/rechtschreibung/Verantwortung), [Umwelt](https://www.duden.de/rechtschreibung/Umwelt) | Abstract nouns can have plurals; Umwelten is rare. |
| [Duden: Verhalten](https://www.duden.de/rechtschreibung/Verhalten) | Neuter noun; specialist unchanged plural, distinct from ordinary singular use. |
| [Duden: Nachhaltigkeit](https://www.duden.de/rechtschreibung/Nachhaltigkeit), [Gleichberechtigung](https://www.duden.de/rechtschreibung/Gleichberechtigung), [Datenschutz](https://www.duden.de/rechtschreibung/Datenschutz) | Sustainability, equal rights and protection of personal data in the selected contexts. Nachhaltigkeit and Gleichberechtigung are feminine; Datenschutz is masculine. |
| [Duden: Erkenntnis](https://www.duden.de/rechtschreibung/Erkenntnis_Vernunft), [Relevanz](https://www.duden.de/rechtschreibung/Relevanz), [Tragweite](https://www.duden.de/rechtschreibung/Tragweite) | Feminine nouns and the plurals Erkenntnisse, Relevanzen, Tragweiten. The selected Erkenntnis is an insight, not the Austrian neuter legal homonym. |
| [Duden: Rechenschaft](https://www.duden.de/rechtschreibung/Rechenschaft), [Verhältnismäßigkeit](https://www.duden.de/rechtschreibung/Verhaeltnismaeszigkeit) | Both allow rare plurals; these are labeled rather than incorrectly marked singular-only. |
| [Duden: Abwägung](https://www.duden.de/rechtschreibung/Abwaegung), [abwägen](https://www.duden.de/rechtschreibung/abwaegen) | Weighing considerations, feminine Abwägung/Abwägungen and the separable verb abwägen. |
| [Duden: auseinandersetzen](https://www.duden.de/rechtschreibung/auseinandersetzen), [erübrigen](https://www.duden.de/rechtschreibung/eruebrigen) | Reflexivity is retained for critically engaging with a topic and for becoming unnecessary. |
| [Duden: Ermessen](https://www.duden.de/rechtschreibung/Ermessen), [declension](https://www.duden.de/deklination/substantive/Ermessen) | Neuter singular-only noun in the sense of discretion or judgment. |
| [Duden: Unwägbarkeit](https://www.duden.de/rechtschreibung/Unwaegbarkeit) | Feminine; countable unpredictable factors permit Unwägbarkeiten. |
| [Duden: Paradigma](https://www.duden.de/rechtschreibung/Paradigma), [Dichotomie](https://www.duden.de/rechtschreibung/Dichotomie) | Gender and the plurals Paradigmen, Dichotomien; formal analytical register. |
| [Duden: Deutungshoheit](https://www.duden.de/rechtschreibung/Deutungshoheit), [Evidenz](https://www.duden.de/rechtschreibung/Evidenz) | Interpretive authority; selected empirical-evidence meaning, distinguished from immediate self-evidence and Austrian register usage. |
| [Duden: Anfechtung](https://www.duden.de/rechtschreibung/Anfechtung), [Rechtmäßigkeit](https://www.duden.de/rechtschreibung/Rechtmaeszigkeit), [Aufschluss](https://www.duden.de/rechtschreibung/Aufschluss) | Gender, selected meanings and plurals Anfechtungen, Rechtmäßigkeiten, Aufschlüsse. |
| [Duden: kontingent](https://www.duden.de/rechtschreibung/kontingent) | Philosophical non-necessity, not the capitalized noun for an allocated quota. |
| [University of Münster: seminar description](https://www.uni-muenster.de/LearnWeb/learnweb2/course/info.php?id=92982) | Primary academic usage attests the plural Forschungsstände when comparing bodies of research. |

## Compatibility and validation

`src/data/words.ts` still exposes `starterWords: Word[]`. It appends `expansionWords: Word[]` after the original 48 records; `expansionWords` contains new seeds only. Each addition has an explicit permanent `expansion-<level>-<slug>` identifier, independent of its array position. The six readable level modules live under `src/data/vocabulary/`.

`tests/learning/vocabulary-expanded.test.ts` validates six-level counts, unique IDs and normalized article-plus-headword pairs, complete bilingual metadata, noun forms and concrete lexical fixtures. It also checks all original IDs and order and the SHA-256 of every original record's serialized fields against baseline b068850. The baseline hash was captured before the dataset change, not generated from the expanded implementation. All three new tests failed before expansion for the documented missing-data conditions.

Run the focused check with `npm test -- tests/learning/vocabulary-expanded.test.ts`; the combined application gate is `npm run check`. Storage migration is owned separately and merges only these additive expansion IDs without replacing personal content or earlier records.
