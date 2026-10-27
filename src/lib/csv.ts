import type { Level, Word } from '../types';
const columns = ['german', 'russian', 'article', 'plural', 'example', 'exampleTranslation', 'level', 'topic', 'set'] as const;
export function parseWordsCsv(text: string): Word[] {
  if (new TextEncoder().encode(text).length > 5 * 1024 * 1024) throw new Error('Размер CSV не должен превышать 5 МБ.');
  const source = text.replace(/^\uFEFF/, '');
  const firstLine = source.split(/\r?\n/, 1)[0];
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';
  const rows: string[][] = []; let row: string[] = []; let field = ''; let quoted = false; let closed = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) { if (char === '"') { if (source[i + 1] === '"') { field += '"'; i++; } else { quoted = false; closed = true; } } else field += char; continue; }
    if (char === '"') { if (field || closed) throw new Error(`Строка ${rows.length + 1}: неожиданные кавычки.`); quoted = true; continue; }
    if (char === delimiter) { row.push(field); field = ''; closed = false; }
    else if (char === '\n' || char === '\r') { if (char === '\r' && source[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; closed = false; }
    else { if (closed) throw new Error(`Строка ${rows.length + 1}: текст после закрывающей кавычки.`); field += char; }
  }
  if (quoted) throw new Error('CSV содержит незакрытые кавычки.');
  if (field || row.length || closed) { row.push(field); rows.push(row); }
  const header = rows.shift()?.map(cell => cell.trim());
  if (!header?.includes('german') || !header.includes('russian') || new Set(header).size !== header.length) throw new Error('CSV должен содержать уникальные столбцы german и russian.');
  const words: Word[] = [];
  rows.forEach((cells, index) => {
    if (cells.every(cell => !cell.trim())) return;
    if (cells.length !== header.length) throw new Error(`Строка ${index + 2}: число ячеек не совпадает с заголовком.`);
    const item = Object.fromEntries(header.map((key, i) => [key, cells[i]]));
    if (!item.german.trim() || !item.russian.trim()) throw new Error(`Строка ${index + 2}: заполните german и russian.`);
    if (item.article && !['der', 'die', 'das'].includes(item.article)) throw new Error(`Строка ${index + 2}: артикль должен быть der, die или das.`);
    if (item.level && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(item.level)) throw new Error(`Строка ${index + 2}: неизвестный уровень.`);
    words.push({ id: crypto.randomUUID(), german: item.german.trim(), russian: item.russian.trim(), article: item.article as Word['article'] || undefined, plural: item.plural || undefined, example: item.example || '', exampleTranslation: item.exampleTranslation || '', level: (item.level || 'A1') as Level, topic: item.topic || 'Мои слова', set: item.set || 'Мой набор', custom: true });
  });
  if (!words.length) throw new Error('CSV не содержит слов для импорта.');
  return words;
}
export function exportWordsCsv(words: Word[]): string {
  const quote = (value: string) => `"${(/^[\s]*[=+\-@\t\r]/.test(value) ? `'${value}` : value).replace(/"/g, '""')}"`;
  return '\uFEFF' + [columns.join(','), ...words.map(word => columns.map(column => quote(word[column] ?? '')).join(','))].join('\r\n');
}
