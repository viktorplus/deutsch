# Grammar curriculum sources

Verified on 2026-10-20. The Russian explanations, reference tables, German examples,
translations, questions and feedback are authored for DeutschMaster. Sources below
were used to check grammatical principles, not to copy exercises. Short conventional
forms such as *sei* or *geprüft worden* are language examples, not quoted teaching text.

## Scope and compatibility

The course contains 35 topics: A1 7, A2 7, B1 7, B2 5, C1 5, C2 4.
Every topic provides six practice questions and three final questions: 210 practice
and 105 final questions in total. A1/A2 retain the original 14 topic IDs/titles and
all 56 original question IDs, prompts, answers and section assignments from b068850.
New legacy practice IDs are 5–7; new legacy final IDs are 8–9. New advanced topics
use separate `practice-N` and `final-N` IDs. No learner activity is seeded.

Levels indicate a teaching sequence. They are not a certified CEFR assessment or a
claim that these 35 lessons exhaust German grammar. Advanced lessons use constrained
sentence construction, transformations and contextual gaps. They exercise grammar,
argument structure and register rather than isolated word translation. Explicit
alternatives cover contractions and selected equivalent connectors; the checker is
not an unrestricted natural-language evaluator.

## Primary reference map

| Source | Checked principle | Applied topics |
| --- | --- | --- |
| [IDS: Schwa bei den Flexionsmarkern der Verbflexion](https://grammis.ids-mannheim.de/progr@mm/4119) | Schwa insertion for stems ending in plosive/fricative plus nasal; no such insertion in lernt | present |
| [IDS: Nebensatz](https://grammis.ids-mannheim.de/sgt/2256) | Introduced subordinate clauses, relative pronoun case, subject clauses and infinitival clauses | subordinate, connectors, relative, complex-syntax |
| [IDS: Stellungsfelder und Satzklammer](https://grammis.ids-mannheim.de/systematische-grammatik/1241) | Verb-second main clauses and sentence brackets | word-order, separable, subordinate |
| [IDS: Satzklammer und Stellungsfelder](https://grammis.ids-mannheim.de/kontrastive-grammatik/4385) | Final verb groups, passive perfect, fronted auxiliary with modal Ersatzinfinitiv | passive-modals, complex-passive, subjunctive-past, complex-syntax |
| [IDS: Genus Verbi: Aktiv und Passiv](https://grammis.ids-mannheim.de/systematische-grammatik/928) | Distinct werden-, sein- and bekommen-passives and changed argument structure | passive, complex-passive |
| [IDS: Passiv](https://grammis.ids-mannheim.de/terminologie/183) | Passive auxiliary plus Partizip II; retained and changed complements | passive, passive-modals, complex-passive |
| [IDS: Rektion](https://grammis.ids-mannheim.de/vggf/2273?termini=term) | Verbs and prepositions determine complement form and case | dative, verb-government, professional-style |
| [IDS: Starke und schwache Adjektivflexion](https://grammis.ids-mannheim.de/progr%40mm/6751) | Strong/weak adjective endings by case, gender and number | adjective-declension, participial-attributes |
| [IDS: Adjektiv](https://grammis.ids-mannheim.de/progr%40mm/5255) | Attributive inflection versus uninflected predicative use | comparative, adjective-declension |
| [IDS: Direkte und indirekte Redewiedergabe](https://grammis.ids-mannheim.de/systematische-grammatik/544) | Verb mood alone does not establish the reporter's belief or disbelief | reported-speech, subjunctive-distancing |
| [IDS: Originaläußerung und indirekte Wiedergabe](https://grammis.ids-mannheim.de/systematische-grammatik/643) | Preserve reference and proposition while changing person or deixis | reported-speech, subjunctive-distancing |
| [IDS: Modalverben im Verbalkomplex](https://grammis.ids-mannheim.de/kontrastive-grammatik/3363) | Epistemic/deontic modality, reported claims with sollen/wollen, perfect infinitives | academic-style, subjunctive-distancing |
| [IDS: Attribut](https://grammis.ids-mannheim.de/vggf/2267?termini=both) | Genitive and prepositional attributes, nominalized verbs, participial attributes and formal nominal style | nominalization, participial-attributes, nominal-style |
| [Duden: gemäß](https://www.duden.de/rechtschreibung/gemaesz_bezueglich_laut) | Normal Dativ government, with rare Genitiv variants | professional-style |
| [Duden: mangels](https://www.duden.de/rechtschreibung/mangels) | Genitiv in a marked phrase such as an adjective plus plural noun | nominal-style |
| [Duden: wegen / aufgrund](https://www.duden.de/sprachwissen/sprachratgeber/%E2%80%9Ewegen%E2%80%9C%E2%80%9Eaufgrund%E2%80%9C) | Distinguish marked plural Genitiv from unmarked constructions and Dativ variants | nominalization, nominal-style |

## Editorial checks and deliberate limits

Subordinate-clause explanations qualify the usual final-verb rule; the advanced
Ersatzinfinitiv lesson explicitly teaches its exception. Passive lessons distinguish
process from resulting state and do not claim all verbs permit passive conversion.
Indirect-speech lessons do not equate Konjunktiv II automatically with doubt.
Nominal transformations retain object/agent roles and the temporal, causal or
conditional relation. Case-sensitive pronoun tasks specify sentence position.

Tasks requesting one construction (for example Genitiv, Konjunktiv I, a specific
connector or a stated starting phrase) intentionally assess that construction.
Other grammatical paraphrases are outside those constrained task instructions.
The main dataset module retains the original `makeTopic` helper's first-three/rest
behavior for compatibility; additive supplements are applied afterwards so the old
final question 4 never moves into practice.

Verification: `npm test -- tests/learning/grammar-expanded.test.ts` checks the level
minimums, per-topic question minimums, translated examples, nonempty tables, global
IDs, specific Russian feedback, practice/final answer separation (including listed
alternatives), required topic families and a frozen 56-question baseline fixture.
The full application gate remains `npm run check`.
