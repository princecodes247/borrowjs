import { borrowToState } from '../ownership/registry';

export function release(ref: object): void {
  const state = borrowToState.get(ref);
  if (!state) {
    throw new Error('Invalid reference or already released.');
  }

  if (state.immutableBorrows.has(ref)) {
    state.immutableBorrows.delete(ref);
  } else {
    state.mutableBorrow = null;
  }
  
  borrowToState.delete(ref);
}
