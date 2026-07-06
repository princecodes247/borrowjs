/**
 * Creates an exclusive mutable borrow of an object.
 * At runtime, this is a zero-cost abstraction that returns the object itself.
 * The Babel plugin enforces borrowing rules at compile-time.
 */
export function borrowMut<T extends object>(owner: T): T {
  return owner;
}
