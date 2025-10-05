---
title: "TypeScript Tips and Tricks for Better Code"
slug: "typescript-tips-and-tricks"
excerpt: "Improve your TypeScript skills with these practical tips and patterns"
category: "개발"
publishedAt: "2025-10-03T14:30:00Z"
author: "Drip Drop Dev"
---

# TypeScript Tips and Tricks for Better Code

TypeScript has become the standard for building scalable JavaScript applications. Here are some tips to write better TypeScript code.

## 1. Use Type Inference

Let TypeScript infer types when possible:

```typescript
// Good - type is inferred
const users = ['Alice', 'Bob', 'Charlie'];

// Unnecessary - explicit type annotation
const users: string[] = ['Alice', 'Bob', 'Charlie'];
```

## 2. Leverage Union Types

Union types provide flexibility while maintaining type safety:

```typescript
type Status = 'pending' | 'success' | 'error';

function handleStatus(status: Status) {
  switch (status) {
    case 'pending':
      return 'Loading...';
    case 'success':
      return 'Done!';
    case 'error':
      return 'Failed!';
  }
}
```

## 3. Use Utility Types

TypeScript provides many built-in utility types:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Pick only needed properties
type UserSummary = Pick<User, 'id' | 'name'>;

// Make all properties optional
type PartialUser = Partial<User>;

// Make all properties readonly
type ReadonlyUser = Readonly<User>;
```

## 4. Discriminated Unions

Use discriminated unions for complex state management:

```typescript
type LoadingState = { status: 'loading' };
type SuccessState = { status: 'success'; data: string };
type ErrorState = { status: 'error'; error: Error };

type State = LoadingState | SuccessState | ErrorState;

function render(state: State) {
  switch (state.status) {
    case 'loading':
      return <Spinner />;
    case 'success':
      return <Data value={state.data} />;
    case 'error':
      return <Error message={state.error.message} />;
  }
}
```

## Conclusion

These TypeScript patterns will help you write more maintainable and type-safe code. Practice them in your daily development!
