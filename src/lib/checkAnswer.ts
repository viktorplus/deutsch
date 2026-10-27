export interface AnswerResult { correct: boolean; category: 'correct' | 'spelling' | 'grammar' | 'wrong'; explanation: string }
const soft = (value: string) => value.normalize('NFC').trim().replace(/\s+/g, ' ').replace(/[.!?…]+$/, '').trim().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss').replace(/ẞ/g, 'SS');
export function checkAnswer(actual: string, expected: string, strict: boolean, alternatives: string[] = []): AnswerResult {
  const normalize = strict ? (value: string) => value.normalize('NFC') : soft;
  const answer = normalize(actual); const accepted = [expected, ...alternatives].map(normalize);
  if (accepted.includes(answer)) return { correct: true, category: 'correct', explanation: strict ? 'Верно! Ответ совпадает с образцом.' : 'Верно! Учтены пробелы, конечная пунктуация и немецкая транслитерация.' };
  const meaningful = (value: string) => value.toLocaleLowerCase('de').replace(/[.,!?;:]/g, '').trim().split(/\s+/).filter(Boolean);
  const actualWords = meaningful(actual); const expectedWords = meaningful(expected);
  if (!actualWords.length) return { correct: false, category: 'wrong', explanation: 'Введите ответ и сравните его с образцом.' };
  const grammarWords = new Set(['der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines', 'sich', 'mich', 'dich', 'uns', 'euch', 'mir', 'dir', 'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'nicht', 'kein', 'keine']);
  const removed = expectedWords.filter(word => !actualWords.includes(word));
  const added = actualWords.filter(word => !expectedWords.includes(word));
  if (actualWords.length !== expectedWords.length || removed.some(word => grammarWords.has(word)) || added.some(word => grammarWords.has(word))) return { correct: false, category: 'grammar', explanation: 'Проверьте все слова, артикль, местоимение и форму по образцу. Пропущенные слова не принимаются.' };
  const letters = (value: string) => soft(value).toLocaleLowerCase('de').replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');
  if (letters(actual) === letters(expected)) return { correct: false, category: 'spelling', explanation: 'Проверьте регистр букв, умлауты, ß, пробелы и пунктуацию. В строгом режиме требуется точный ответ.' };
  return { correct: false, category: 'wrong', explanation: 'Ответ отличается от образца. Сравните значение, порядок слов и окончания; проверка не заменяет полный языковой анализ.' };
}
