export class MovedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MovedError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MovedError);
    }
  }
}
