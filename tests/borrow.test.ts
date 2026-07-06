import { expect, test, describe } from 'vitest';
import { own, borrow, borrowMut, release, move, BorrowError, MovedError } from '../src/index';

describe('Borrow.js MVP', () => {
  test('own and mutate safely', () => {
    const user = own({ name: 'Prince' });
    expect(user.name).toBe('Prince');
    user.name = 'John';
    expect(user.name).toBe('John');
  });

  test('immutable borrow prevents owner mutation', () => {
    const user = own({ name: 'Prince' });
    const ref = borrow(user);

    expect(ref.name).toBe('Prince');

    expect(() => {
      user.name = 'John';
    }).toThrow(BorrowError);

    expect(() => {
      ref.name = 'John';
    }).toThrow(BorrowError);

    release(ref);

    // Mutation allowed after release
    user.name = 'John';
    expect(user.name).toBe('John');
  });

  test('mutable borrow prevents owner access', () => {
    const user = own({ name: 'Prince' });
    const ref = borrowMut(user);

    ref.name = 'Alice';
    expect(ref.name).toBe('Alice');

    expect(() => {
      user.name = 'John';
    }).toThrow(BorrowError);

    release(ref);

    expect(user.name).toBe('Alice');
  });

  test('multiple immutable borrows allowed', () => {
    const user = own({ name: 'Prince' });
    const ref1 = borrow(user);
    const ref2 = borrow(user);

    expect(ref1.name).toBe('Prince');
    expect(ref2.name).toBe('Prince');

    expect(() => borrowMut(user)).toThrow(BorrowError);

    release(ref1);
    release(ref2);

    const mutRef = borrowMut(user);
    mutRef.name = 'Bob';
    release(mutRef);
    expect(user.name).toBe('Bob');
  });

  test('move semantics', () => {
    const user = own({ name: 'Prince' });
    const newUser = move(user);

    expect(newUser.name).toBe('Prince');

    expect(() => {
      user.name;
    }).toThrow(MovedError);

    expect(() => {
      borrow(user);
    }).toThrow(MovedError);
  });

  test('deep proxy checks', () => {
    const user = own({ profile: { age: 30 } });
    const ref = borrow(user);

    expect(() => {
      user.profile.age = 31;
    }).toThrow(BorrowError);

    expect(() => {
      ref.profile.age = 31;
    }).toThrow(BorrowError);

    release(ref);
    user.profile.age = 31;
    expect(user.profile.age).toBe(31);
  });
});
