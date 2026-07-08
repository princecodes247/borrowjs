import { registry, OwnershipState, proxyToRaw } from './registry';
import { createProxy } from '../proxy/createProxy';
import { MovedError } from '../errors/MovedError';
import { BorrowError } from '../errors/BorrowError';

export type Boxed<T> = T extends object ? T : { value: T };

function createOwner<T>(obj: T, performClone: boolean): Boxed<T> {
  const isPrimitive = typeof obj !== 'object' || obj === null;
  const targetToOwn = isPrimitive ? { value: obj } : obj;
  
  const secureTarget = performClone 
    ? (typeof structuredClone === 'function' ? structuredClone(targetToOwn) : JSON.parse(JSON.stringify(targetToOwn)))
    : targetToOwn;

  Object.seal(secureTarget);

  const state: OwnershipState = {
    moved: false,
    immutableBorrows: new Map(),
    mutableBorrow: null,
    metadata: {
      createdAt: Date.now()
    }
  };

  const ownerProxy = createProxy(secureTarget as any, state, 'owner');
  registry.set(ownerProxy, state);
  
  return ownerProxy as Boxed<T>;
}

export function own<T>(obj: T): Boxed<T> {
  return createOwner(obj, true);
}

export function move<T extends object>(owner: T): T {
  const state = registry.get(owner);
  if (!state) {
    throw new Error('Object is not owned. Cannot move.');
  }

  if (state.moved) {
    throw new MovedError('Object has already been moved.');
  }

  if (state.immutableBorrows.size > 0 || state.mutableBorrow !== null) {
    throw new BorrowError('Cannot move object because it is currently borrowed.', state);
  }

  const target = proxyToRaw.get(owner) || owner;
  state.moved = true; 

  return createOwner(target, false) as unknown as T;
}

export function clone<T extends object>(owner: T): T {
  const state = registry.get(owner);
  if (!state) {
    throw new Error('Object is not owned. Cannot clone.');
  }
  
  if (state.moved) {
    throw new MovedError('Cannot clone a moved object.');
  }

  const target = proxyToRaw.get(owner) || owner;
  return createOwner(target, true) as unknown as T;
}
