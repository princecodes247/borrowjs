import { expect, test, describe } from 'vitest';
import { own, borrow, borrowMut, release, move, clone } from '../src/index';

describe('Borrow.js Zero-Cost Runtime', () => {
  test('own returns the exact primitive boxed', () => {
    const age = own(25);
    expect(age.value).toBe(25);
  });

  test('own returns the exact object (zero-cost identity)', () => {
    const obj = { name: 'Prince' };
    const user = own(obj);
    expect(user).toBe(obj); // Referential equality is PRESERVED!
  });

  test('borrow returns the exact object', () => {
    const user = own({ name: 'Prince' });
    const ref = borrow(user);
    expect(ref).toBe(user);
  });
  
  test('borrowMut returns the exact object', () => {
    const user = own({ name: 'Prince' });
    const mutRef = borrowMut(user);
    expect(mutRef).toBe(user);
  });
  
  test('release does not throw', () => {
    const user = own({ name: 'Prince' });
    const ref = borrow(user);
    expect(() => release(ref)).not.toThrow();
  });
});
