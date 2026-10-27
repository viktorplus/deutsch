import { test, expect, type Page } from '@playwright/test';
import { expansionWords, starterWords } from '../src/data/words';
import { grammarTopics } from '../src/data/grammar';
import type { AppState, Level } from '../src/types';

const key = 'deutschmaster.state.v1';
const saved = (page: Page): Promise<AppState> => page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)!), key);

for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as Level[]) {
  test(`${level} completes real word, grammar practice and final sessions with durable results`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Изучение слов', exact: true }).click();
    await page.getByRole('combobox', { name: 'Уровень', exact: true }).selectOption(level);
    await page.getByRole('spinbutton', { name: 'Размер сессии' }).fill('1');
    await page.getByRole('button', { name: /Начать тренировку/ }).click();
    await page.getByRole('button', { name: 'Показать ответ' }).click();
    await page.getByRole('button', { name: '1 · Снова', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Нужно повторить');
    const wordAttempt = (await saved(page)).attempts[0];
    const word = starterWords.find(item => item.id === wordAttempt.itemId)!;
    expect(word.level).toBe(level);
    await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
    await expect(page.getByText('Сессия завершена', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Мои ошибки', exact: true }).click();
    await page.getByRole('button', { name: /Разобрать ошибки/ }).click();
    await page.getByRole('textbox', { name: 'Ваш ответ' }).fill(word.article ? `${word.article} ${word.german}` : word.german);
    await page.getByRole('button', { name: 'Проверить', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Верно');
    await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
    await page.getByRole('button', { name: 'Грамматика', exact: true }).click();
    await page.getByRole('combobox', { name: 'Уровень', exact: true }).selectOption(level);
    const topic = grammarTopics.find(item => item.level === level)!;
    expect(topic).toBeTruthy();
    await page.getByRole('button').filter({ has: page.getByRole('heading', { name: topic.title, exact: true }) }).click();
    await page.getByRole('button', { name: /^Практика ·/ }).click();
    for (const [index, exercise] of topic.exercises.entries()) {
      await page.getByRole('textbox', { name: 'Ваш ответ' }).fill(index === 0 ? 'incorrect-test-answer' : exercise.answer);
      await page.getByRole('button', { name: 'Проверить', exact: true }).click();
      await expect(page.getByRole('status')).toContainText(index === 0 ? 'Нужно повторить' : 'Верно');
      await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
    }
    await expect(page.getByText('Сессия завершена', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Новая сессия', exact: true }).click();
    await page.getByRole('button', { name: /^Итоговый тест ·/ }).click();
    for (const exercise of topic.finalTest) {
      await page.getByRole('textbox', { name: 'Ваш ответ' }).fill(exercise.answer);
      await page.getByRole('button', { name: 'Проверить', exact: true }).click();
      await expect(page.getByRole('status')).toContainText('Верно');
      await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
    }
    await expect(page.getByText('Сессия завершена', { exact: true })).toBeVisible();
    const before = await saved(page);
    expect(before.attempts).toHaveLength(2 + topic.exercises.length + topic.finalTest.length);
    expect(before.schedules[word.id].repetitions).toBe(1);
    expect(before.mistakes).toHaveLength(2);
    expect(before.mistakes[0].resolved).toBe(true);
    expect(before.mistakes[1].resolved).toBe(false);
    await page.reload();
    await page.getByRole('button', { name: 'Статистика', exact: true }).click();
    await expect(page.locator('.metric-card').filter({ hasText: 'ответов всего' }).locator('strong')).toHaveText(String(before.attempts.length));
    expect(await saved(page)).toEqual(before);
  });
}

test('old 48-card profile upgrades once while preserving edits, personal content, history and settings', async ({ page }) => {
  const words = structuredClone(starterWords.slice(0, 48));
  words[0].russian = 'мой сохранённый перевод';
  const personal = { ...words[0], id: 'custom-preserved', german: 'Testwort', custom: true, set: 'Personal preserved' };
  const collision = { ...personal, id: expansionWords[0]?.id ?? 'expansion-a1-1', german: 'Collision preserved' };
  const old: AppState = {
    version: 1, words: [...words, personal, collision],
    attempts: [{ id: 'old-word', itemId: words[0].id, kind: 'word', mode: 'review', topic: words[0].topic, userAnswer: 'Haus', expected: 'das Haus', correct: false, explanation: 'Preserved feedback', at: '2026-10-19T12:00:00Z' },
      { id: 'old-grammar', itemId: 'dative-1', kind: 'grammar', mode: 'grammar', topic: 'Дательный падеж: Dativ', userAnswer: 'der', expected: 'dem', correct: false, explanation: 'Preserved grammar feedback', at: '2026-10-19T12:05:00Z' }],
    schedules: { [words[0].id]: { itemId: words[0].id, repetitions: 4, interval: 20, ease: 2.1, due: '2027-01-01T12:00:00Z' } },
    mistakes: [{ id: 'old-mistake', attemptId: 'old-grammar', itemId: 'dative-1', kind: 'grammar', topic: 'Дательный падеж: Dativ', userAnswer: 'der', expected: 'dem', explanation: 'Preserved grammar feedback', at: '2026-10-19T12:05:00Z', resolved: false }],
    settings: { theme: 'dark', strict: false, sessionSize: 3, dailyGoal: 41, level: 'C2' },
  };
  await page.addInitScript(({ key, old }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(old)); }, { key, old });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Продолжить обучение', exact: true })).toBeVisible();
  const upgraded = await saved(page);
  expect(upgraded.words.length).toBeGreaterThanOrEqual(361);
  expect(upgraded.words.slice(0, 50)).toEqual(old.words);
  expect(new Set(upgraded.words.map(word => word.id)).size).toBe(upgraded.words.length);
  expect({ ...upgraded, words: [] }).toEqual({ ...old, words: [] });
  expect(upgraded.words.slice(50).map(word => word.id)).toEqual(expansionWords.filter(word => word.id !== collision.id).map(word => word.id));
  await page.reload();
  await expect(page.getByRole('button', { name: 'Продолжить обучение', exact: true })).toBeVisible();
  expect(await saved(page)).toEqual(upgraded);
});

test('failed migration keeps original bytes and retry preserves a deleted legacy card', async ({ page }) => {
  const old: AppState = {
    version: 1, words: structuredClone(starterWords.slice(0, 48).filter(word => word.id !== 'starter-n-2')),
    attempts: [], schedules: {}, mistakes: [],
    settings: { theme: 'light', strict: true, sessionSize: 1, dailyGoal: 15, level: 'B2' },
  };
  const bytes = JSON.stringify(old);
  await page.addInitScript(({ key, bytes }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, bytes);
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new Error('Migration test disk full');
      return original.call(this, name, value);
    };
    Object.assign(window, { restoreMigrationStorage: () => { Storage.prototype.setItem = original; } });
  }, { key, bytes });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Migration test disk full');
  expect(await page.evaluate(storageKey => localStorage.getItem(storageKey), key)).toBe(bytes);
  await expect(page.getByRole('button', { name: 'Начать обучение', exact: true })).toHaveCount(0);
  await page.evaluate(() => (window as Window & { restoreMigrationStorage: () => void }).restoreMigrationStorage());
  await page.getByRole('button', { name: 'Повторить загрузку', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Начать обучение', exact: true })).toBeVisible();
  const upgraded = await saved(page);
  expect(upgraded.words).toHaveLength(47 + expansionWords.length);
  expect(upgraded.words.some(word => word.id === 'starter-n-2')).toBe(false);
  expect(upgraded.words.slice(0, 47)).toEqual(old.words);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Начать обучение', exact: true })).toBeVisible();
  expect(await saved(page)).toEqual(upgraded);
});
