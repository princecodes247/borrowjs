export class BorrowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BorrowError';
    
    // Maintain V8 stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BorrowError);
    }
  }
}
