// E6 — local mode journeys (SDD §16.3). F12 play · F13 undo/redo · F14 flip · F22 review · F24 PGN.
import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { clickMove, clickMoves, dragMove, freshLocalGame, movesList, status } from './helpers';

const SCHOLARS_MATE = 'e2e4 e7e5 f1c4 b8c6 d1h5 g8f6 h5f7';

test.beforeEach(async ({ page }) => {
  await freshLocalGame(page);
});

test("E6: scholar's mate by clicks ends the game with a clear message", async ({ page }) => {
  await clickMoves(page, SCHOLARS_MATE);
  await expect(status(page)).toHaveText('Checkmate — White wins');
  await expect(movesList(page)).toContainText('Qxf7#');
  await expect(page).toHaveTitle(/Game over/);
  // No more moves after mate.
  await clickMove(page, 'a7a6');
  await expect(movesList(page)).not.toContainText('a6');
});

test('E6: illegal moves are rejected; turn order is enforced', async ({ page }) => {
  await clickMove(page, 'e2e5'); // pawn cannot jump 3
  await clickMove(page, 'e7e5'); // black cannot move first
  await expect(status(page)).toHaveText('White to move');
  await expect(page.getByText('No moves yet.')).toBeVisible();
});

test('E6: drag and drop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'mouse drag is a desktop interaction');
  await dragMove(page, 'e2e4');
  await dragMove(page, 'e7e5');
  await expect(movesList(page)).toContainText('e4');
  await expect(movesList(page)).toContainText('e5');
  await dragMove(page, 'd1d5'); // illegal: queen is blocked
  await expect(status(page)).toHaveText('White to move');
});

test('E6: check is announced', async ({ page }) => {
  await clickMoves(page, 'e2e4 f7f6 d1h5');
  await expect(status(page)).toHaveText('Black to move — check!');
});

test('E6: undo, redo, and a new move clears redo', async ({ page }) => {
  await clickMoves(page, 'e2e4 e7e5');
  await page.getByRole('button', { name: /Undo/ }).click();
  await expect(status(page)).toHaveText('Black to move');
  await page.getByRole('button', { name: /Redo/ }).click();
  await expect(status(page)).toHaveText('White to move');
  await page.getByRole('button', { name: /Undo/ }).click();
  await clickMove(page, 'c7c5');
  await expect(page.getByRole('button', { name: /Redo/ })).toBeDisabled();
});

test('E6: promotion picker, cancel and choose a knight', async ({ page }) => {
  await clickMoves(page, 'a2a4 b7b5 a4b5 a7a6 b5a6 c8b7 a6b7 b8c6');
  await clickMove(page, 'b7a8');
  const picker = page.getByRole('dialog', { name: 'Choose promotion piece' });
  await expect(picker).toBeVisible();
  await picker.getByRole('button', { name: 'Cancel' }).click();
  await expect(picker).toBeHidden();
  await clickMove(page, 'b7a8');
  await picker.getByRole('button', { name: 'Knight' }).click();
  await expect(movesList(page)).toContainText('bxa8=N');
});

test('E6: review past moves with buttons and keys; board is read-only meanwhile', async ({
  page,
}) => {
  await clickMoves(page, 'e2e4 e7e5 g1f3');
  await page.getByRole('button', { name: 'First move' }).click();
  await expect(page.getByText('Viewing move 0 of 3.')).toBeVisible();
  await clickMove(page, 'd2d4'); // ignored while reviewing
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('Viewing move 1 of 3.')).toBeVisible();
  await page.getByRole('button', { name: 'Back to the game' }).click();
  await expect(page.getByText(/Viewing move/)).toBeHidden();
  await expect(movesList(page)).not.toContainText('d4');
  await expect(status(page)).toHaveText('Black to move');
});

test('E6: flip and auto-flip', async ({ page }) => {
  const firstSquare = () => page.locator('[data-square]').first().getAttribute('data-square');
  expect(await firstSquare()).toBe('a8'); // white at the bottom
  await page.getByRole('button', { name: /Flip/ }).click();
  expect(await firstSquare()).toBe('h1'); // black at the bottom
  await page.getByRole('button', { name: /Flip/ }).click();
  await page.getByLabel('Flip the board after each move').check();
  await clickMove(page, 'e2e4');
  await expect.poll(firstSquare).toBe('h1');
});

test('E6: the game survives a reload', async ({ page }) => {
  await clickMoves(page, 'e2e4 e7e5');
  await page.reload();
  await expect(movesList(page)).toContainText('e5');
  await expect(status(page)).toHaveText('White to move');
});

test('E6 / F24: download the game as PGN', async ({ page }) => {
  await clickMoves(page, SCHOLARS_MATE);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Download PGN/ }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^350chess-local-\d{8}\.pgn$/);
  const pgn = await readFile((await download.path())!, 'utf8');
  expect(pgn).toContain('[Event "350 Chess local game"]');
  expect(pgn).toContain('[Result "1-0"]');
  expect(pgn).toContain('4. Qxf7# 1-0');
});

test('E6: New game asks before discarding an unfinished game', async ({ page }) => {
  await clickMove(page, 'e2e4');
  page.once('dialog', (d) => void d.dismiss());
  await page.getByRole('button', { name: 'New game' }).click();
  await expect(movesList(page)).toContainText('e4');
  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'New game' }).click();
  await expect(page.getByText('No moves yet.')).toBeVisible();
});

test('E6 / SRS 2.3: local mode works offline after the first visit', async ({ page, context }) => {
  // First visit installs the service worker; make sure it controls the page before going offline.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  if (!(await page.evaluate(() => navigator.serviceWorker.controller !== null)))
    await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Play locally' }).click();
    await clickMoves(page, 'e2e4 e7e5');
    await expect(movesList(page)).toContainText('e5');
    await page.reload();
    await expect(movesList(page)).toContainText('e5');
  } finally {
    await context.setOffline(false);
  }
});
