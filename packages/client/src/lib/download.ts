/** Lets the browser save `text` as a file (used for PGN export, F24). */
export function downloadText(
  filename: string,
  text: string,
  mime = 'application/x-chess-pgn',
): void {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
