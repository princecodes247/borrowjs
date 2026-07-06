# Borrow.js

Borrow.js is a lightweight library that introduces Rust-inspired ownership and borrowing semantics. It enforces safe access patterns at runtime, producing rich, developer-friendly diagnostics when rules are violated.

No transpilers or build plugins are required—everything works out of the box using modern JavaScript Proxies!

## Core Concepts

- **Ownership**: Each managed object has exactly one owner.
- **Immutable Borrow**: You can create any number of immutable borrows. The original owner cannot mutate the object while these borrows exist.
- **Mutable Borrow**: You can create exactly one mutable borrow. No other borrows (mutable or immutable) can exist at the same time, and the owner loses access until it's released.
- **Move Semantics**: Transfer ownership from one reference to another, immediately invalidating the old reference.

## Installation

```bash
npm install borrowjs
```

## Usage

### 1. Ownership & Safe Mutation
```typescript
import { own } from 'borrowjs';

const user = own({ name: 'Prince', age: 25 });
user.age = 26; // Success!
```

### 2. Immutable Borrows
```typescript
import { own, borrow, release } from 'borrowjs';

const user = own({ name: 'Prince' });

// Create an immutable reference
const ref = borrow(user);

console.log(ref.name); // "Prince"

// user.name = "John"; // ❌ Throws BorrowError
// ref.name = "John";  // ❌ Throws BorrowError

release(ref);

user.name = "John"; // ✅ Success, borrow was released
```

### 3. Mutable Borrows
```typescript
import { own, borrowMut, release } from 'borrowjs';

const user = own({ name: 'Prince' });

// Create an exclusive mutable reference
const mutRef = borrowMut(user);

mutRef.name = "Alice"; // ✅ Success

// user.name = "John"; // ❌ Throws BorrowError (Owner locked)
// borrow(user);       // ❌ Throws BorrowError (Cannot borrow immutably right now)

release(mutRef);

console.log(user.name); // "Alice"
```

### 4. Move Semantics
```typescript
import { own, move } from 'borrowjs';

const user = own({ name: 'Prince' });
const newUser = move(user);

console.log(newUser.name); // "Prince"
// user.name; // ❌ Throws MovedError
```

## Rich Diagnostics

Borrow.js generates highly detailed error messages that pinpoint exactly *where* conflicts originated, making debugging effortless:

```
BorrowError: Cannot mutably access property 'name' because the object is currently borrowed immutably.

Active Borrows:
Owner
 │
 ├── Immutable Ref (at myFunction (/src/app.ts:15:10))
 └── Immutable Ref (at /src/app.ts:16:20)

Suggestion: Call release(ref) on active borrows before conflicting operations.
```

## License

MIT
