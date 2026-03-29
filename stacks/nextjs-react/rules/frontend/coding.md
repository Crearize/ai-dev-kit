# Frontend Coding Rules

> **Tech Stack**: Next.js + React + TypeScript

## Prohibited Patterns

### any type prohibited

Use `unknown` type instead.

```typescript
// NG
function process(data: any) { ... }

// OK
function process(data: unknown) { ... }
```

### React.forwardRef prohibited

Scheduled for deprecation. Use props to receive ref instead.

```typescript
// NG
const Button = React.forwardRef<HTMLButtonElement, Props>((props, ref) => ...)

// OK
const Button = ({ ref, ...props }: Props & { ref?: React.Ref<HTMLButtonElement> }) => ...
```

## Coding Conventions

- **1 file = 1 component**: Separate even internal-only components into their own files
- **Export at definition**: `export const ComponentName = ...`
- **Type safety**: Define TypeScript types appropriately
- **UI library first**: Check existing UI library components before creating new ones
