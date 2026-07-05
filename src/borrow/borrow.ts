import { registry, borrowToState } from '../ownership/registry';
import { createProxy, RAW_TARGET } from '../proxy/createProxy';
import { BorrowError } from '../errors/BorrowError';
import { MovedError } from '../errors/MovedError';

export function borrow<T extends object>(owner: T): T {
  const state = registry.get(owner);
  if (!state) {
    throw new Error('Object is not owned. Cannot borrow.');
  }

  if (state.moved) {
    throw new MovedError('Cannot borrow a moved object.');
  }

  if (state.mutableBorrow !== null) {
    throw new BorrowError('Cannot immutably borrow because the object is currently borrowed mutably.');
  }

  const target = (owner as any)[RAW_TARGET] || owner;
  const ref = createProxy(target as T, state, 'immutable');
  
  state.immutableBorrows.add(ref);
  borrowToState.set(ref, state);
  
  return ref;
}
