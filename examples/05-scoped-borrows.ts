import { own, borrow } from '../src/index';

console.log('--- Example 5: Scoped Borrows ---');

const user = own({ name: 'Prince', status: 'online' });
console.log('Initial user name:', user.name);

{
  // The `using` keyword ensures the reference is disposed when the block ends
  using ref = borrow(user);
  
  console.log('Inside block, ref reads:', ref.name);
  
  try {
    user.name = 'John';
  } catch (e: any) {
    console.log('[Expected Error] Owner cannot mutate while borrow is active in scope.');
  }
} // ref is automatically released here!

console.log('Exited the block scope.');

// Now the owner can safely mutate again
user.name = 'John';
console.log('Owner mutation successful outside the scope! New name:', user.name);
console.log('');
