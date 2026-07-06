/**
 * Releases a borrow.
 * At runtime, this is a no-op.
 * The Babel plugin uses this to track the end of a borrow's lifetime early.
 */
export function release<T extends object>(ref: T): void {
  // No-op at runtime
}
