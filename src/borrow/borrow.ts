import { registry, borrowToState, proxyToRaw } from '../ownership/registry';
import { createProxy } from '../proxy/createProxy';
import { BorrowError } from '../errors/BorrowError';
import { MovedError } from '../errors/MovedError';
import { getCallerLocation } from '../utils/stack';
import { DeepReadonly } from '../utils/types';

export function borrow<T extends object>(owner: T): DeepReadonly<T> & Disposable {
  const state = registry.get(owner);
  if (!state) {
    throw new Error('Object is not owned. Cannot borrow.');
  }

  if (state.moved) {
    throw new MovedError('Cannot borrow a moved object.');
  }

  if (state.mutableBorrow !== null) {
    throw new BorrowError('Cannot immutably borrow because the object is currently borrowed mutably.', state);
  }

  const target = proxyToRaw.get(owner) || owner;
  const ref = createProxy(target as T, state, 'immutable');
  
  const location = getCallerLocation();
  state.immutableBorrows.set(ref, location);
  borrowToState.set(ref, state);
  
  return ref as DeepReadonly<T> & Disposable;
}
