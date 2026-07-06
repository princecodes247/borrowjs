import { expect, test, describe } from 'vitest';
import * as babel from '@babel/core';
import borrowJsPlugin from '../src/babel/plugin';

async function compile(code: string) {
  return await babel.transformAsync(code, {
    plugins: [borrowJsPlugin],
    filename: 'test.ts',
  });
}

describe('Borrow.js Compile-Time Plugin', () => {
  test('allows safe mutations before borrowing', async () => {
    const code = `
      const user = own({ name: 'Prince' });
      user.name = 'John';
      const ref = borrow(user);
    `;
    const result = await compile(code);
    expect(result?.code).toBeDefined();
  });

  test('throws when mutating owner while immutably borrowed', async () => {
    const code = `
      const user = own({ name: 'Prince' });
      const ref = borrow(user);
      user.name = 'John';
    `;
    
    await expect(compile(code)).rejects.toThrowError(
      /BorrowError: Cannot mutate property of 'user' because it is currently borrowed./
    );
  });

  test('throws when mutating owner while mutably borrowed', async () => {
    const code = `
      const user = own({ name: 'Prince' });
      const mutRef = borrowMut(user);
      user.name = 'John';
    `;
    
    await expect(compile(code)).rejects.toThrowError(
      /BorrowError: Cannot mutate property of 'user' because it is currently borrowed./
    );
  });
  
  test('throws when reassigning owner while borrowed', async () => {
    const code = `
      let user = own({ name: 'Prince' });
      const ref = borrow(user);
      user = own({ name: 'Alice' });
    `;
    
    await expect(compile(code)).rejects.toThrowError(
      /BorrowError: Cannot reassign 'user' because it is currently borrowed./
    );
  });
});
