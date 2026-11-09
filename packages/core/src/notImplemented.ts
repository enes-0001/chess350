/**
 * Marks skeleton code that a backlog task still has to implement.
 * `grep -r notImplemented packages/` lists everything that is still open.
 */
export function notImplemented(task: string, ref: string): never {
  throw new Error(`Not implemented yet: ${task} (see ${ref})`);
}
