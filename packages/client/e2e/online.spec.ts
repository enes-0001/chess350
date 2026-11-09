// Online journeys from SDD §16.3 — turned into real tests in sprints 3–5.
// Two players = two browser contexts: `const p2 = await browser.newContext()`.
import { test } from '@playwright/test';

test.fixme('E1: create → join in 2nd context → scholar’s mate → both see result → PGN parses', () => {});
test.fixme('E3: reload mid-game → same seat, same position, clocks continue', () => {});
test.fixme('E4: opponent closes tab → presence grey → grace period → remaining player wins', () => {});
test.fixme('E5: draw offer accepted; resign', () => {});
test.fixme('E7: spectator joins a full room and cannot move', () => {});
test.fixme('E8: mobile viewport: click-to-move works online', () => {});
