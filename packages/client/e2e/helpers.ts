import { expect, type Page } from '@playwright/test';

export const square = (page: Page, sq: string) => page.locator(`[data-square="${sq}"]`);
export const status = (page: Page) => page.getByTestId('status');
export const movesList = (page: Page) => page.getByRole('list', { name: 'Moves' });

/** Plays a UCI move by clicking the from-square, then the to-square. */
export async function clickMove(page: Page, uci: string) {
  await square(page, uci.slice(0, 2)).click();
  await square(page, uci.slice(2, 4)).click();
}

export async function clickMoves(page: Page, moves: string) {
  for (const uci of moves.split(' ').filter(Boolean)) await clickMove(page, uci);
}

/** Real pointer drag (the board's drag library needs intermediate mouse moves). */
export async function dragMove(page: Page, uci: string) {
  const a = await square(page, uci.slice(0, 2)).boundingBox();
  const b = await square(page, uci.slice(2, 4)).boundingBox();
  if (!a || !b) throw new Error('square not visible');
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 6, a.y + a.height / 2 + 6, { steps: 3 });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await page.mouse.up();
}

/** Starts every local test from an empty board (the game is persisted in localStorage). */
export async function freshLocalGame(page: Page) {
  await page.goto('/local');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(status(page)).toHaveText('White to move');
}
