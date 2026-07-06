export type Boxed<T> = T extends object ? T : { value: T };

/**
 * Marks an object or primitive as "owned".
 * At runtime, this is a zero-cost abstraction that simply boxes primitives
 * and returns objects exactly as they are.
 * The Babel plugin enforces ownership rules at compile-time.
 */
export function own<T>(obj: T): Boxed<T> {
  const isPrimitive = typeof obj !== 'object' || obj === null;
  return (isPrimitive ? { value: obj } : obj) as Boxed<T>;
}

/**
 * Transfers ownership of the value to a new reference.
 * The old reference becomes invalid at compile-time.
 */
export function move<T extends object>(owner: T): T {
  return owner;
}

/**
 * Creates a deep clone of the value.
 */
export function clone<T extends object>(owner: T): T {
  return typeof structuredClone === 'function' 
    ? structuredClone(owner) 
    : JSON.parse(JSON.stringify(owner));
}
