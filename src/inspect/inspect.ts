import { registry } from '../ownership/registry';

export interface OwnershipMetadata {
  isOwned: boolean;
  moved: boolean;
  immutableBorrows: number;
  isMutablyBorrowed: boolean;
}

export function inspect(owner: object): OwnershipMetadata {
  const state = registry.get(owner);
  
  if (!state) {
    return {
      isOwned: false,
      moved: false,
      immutableBorrows: 0,
      isMutablyBorrowed: false
    };
  }

  return {
    isOwned: true,
    moved: state.moved,
    immutableBorrows: state.immutableBorrows.size,
    isMutablyBorrowed: state.mutableBorrow !== null
  };
}
