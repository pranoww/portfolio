import { test, expect } from '@playwright/test';

test('home page responds', async ({ page }) => {
  const response = await page.goto('/');
  expect(response.status()).toBe(200);
});

test('Ask Simbha opens the chat panel', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ask Simbha' }).click();
  await expect(page.getByRole('dialog', { name: 'Ask Simbha' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'What has he built?' })).toBeVisible();
});
