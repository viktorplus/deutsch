import { test, expect } from '@playwright/test';

test('header theme preserves every unsaved learning setting and stays selected after saving', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await page.getByLabel('Дневная цель, ответов').fill('42');
  await page.getByLabel('Слов за тренировку').fill('4');
  await page.getByRole('combobox', { name: 'Уровень обучения', exact: true }).selectOption('B2');
  await page.getByLabel('Строгая проверка немецкого').uncheck();
  await page.getByRole('button', { name: 'Включить тёмную тему' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByLabel('Дневная цель, ответов')).toHaveValue('42');
  await expect(page.getByLabel('Слов за тренировку')).toHaveValue('4');
  await expect(page.getByRole('combobox', { name: 'Уровень обучения', exact: true })).toHaveValue('B2');
  await expect(page.getByLabel('Строгая проверка немецкого')).not.toBeChecked();
  await expect(page.getByRole('combobox', { name: 'Тема оформления' })).toHaveValue('dark');
  await page.getByRole('button', { name: 'Сохранить настройки' }).click();
  await expect(page.getByRole('status')).toContainText('Настройки сохранены');
  await page.reload();
  await page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('combobox', { name: 'Тема оформления' })).toHaveValue('dark');
  await expect(page.getByLabel('Дневная цель, ответов')).toHaveValue('42');
  await expect(page.getByLabel('Слов за тренировку')).toHaveValue('4');
  await expect(page.getByRole('combobox', { name: 'Уровень обучения', exact: true })).toHaveValue('B2');
  await expect(page.getByLabel('Строгая проверка немецкого')).not.toBeChecked();
});

test('a persisted daily goal of 750 remains valid when saving other settings', async ({ page }) => {
  await page.addInitScript(() => {
    const key = 'deutschmaster.state.v1';
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({
      version: 1, words: [], attempts: [], schedules: {}, mistakes: [],
      settings: { theme: 'light', strict: true, sessionSize: 10, dailyGoal: 750, level: 'A1' },
    }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await expect(page.getByLabel('Дневная цель, ответов')).toHaveValue('750');
  await page.getByLabel('Слов за тренировку').fill('4');
  await page.getByRole('button', { name: 'Сохранить настройки' }).click();
  await expect(page.getByRole('status')).toContainText('Настройки сохранены');
  await page.reload();
  await page.getByRole('button', { name: 'Настройки', exact: true }).click();
  await expect(page.getByLabel('Дневная цель, ответов')).toHaveValue('750');
  await expect(page.getByLabel('Слов за тренировку')).toHaveValue('4');
});
