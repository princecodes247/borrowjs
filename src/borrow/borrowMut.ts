import { registry, borrowToState } from '../ownership/registry';
import { createProxy, RAW_TARGET } from '../proxy/createProxy';
import { BorrowError } from '../errors/BorrowError';
import { MovedError } from '../errors/MovedError';

export function borrowMut<T extends object>(owner: T): T {
  const state = registry.get(owner);
  if (!state) {
    throw new Error('Object is not owned. Cannot borrow.');
  }

  if (state.moved) {
    throw new MovedError('Cannot borrow a moved object.');
  }

  if (state.mutableBorrow !== null) {
    throw new BorrowError('Cannot mutably borrow because the object is already borrowed mutably.');
  }

  if (state.immutableBorrows.size > 0) {
    throw new BorrowError('Cannot mutably borrow because the object is currently borrowed immutably.');
  }

  const target = (owner as any)[RAW_TARGET] || owner;
  const borrowRef = {}; // Unique token for this borrow session
  const ref = createProxy(target as T, state, 'mutable', borrowRef);
  
  state.mutableBorrow = borrowRef;
  borrowToState.set(ref, state);
  
  return ref;
}
