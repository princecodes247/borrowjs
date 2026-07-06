import { BorrowError } from '../errors/BorrowError';
import { MovedError } from '../errors/MovedError';
import { OwnershipState } from '../ownership/registry';
import { release } from '../borrow/release';

export type ProxyType = 'owner' | 'immutable' | 'mutable';

export const RAW_TARGET = Symbol('RAW_TARGET');

// Fallback for Symbol.dispose if not available in current environment
const DISPOSE = Symbol.dispose ?? Symbol.for('Symbol.dispose');

export function createProxy<T extends object>(
  target: T,
  state: OwnershipState,
  proxyType: ProxyType,
  borrowRef?: object
): T {
  const handler: ProxyHandler<T> = {
    get(t, prop, receiver) {
      if (prop === RAW_TARGET) {
        return target;
      }

      if (prop === DISPOSE) {
        return () => {
          try { release(receiver); } catch (e) { /* ignore already released */ }
        };
      }
      
      if (state.moved) {
        throw new MovedError('Cannot access a moved object.');
      }
      
      const value = Reflect.get(t, prop, receiver);
      
      if (typeof value === 'object' && value !== null) {
        // Deep proxy for nested objects
        return createProxy(value, state, proxyType, borrowRef);
      }
      
      if (typeof value === 'function') {
        return value.bind(receiver);
      }
      
      return value;
    },
    
    set(t, prop, value, receiver) {
      if (state.moved) {
        throw new MovedError('Cannot mutate a moved object.');
      }
      
      if (proxyType === 'immutable') {
        throw new BorrowError(`Cannot mutably access property '${String(prop)}' because it is currently immutably borrowed.`, state);
      }
      
      if (proxyType === 'owner') {
        if (state.immutableBorrows.size > 0) {
          throw new BorrowError(`Cannot mutably access property '${String(prop)}' because the object is currently borrowed immutably.`, state);
        }
        if (state.mutableBorrow !== null) {
          throw new BorrowError(`Cannot mutably access property '${String(prop)}' because the object is currently borrowed mutably.`, state);
        }
      }
      
      if (proxyType === 'mutable') {
        if (state.mutableBorrow?.token !== borrowRef) {
          throw new BorrowError(`Cannot mutably access property '${String(prop)}' through an invalid mutable borrow.`, state);
        }
      }
      
      return Reflect.set(t, prop, value, receiver);
    },
    
    deleteProperty(t, prop) {
      if (state.moved) {
        throw new MovedError('Cannot mutate a moved object.');
      }
      
      if (proxyType === 'immutable') {
        throw new BorrowError(`Cannot delete property '${String(prop)}' because it is currently immutably borrowed.`, state);
      }
      
      if (proxyType === 'owner') {
        if (state.immutableBorrows.size > 0) {
          throw new BorrowError(`Cannot delete property '${String(prop)}' because the object is currently borrowed immutably.`, state);
        }
        if (state.mutableBorrow !== null) {
          throw new BorrowError(`Cannot delete property '${String(prop)}' because the object is currently borrowed mutably.`, state);
        }
      }
      
      if (proxyType === 'mutable' && state.mutableBorrow?.token !== borrowRef) {
        throw new BorrowError(`Cannot delete property '${String(prop)}' through an invalid mutable borrow.`, state);
      }
      
      return Reflect.deleteProperty(t, prop);
    }
  };
  
  return new Proxy(target, handler);
}
