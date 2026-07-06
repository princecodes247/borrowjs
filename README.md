# Borrow.js (Compile-Time Edition)

Borrow.js is a zero-cost abstraction library that introduces Rust-inspired ownership and borrowing semantics to JavaScript. It enforces safe access patterns **at compile-time** using a Babel plugin.

Because it runs at compile-time, there are **no Proxies, no deep cloning, and zero runtime overhead**. At runtime, `own()` and `borrow()` compile away to nothing, and referential equality (`user === ref`) is completely preserved!

## Core Concepts

- **Ownership**: Each managed object has exactly one owner.
- **Immutable Borrow**: You can create any number of immutable borrows. The original owner cannot mutate the object while these borrows exist in the lexical scope.
- **Mutable Borrow**: You can create exactly one mutable borrow. No other borrows (mutable or immutable) can exist at the same time, and the owner loses access.

## Installation

```bash
npm install borrowjs
npm install -D @babel/core @babel/traverse
```

To enable the compiler, add the Babel plugin to your configuration (e.g. `babel.config.js` or Vite config):
```javascript
module.exports = {
  plugins: ['borrowjs/babel/plugin']
}
```

## Usage

### 1. Zero-Cost Ownership
```typescript
import { own } from 'borrowjs';

const user = own({ name: 'Prince' });
// Because there is no runtime proxy, user === your object!
```

### 2. Compile-Time Borrows
```typescript
import { own, borrow } from 'borrowjs';

const user = own({ name: 'Prince' });

// Create an immutable reference
const ref = borrow(user);

// user.name = "John"; // ❌ Babel THROWS A BUILD ERROR: "BorrowError: Cannot mutate property of 'user' because it is currently borrowed."

console.log(ref.name);
```
