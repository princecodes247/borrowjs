import { expect, test, describe } from 'vitest';
import { own, borrow, borrowMut, release } from '../src/index';

describe('Diagnostics Engine', () => {
  test('BorrowError contains Rust-inspired rich formatting for immutable borrows', () => {
    const user = own({ name: 'Prince' });
    const ref = borrow(user);
    const ref2 = borrow(user);
    
    let errorMsg = '';
    try {
      user.name = 'John';
    } catch (e: any) {
      errorMsg = e.message;
    }
    
    // Check if message is formatted
    expect(errorMsg).toContain('BorrowError: Cannot mutably access property \'name\' because the object is currently borrowed immutably.');
    expect(errorMsg).toContain('Active Borrows:');
    expect(errorMsg).toContain('Owner');
    expect(errorMsg).toContain('├── Immutable Ref (at');
    expect(errorMsg).toContain('└── Immutable Ref (at');
    expect(errorMsg).toContain('Suggestion: Call release(ref) on active borrows before conflicting operations.');
    
    release(ref);
    release(ref2);
  });

  test('BorrowError contains formatting for mutable borrows', () => {
    const user = own({ name: 'Prince' });
    const mutRef = borrowMut(user);
    
    let errorMsg = '';
    try {
      user.name = 'John';
    } catch (e: any) {
      errorMsg = e.message;
    }
    
    expect(errorMsg).toContain('BorrowError: Cannot mutably access property \'name\' because the object is currently borrowed mutably.');
    expect(errorMsg).toContain('└── Mutable Ref (at');
    
    release(mutRef);
  });

  test('BorrowError tracks exact line location', () => {
    const user = own({ config: true });
    
    function borrowWrapper() {
      return borrow(user); // Line 43 (approx)
    }
    
    const ref = borrowWrapper();
    
    let errorMsg = '';
    try {
      user.config = false;
    } catch (e: any) {
      errorMsg = e.message;
    }
    
    // The stack trace should contain `borrowWrapper` function name
    expect(errorMsg).toContain('borrowWrapper');
    
    release(ref);
  });
});
