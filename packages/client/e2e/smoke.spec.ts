import { expect, test } from '@playwright/test';

test('home page loads and offers the three entry points', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/350 Chess/);
  await expect(page.getByRole('button', { name: 'Create online game' })).toBeVisible();
  await expect(page.getByLabel('Join with code')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play locally' })).toBeVisible();
});

test('E2: invalid code shows a clear message; lowercase code is normalised', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Join with code').fill('abc');
  await page.getByRole('button', { name: 'Join' }).click();
  await expect(page.getByRole('alert')).toContainText('does not look right');

  await page.getByLabel('Join with code').fill(' k7x2qp ');
  await page.getByRole('button', { name: 'Join' }).click();
  await expect(page).toHaveURL(/\/g\/K7X2QP$/);
});

test('unknown routes show a not-found page', async ({ page }) => {
  await page.goto('/does-not-exist');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('server health endpoint is reachable', async ({ request }) => {
  const res = await request.get('/healthz');
  expect(res.ok()).toBeTruthy();
});

test('service worker is served with no-cache', async ({ request }) => {
  const res = await request.get('/sw.js');
  expect(res.ok()).toBeTruthy();
  expect(res.headers()['cache-control']).toBe('no-cache');
});
