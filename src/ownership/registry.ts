export interface OwnershipState {
  moved: boolean;
  immutableBorrows: Map<object, string>;
  mutableBorrow: { token: object; borrowedAt: string } | null;
  metadata: {
    createdAt: number;
  };
}

export const registry = new WeakMap<object, OwnershipState>();

// We also need a way to track which borrow corresponds to which state
// so we can release them properly.
export const borrowToState = new WeakMap<object, OwnershipState>();
