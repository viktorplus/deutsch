import { expect, it } from 'vitest';
import { grammarTopics } from '../../src/data/grammar';

it('delivers the complete six-level curriculum with stable legacy questions and independent final assessment', () => {
  const minimums = { A1: 7, A2: 7, B1: 7, B2: 5, C1: 5, C2: 4 };
  expect(grammarTopics.length).toBeGreaterThanOrEqual(35);
  for (const [level, minimum] of Object.entries(minimums)) {
    const count = grammarTopics.filter(topic => topic.level === level).length;
    if (level === 'A1' || level === 'A2') expect(count).toBe(minimum);
    else expect(count).toBeGreaterThanOrEqual(minimum);
  }
  const ids: string[] = [];
  for (const topic of grammarTopics) {
    ids.push(topic.id);
    expect(topic.explanation, topic.id).toMatch(/[А-Яа-яЁё]/);
    expect(topic.explanation.length, topic.id).toBeGreaterThan(90);
    expect(topic.table.length, topic.id).toBeGreaterThanOrEqual(3);
    expect(topic.table.every(row => row.length >= 2 && row.every(cell => cell.trim().length > 0)), topic.id).toBe(true);
    expect(topic.examples.length, topic.id).toBeGreaterThanOrEqual(1);
    for (const example of topic.examples) {
      expect(example.german, topic.id).toMatch(/[a-zäöüß]/i);
      expect(example.russian, topic.id).toMatch(/[А-Яа-яЁё]/);
      expect(example.german, topic.id).not.toBe(example.russian);
    }
    expect(topic.exercises.length, topic.id).toBeGreaterThanOrEqual(6);
    expect(topic.finalTest.length, topic.id).toBeGreaterThanOrEqual(3);
    const practiceAnswers = new Set(topic.exercises.flatMap(question => [question.answer, ...(question.alternatives ?? [])]).map(answer => answer.trim().toLocaleLowerCase('de')));
    for (const question of [...topic.exercises, ...topic.finalTest]) {
      ids.push(question.id);
      expect(question.prompt.trim().length, question.id).toBeGreaterThan(12);
      expect(question.answer.trim().length, question.id).toBeGreaterThan(0);
      expect(question.explanation.length, question.id).toBeGreaterThan(20);
      expect(question.explanation, question.id).toMatch(/[А-Яа-яЁё]/);
    }
    for (const question of topic.finalTest) {
      for (const answer of [question.answer, ...(question.alternatives ?? [])]) expect(practiceAnswers.has(answer.trim().toLocaleLowerCase('de')), question.id).toBe(false);
    }
    expect(new Set([...topic.exercises, ...topic.finalTest].map(question => question.prompt)).size, topic.id).toBe(topic.exercises.length + topic.finalTest.length);
    if (['B2', 'C1', 'C2'].includes(topic.level)) {
      expect(topic.exercises.every(question => question.prompt.includes('___') || question.answer.split(' ').length >= 3), topic.id).toBe(true);
    }
  }
  expect(new Set(ids).size).toBe(ids.length);
  // Independent golden fixture from the committed b068850 curriculum.
  const legacy = [
  {
    "id": "articles",
    "title": "Артикли: der, die, das",
    "questions": [
      [
        "Вставьте определённый артикль: ___ Tisch",
        "der"
      ],
      [
        "Вставьте определённый артикль: ___ Tür",
        "die"
      ],
      [
        "Вставьте неопределённый артикль: ___ Bett",
        "ein"
      ],
      [
        "Переведите с определённым артиклем: книга",
        "das Buch"
      ]
    ]
  },
  {
    "id": "pronouns",
    "title": "Личные местоимения",
    "questions": [
      [
        "Замените Anna: ___ lernt Deutsch.",
        "Sie"
      ],
      [
        "Замените Paul: ___ wohnt hier.",
        "Er"
      ],
      [
        "Замените Paul und ich: ___ lernen.",
        "Wir"
      ],
      [
        "Замените du und Anna: ___ kommt morgen.",
        "Ihr"
      ]
    ]
  },
  {
    "id": "present",
    "title": "Настоящее время: Präsens",
    "questions": [
      [
        "Вставьте lernen: ich ___",
        "lerne"
      ],
      [
        "Вставьте machen: du ___",
        "machst"
      ],
      [
        "Вставьте wohnen: er ___",
        "wohnt"
      ],
      [
        "Вставьте spielen: ihr ___",
        "spielt"
      ]
    ]
  },
  {
    "id": "sein-haben",
    "title": "Глаголы sein и haben",
    "questions": [
      [
        "Вставьте sein: Ich ___ müde.",
        "bin"
      ],
      [
        "Вставьте haben: Du ___ Zeit.",
        "hast"
      ],
      [
        "Вставьте sein: Wir ___ hier.",
        "sind"
      ],
      [
        "Вставьте haben: Ihr ___ ein Buch.",
        "habt"
      ]
    ]
  },
  {
    "id": "accusative",
    "title": "Винительный падеж: Akkusativ",
    "questions": [
      [
        "Определённый артикль: Ich sehe ___ Mann.",
        "den"
      ],
      [
        "Неопределённый артикль: Ich kaufe ___ Tisch.",
        "einen"
      ],
      [
        "Определённый артикль: Ich lese ___ Buch.",
        "das"
      ],
      [
        "Переведите: Я вижу собаку. (с определённым артиклем)",
        "Ich sehe den Hund."
      ]
    ]
  },
  {
    "id": "word-order",
    "title": "Порядок слов",
    "questions": [
      [
        "Соберите: heute / Ich / lerne",
        "Ich lerne heute."
      ],
      [
        "Соберите, начав с Heute: ich / lerne / Heute",
        "Heute lerne ich."
      ],
      [
        "Составьте вопрос да/нет: du / heute / Lernst",
        "Lernst du heute?"
      ],
      [
        "Соберите, начав с Morgen: wir / arbeiten / Morgen",
        "Morgen arbeiten wir."
      ]
    ]
  },
  {
    "id": "negation",
    "title": "Отрицание: nicht и kein",
    "questions": [
      [
        "Вставьте отрицание: Das ist ___ Buch.",
        "kein"
      ],
      [
        "Вставьте отрицание: Die Tasche ist ___ teuer.",
        "nicht"
      ],
      [
        "Вставьте отрицание: Ich habe ___ Zeit.",
        "keine"
      ],
      [
        "Отрицайте целое предложение: Ich arbeite.",
        "Ich arbeite nicht."
      ]
    ]
  },
  {
    "id": "dative",
    "title": "Дательный падеж: Dativ",
    "questions": [
      [
        "Определённый артикль: Ich helfe ___ Mann.",
        "dem"
      ],
      [
        "Определённый артикль: Ich danke ___ Frau.",
        "der"
      ],
      [
        "Определённый артикль: mit ___ Kindern",
        "den"
      ],
      [
        "Переведите: Я помогаю ребёнку. (с определённым артиклем)",
        "Ich helfe dem Kind."
      ]
    ]
  },
  {
    "id": "perfect",
    "title": "Прошедшее время: Perfekt",
    "questions": [
      [
        "Вставьте вспомогательный глагол: Ich ___ gelernt.",
        "habe"
      ],
      [
        "Вставьте вспомогательный глагол: Er ___ nach Hause gegangen.",
        "ist"
      ],
      [
        "Partizip II от kaufen",
        "gekauft"
      ],
      [
        "Переведите: Мы сделали это. (das)",
        "Wir haben das gemacht."
      ]
    ]
  },
  {
    "id": "modals",
    "title": "Модальные глаголы",
    "questions": [
      [
        "Вставьте können: Ich ___ schwimmen.",
        "kann"
      ],
      [
        "Вставьте müssen: Du ___ lernen.",
        "musst"
      ],
      [
        "Соберите: Wir / heute / müssen / arbeiten",
        "Wir müssen heute arbeiten."
      ],
      [
        "Вставьте dürfen: Ihr ___ hier bleiben.",
        "dürft"
      ]
    ]
  },
  {
    "id": "reflexive",
    "title": "Возвратные глаголы",
    "questions": [
      [
        "Вставьте местоимение: Ich freue ___ auf morgen.",
        "mich"
      ],
      [
        "Вставьте местоимение: Du freust ___ auf die Reise.",
        "dich"
      ],
      [
        "Вставьте местоимение: Wir freuen ___ auf das Fest.",
        "uns"
      ],
      [
        "Переведите: Она радуется.",
        "Sie freut sich."
      ]
    ]
  },
  {
    "id": "separable",
    "title": "Отделяемые приставки",
    "questions": [
      [
        "Вставьте приставку: Ich stehe früh ___. (aufstehen)",
        "auf"
      ],
      [
        "Вставьте приставку: Er ruft mich ___. (anrufen)",
        "an"
      ],
      [
        "Вставьте приставку: Wir kaufen heute ___. (einkaufen)",
        "ein"
      ],
      [
        "Переведите: Я звоню тебе. (anrufen)",
        "Ich rufe dich an."
      ]
    ]
  },
  {
    "id": "prepositions",
    "title": "Предлоги места: wo? wohin?",
    "questions": [
      [
        "Определённый артикль: Das Buch liegt auf ___ Tisch.",
        "dem"
      ],
      [
        "Определённый артикль: Ich lege das Buch auf ___ Tisch.",
        "den"
      ],
      [
        "Определённый артикль: Wir sind in ___ Schule.",
        "der"
      ],
      [
        "Вставьте слитную форму in + артикль: Ich gehe ___ Zimmer.",
        "ins"
      ]
    ]
  },
  {
    "id": "comparative",
    "title": "Сравнительная степень",
    "questions": [
      [
        "Сравнительная степень: klein",
        "kleiner"
      ],
      [
        "Сравнительная степень: alt",
        "älter"
      ],
      [
        "Вставьте союз: Anna ist älter ___ Paul.",
        "als"
      ],
      [
        "Сравнительная степень: gut",
        "besser"
      ]
    ]
  }
];
  for (const { id, title, questions } of legacy) {
    const topic = grammarTopics.find(item => item.id === id)!;
    expect(topic.title).toBe(title);
    for (let index = 0; index < 4; index++) {
      const question = index < 3 ? topic.exercises[index] : topic.finalTest[0];
      expect(question).toMatchObject({ id: `${id}-${index + 1}`, prompt: questions[index][0], answer: questions[index][1] });
    }
  }
  for (const id of ['subordinate', 'connectors', 'preterite', 'konjunktiv2', 'passive', 'relative', 'adjective-declension', 'reported-speech', 'passive-modals', 'nominalization', 'verb-government', 'complex-connectors', 'academic-style', 'professional-style', 'complex-passive', 'subjunctive-distancing', 'complex-syntax']) {
    expect(grammarTopics.some(topic => topic.id === id), id).toBe(true);
  }
});
