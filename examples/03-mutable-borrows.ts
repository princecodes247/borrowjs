import { own, borrowMut, release } from '../src/index';

console.log('--- Example 3: Mutable Borrows ---');

const user = own({ name: 'Prince', score: 100 });

// 1. Create an exclusive mutable borrow
const mutRef = borrowMut(user);

// 2. The mutable reference can mutate the object
mutRef.score += 50;
console.log('mutRef updated score to:', mutRef.score);

// 3. The owner cannot access or mutate the object while it is mutably borrowed
try {
  user.score = 200;
} catch (e: any) {
  console.log('\n[Expected Error when Owner tries to mutate]:');
  console.log(e.message);
}

try {
  console.log(user.name);
} catch (e: any) {
  console.log('\n[Expected Error when Owner tries to read]:');
  console.log(e.message);
}

// 4. Release the mutable borrow
release(mutRef);
console.log('\nReleased mutable borrow.');

console.log('Owner can now read updated score:', user.score);
console.log('');
