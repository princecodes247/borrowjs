import { own } from '../src/index';

console.log('--- Example 1: Ownership and Safe Mutation ---');

// 1. Create an owned object
const user = own({ 
  name: 'Prince', 
  profile: { 
    age: 25 
  } 
});

console.log('Initial user name:', user.name);

// 2. Safe mutation by the owner
user.name = 'John';
user.profile.age = 26;

console.log('Updated user name:', user.name);
console.log('Updated user age:', user.profile.age);

console.log('Success! The owner can safely mutate the object when no borrows exist.\n');

// 3. Auto-boxing of Primitives
const age = own(25);
console.log('Primitives are automatically boxed. Age is:', age.value);
age.value = 26;
console.log('Updated boxed age:', age.value);
console.log('');
