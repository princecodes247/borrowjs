import { own, move, borrow } from '../src';

// Example 1: Basic move semantics
console.log('--- Basic Move Semantics ---');
const user = own({ name: 'Prince', age: 25 });
console.log('Initial owner name:', user.name); // "Prince"

// Transfer ownership
const newUser = move(user);
console.log('New owner name:', newUser.name); // "Prince"

try {
  // The old owner has been invalidated
  console.log(user.name);
} catch (error: any) {
  console.log('Expected error after moving:', error.message);
}


// Example 2: Move respects the borrow checker
console.log('\n--- Move and Active Borrows ---');
const data = own({ items: [1, 2, 3] });
const ref = borrow(data);
console.log('Borrowed item count:', ref.items.length);

try {
  // You cannot move an object while it is actively borrowed
  const movedData = move(data);
} catch (error: any) {
  console.log('Expected error moving borrowed object:', error.message);
}

// Release the reference, then we can safely move
ref[Symbol.dispose]();

const safelyMovedData = move(data);
console.log('Safely moved after release. Item count:', safelyMovedData.items.length);

