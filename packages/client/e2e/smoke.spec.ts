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

test('local mode shows a board', async ({ page }) => {
  await page.goto('/local');
  await expect(page.getByTestId('board')).toBeVisible();
});

test('server health endpoint is reachable', async ({ request }) => {
  const res = await request.get('/healthz');
  expect(res.ok()).toBeTruthy();
});

// Journeys from SDD §16.3. Turn each fixme into a real test in its backlog task.
test.fixme('E1: create → join in 2nd context → scholar’s mate → both see result → PGN parses', () => {});
test.fixme('E3: reload mid-game → same seat, same position, clocks continue', () => {});
test.fixme('E4: opponent closes tab → presence grey → grace period → remaining player wins', () => {});
test.fixme('E5: draw offer accepted; resign', () => {});
test.fixme('E6: local mode: play, undo, redo, flip; works offline after load', () => {});
test.fixme('E7: spectator joins a full room and cannot move', () => {});
test.fixme('E8: mobile viewport: click-to-move works', () => {});
