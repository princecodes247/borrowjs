import { OwnershipState } from '../ownership/registry';

export function formatDiagnostics(message: string, state?: OwnershipState): string {
  if (!state) return message;
  
  const lines: string[] = [];
  lines.push(`\nBorrowError: ${message}`);
  lines.push('');
  lines.push('Active Borrows:');
  lines.push('Owner');
  lines.push(' │');
  
  const borrows: string[] = [];
  
  for (const location of state.immutableBorrows.values()) {
    borrows.push(`Immutable Ref (at ${location})`);
  }
  
  if (state.mutableBorrow) {
    borrows.push(`Mutable Ref (at ${state.mutableBorrow.borrowedAt})`);
  }
  
  for (let i = 0; i < borrows.length; i++) {
    const isLast = i === borrows.length - 1;
    const prefix = isLast ? ' └──' : ' ├──';
    lines.push(`${prefix} ${borrows[i]}`);
  }
  
  lines.push('');
  lines.push('Suggestion: Call release(ref) on active borrows before conflicting operations.');
  lines.push('');
  
  return lines.join('\n');
}
