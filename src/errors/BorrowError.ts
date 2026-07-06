import { OwnershipState } from '../ownership/registry';
import { formatDiagnostics } from './formatter';

export class BorrowError extends Error {
  constructor(message: string, state?: OwnershipState) {
    super(formatDiagnostics(message, state));
    this.name = 'BorrowError';
    
    // Maintain V8 stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BorrowError);
    }
  }
}
