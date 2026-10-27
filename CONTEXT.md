# DeutschMaster glossary

| Term | Meaning in this project |
|---|---|
| Learning attempt / учебная попытка | A saved word or grammar submission with a unique id, item, mode, actual and expected answers, correctness, explanation, and timestamp. It is historical evidence, not a session counter. |
| Learning session / тренировка | A chosen sequence of exercises. Ending or interrupting it must retain already submitted results. |
| Review rating / оценка повторения | Again, Hard, Good, or Easy: a learner response that produces one review event and updates an item's SM-2 schedule. |
| Due review / пора повторить | A reviewable word whose saved due timestamp has arrived. Future schedules and deleted personal cards do not belong in the due queue. |
| SM-2 schedule / расписание повторений | Per-item repetition count, interval, ease, and due timestamp. Ease has a minimum of 1.3. |
| Mistake / ошибка | A retained incorrect attempt reference with its actual/expected answer, explanation, timestamp, and resolved flag. Both word and grammar mistakes are supported. |
| Mistake remediation / работа над ошибкой | Successful targeted practice that resolves the relevant mistake entries while preserving the underlying attempt history. |
| Studied words / изученные слова | The `studiedWords` metric derived by shared statistics from recorded activity. It is an application metric, not proof of permanent mastery. |
| Selected learning level / выбранный уровень обучения | The A1–C2 course preference stored in settings. It is not a placement result or certified ability. All six levels have word and grammar material; choosing a level does not itself earn progress. |
| Certified ability / подтверждённое владение языком | An externally assessed proficiency claim. DeutschMaster's selected level and activity metrics do not provide this certification. |
| Daily goal / ежедневная цель | A configurable activity target, separate from the daily assignments of five word attempts and three grammar attempts. |
| Streak / серия дней | Consecutive local calendar days with recorded activity; yesterday may sustain the streak while today is still pending. |
| Strict / soft checking | Strict mode enforces significant German distinctions. Soft mode permits the specified formatting and transliteration tolerance without accepting omitted significant words or wrong grammar. |
| Storage snapshot | The versioned `AppState` persisted through the async storage contract. Desktop SQLite also retains normalized attempt and review history. |
| Browser preview | Development use of the application with LocalStorage behind the shared async storage contract, visibly distinguished from desktop SQLite. |
