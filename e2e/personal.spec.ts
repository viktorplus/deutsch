import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('dictionary saves Unicode, edits and confirms deletion without losing history', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Мой словарь', exact: true }).click();
  await page.getByRole('button', { name: 'Добавить слово', exact: true }).click();
  await page.getByLabel('Немецкое слово').fill('Möglichkeit');
  await page.getByLabel('Перевод', { exact: true }).fill('возможность');
  await page.getByRole('combobox', { name: 'Артикль', exact: true }).selectOption('die');
  await page.getByRole('combobox', { name: 'Набор', exact: true }).fill('Мой новый набор');
  await page.getByRole('button', { name: 'Сохранить слово', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Слово добавлено');
  await page.reload();
  await page.getByRole('button', { name: 'Мой словарь', exact: true }).click();
  await page.getByLabel('Поиск по словарю').fill('Möglichkeit');
  const card = page.getByTestId('dictionary-word').filter({ hasText: 'Мой новый набор' });
  await expect(card).toContainText('возможность');
  await card.getByRole('button', { name: 'Редактировать' }).click();
  await page.getByLabel('Перевод', { exact: true }).fill('шанс');
  await page.getByRole('button', { name: 'Сохранить слово', exact: true }).click();
  await expect(card).toContainText('шанс');
  await card.getByRole('button', { name: 'Удалить' }).click();
  await expect(page.getByRole('dialog')).toContainText('История ответов сохранится');
  await page.getByRole('button', { name: 'Отмена', exact: true }).click();
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Удалить' }).click();
  await page.getByRole('button', { name: 'Удалить слово', exact: true }).click();
  await expect(page.getByTestId('dictionary-word').filter({ hasText: 'Мой новый набор' })).toHaveCount(0);
});

test('settings persist and zero activity never unlocks achievements', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Статистика', exact: true }).click();
  await expect(page.getByText('Пока нет сохранённых ответов.', { exact: false })).toBeVisible();
  await expect(page.getByText('Получено', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await page.getByRole('combobox', { name: 'Тема оформления' }).selectOption('dark');
  await page.getByRole('combobox', { name: 'Уровень обучения', exact: true }).selectOption('B2');
  await page.getByLabel('Строгая проверка немецкого').uncheck();
  await page.getByLabel('Слов за тренировку').fill('4');
  await page.getByLabel('Дневная цель, ответов').fill('8');
  await page.getByRole('button', { name: 'Сохранить настройки' }).click();
  await expect(page.getByRole('status')).toContainText('Настройки сохранены');
  await page.reload();
  await page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('combobox', { name: 'Уровень обучения', exact: true })).toHaveValue('B2');
  await expect(page.getByLabel('Строгая проверка немецкого')).not.toBeChecked();
  await expect(page.getByLabel('Слов за тренировку')).toHaveValue('4');
  await expect(page.getByLabel('Дневная цель, ответов')).toHaveValue('8');
});

test('CSV import is atomic and export respects set filters and neutralizes formulas', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Мой словарь', exact: true }).click();
  const initial = await page.getByTestId('dictionary-word').count();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Импорт CSV', exact: true }).click();
  await (await chooserPromise).setFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from('german,russian\nfirst,первый\nbroken,\n') });
  await expect(page.getByRole('alert')).toContainText('Строка 3');
  await expect(page.getByTestId('dictionary-word')).toHaveCount(initial);
  await page.getByLabel('Файл CSV', { exact: true }).setInputFiles({ name: 'valid.csv', mimeType: 'text/csv', buffer: Buffer.from('\uFEFFgerman;russian;level;set\r\nübermorgen;послезавтра;A2;Import\r\n"=1+1";формула;A2;Import\r\n') });
  await expect(page.getByRole('status')).toContainText('Импортировано слов: 2');
  await page.getByRole('combobox', { name: 'Фильтр набора' }).selectOption('Import');
  await expect(page.getByTestId('dictionary-word')).toHaveCount(2);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Экспорт CSV' }).click();
  const download = await downloadPromise;
  const contents = await readFile((await download.path())!, 'utf8');
  expect(contents).toContain('übermorgen');
  expect(contents).toContain("'=1+1");
  expect(contents.split('\r\n')).toHaveLength(3);
});

test('failed save retains editor answer and allows retry', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Мой словарь', exact: true }).click();
  await page.getByRole('button', { name: 'Добавить слово', exact: true }).click();
  await page.getByLabel('Немецкое слово').fill('früh');
  await page.getByLabel('Перевод', { exact: true }).fill('рано');
  await page.evaluate(() => { const original = Storage.prototype.setItem; Object.assign(window, { restoreStorage: () => { Storage.prototype.setItem = original; } }); Storage.prototype.setItem = () => { throw new Error('Storage is full'); }; });
  await page.getByRole('button', { name: 'Сохранить слово', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Storage is full');
  await expect(page.getByLabel('Немецкое слово')).toHaveValue('früh');
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Сохранить слово' })).toBeEnabled();
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.evaluate(() => { (window as unknown as { restoreStorage: () => void }).restoreStorage(); });
  await page.getByRole('button', { name: 'Сохранить слово', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('Слово добавлено');
});

