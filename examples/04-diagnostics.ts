import { own, borrow } from '../src/index';

console.log('--- Example 4: Rich Diagnostics ---');

const data = own({ items: [1, 2, 3] });

function myFirstBorrow() {
  return borrow(data);
}

function mySecondBorrow() {
  return borrow(data);
}

// Create borrows inside functions so the stack trace shows them
const ref1 = myFirstBorrow();
const ref2 = mySecondBorrow();

// Try to mutate the owner
try {
  data.items.push(4);
} catch (e: any) {
  console.log('When you violate a borrow rule, Borrow.js provides a helpful stack trace and visual ownership tree:\n');
  console.log(e.message);
}
