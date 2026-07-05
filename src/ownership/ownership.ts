import { registry, OwnershipState } from './registry';
import { createProxy, RAW_TARGET } from '../proxy/createProxy';
import { MovedError } from '../errors/MovedError';

export function own<T extends object>(obj: T): T {
  const secureTarget = typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));

  const state: OwnershipState = {
    moved: false,
    immutableBorrows: new Set(),
    mutableBorrow: null,
    metadata: {
      createdAt: Date.now()
    }
  };

  const ownerProxy = createProxy(secureTarget, state, 'owner');
  registry.set(ownerProxy, state);
  
  return ownerProxy;
}

export function move<T extends object>(owner: T): T {
  const state = registry.get(owner);
  if (!state) {
    throw new Error('Object is not owned. Cannot move.');
  }

  if (state.moved) {
    throw new MovedError('Object has already been moved.');
  }

  const target = (owner as any)[RAW_TARGET] || owner;
  const newValue = typeof structuredClone === 'function' ? structuredClone(target) : JSON.parse(JSON.stringify(target));
  state.moved = true; 

  return own(newValue);
}

export function clone<T extends object>(owner: T): T {
  const state = registry.get(owner);
  if (!state) {
    throw new Error('Object is not owned. Cannot clone.');
  }
  
  if (state.moved) {
    throw new MovedError('Cannot clone a moved object.');
  }

  const target = (owner as any)[RAW_TARGET] || owner;
  const newValue = typeof structuredClone === 'function' ? structuredClone(target) : JSON.parse(JSON.stringify(target));
  return own(newValue);
}
