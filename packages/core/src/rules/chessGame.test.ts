// Test catalogue for the rules engine (SDD §16.2). Each `todo` belongs to backlog task S2-01/S2-02.
// Replace `it.todo` with a real test when you implement the feature. Keep the ID in the name.
import { describe, it } from 'vitest';

describe('ChessGame (F1–F3)', () => {
  it.todo('T-R1: castling both sides; illegal through check / after the king moved');
  it.todo('T-R2: en passant only immediately after the double step');
  it.todo('T-R3: promotion to Q/R/B/N; missing promotion letter is ILLEGAL_MOVE');
  it.todo("T-R4: checkmate (fool's mate, back-rank)");
  it.todo('T-R5: stalemate');
  it.todo('T-R6: threefold repetition ends the game automatically (A4)');
  it.todo('T-R7: 50-move rule (FEN with halfmove clock 99, then one quiet move)');
  it.todo('T-R8: insufficient material: KvK, KBvK, KNvK, KB vs KB same colour');
  it.todo('T-R9: canMate truth table (A5)');
  it.todo('T-R10: replaying a UCI list reproduces the FEN');
});
