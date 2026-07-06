export function getCallerLocation(): string {
  const err = new Error();
  
  if (!err.stack) return 'unknown location';
  
  const lines = err.stack.split('\n');
  // Node.js stack format:
  // Error
  //   at getCallerLocation (src/utils/stack.ts:2:15)
  //   at borrow (src/borrow/borrow.ts:20:20)
  //   at actualCaller (app.ts:15:10)
  
  // Find the first line that is outside of the borrowjs src folder,
  // or just use a fixed offset. Since we know we're calling this from borrow.ts / borrowMut.ts:
  // 0: Error
  // 1: getCallerLocation
  // 2: borrow / borrowMut
  // 3: caller
  
  if (lines.length > 3) {
    // Some environments have `Error\n` at index 0, others start with `at ...` directly.
    // Let's filter out 'Error' lines and find the 3rd 'at' line.
    const atLines = lines.filter(line => line.trim().startsWith('at '));
    if (atLines.length >= 3) {
      const match = atLines[2].match(/at\s+(.*)/);
      return match ? match[1].trim() : atLines[2].trim();
    }
  }
  
  return 'unknown location';
}
