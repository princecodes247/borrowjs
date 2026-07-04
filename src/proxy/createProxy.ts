import { BorrowError } from '../errors/BorrowError';
import { MovedError } from '../errors/MovedError';
import { OwnershipState } from '../ownership/registry';

export type ProxyType = 'owner' | 'immutable' | 'mutable';

export const RAW_TARGET = Symbol('RAW_TARGET');

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
        throw new BorrowError(`Cannot mutably access property '${String(prop)}' because it is currently immutably borrowed.`);
      }
      
      if (proxyType === 'owner') {
        if (state.immutableBorrows.size > 0) {
          throw new BorrowError(`Cannot mutably access property '${String(prop)}' because the object is currently borrowed immutably.`);
        }
        if (state.mutableBorrow !== null) {
          throw new BorrowError(`Cannot mutably access property '${String(prop)}' because the object is currently borrowed mutably.`);
        }
      }
      
      if (proxyType === 'mutable') {
        if (state.mutableBorrow !== borrowRef) {
          throw new BorrowError(`Cannot mutably access property '${String(prop)}' through an invalid mutable borrow.`);
        }
      }
      
      return Reflect.set(t, prop, value, receiver);
    },
    
    deleteProperty(t, prop) {
      if (state.moved) {
        throw new MovedError('Cannot mutate a moved object.');
      }
      
      if (proxyType === 'immutable') {
        throw new BorrowError(`Cannot delete property '${String(prop)}' because it is currently immutably borrowed.`);
      }
      
      if (proxyType === 'owner') {
        if (state.immutableBorrows.size > 0) {
          throw new BorrowError(`Cannot delete property '${String(prop)}' because the object is currently borrowed immutably.`);
        }
        if (state.mutableBorrow !== null) {
          throw new BorrowError(`Cannot delete property '${String(prop)}' because the object is currently borrowed mutably.`);
        }
      }
      
      if (proxyType === 'mutable' && state.mutableBorrow !== borrowRef) {
        throw new BorrowError(`Cannot delete property '${String(prop)}' through an invalid mutable borrow.`);
      }
      
      return Reflect.deleteProperty(t, prop);
    }
  };
  
  return new Proxy(target, handler);
}
