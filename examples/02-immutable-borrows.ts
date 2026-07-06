import { own, borrow, release } from '../src/index';

console.log('--- Example 2: Immutable Borrows ---');

const user = own({ name: 'Prince', status: 'online' });

// 1. Create multiple immutable borrows
const ref1 = borrow(user);
const ref2 = borrow(user);

console.log('ref1 reads:', ref1.name);
console.log('ref2 reads:', ref2.status);

// 2. The owner is locked from making mutations while immutable borrows exist
try {
  user.name = 'John';
} catch (e: any) {
  console.log('\n[Expected Error when Owner tries to mutate]:');
  console.log(e.message);
}

// 3. The borrows themselves are immutable
try {
  // @ts-ignore
  ref1.status = 'offline';
} catch (e: any) {
  console.log('\n[Expected Error when Ref tries to mutate]:');
  console.log(e.message);
}

// 4. Release the borrows to restore owner access
release(ref1);
release(ref2);
console.log('\nReleased active borrows.');

user.name = 'John';
console.log('Owner mutation successful after release! New name:', user.name);
console.log('');
