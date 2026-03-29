# Frontend Coding Rules (Detailed)

> **Tech Stack**: Next.js + React + TypeScript

## Basic Policy

- TypeScript strict mode required
- UI library components preferred over custom implementations
- Specification-based testing

## 1. TypeScript Conventions

### 1.1 Type Safety

- **any type prohibited**: Use `unknown` type
- **Explicit type annotations** for function return types and parameters
- **strict mode required**: `"strict": true` in tsconfig.json

```typescript
// NG
function process(data: any) { ... }

// OK
function process(data: unknown) { ... }
```

### 1.2 interface vs type

- **Object types**: Use `interface` (extensible)
- **Union/intersection/primitive aliases**: Use `type`

```typescript
// Object type -> interface
interface StudentResponse {
  id: string;
  name: string;
  email: string;
}

// Union type -> type
type CourseStatus = 'active' | 'completed' | 'cancelled';
```

### 1.3 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Component | PascalCase | `StudentList`, `PaymentForm` |
| Custom Hook | camelCase + use prefix | `useStudentData`, `useAuth` |
| Function | camelCase | `fetchStudents`, `formatDate` |
| Variable | camelCase | `studentName`, `isLoading` |
| Type/Interface | PascalCase | `StudentResponse`, `CourseStatus` |
| Constant | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_PAGE_SIZE` |

## 2. Next.js App Router

### 2.1 Server/Client Component Selection

| Condition | Choice |
|-----------|--------|
| Data fetch only | Server Component |
| useState/useEffect used | Client Component (`'use client'`) |
| Event handlers used | Client Component |
| Browser API used | Client Component |

### 2.2 Required Files

| File | Purpose | Placement |
|------|---------|-----------|
| `loading.tsx` | Loading UI | Routes with data fetching |
| `error.tsx` | Error UI | All routes (recommended) |
| `not-found.tsx` | 404 UI | Dynamic routes |

### 2.3 Route Handlers

Place under `app/api/`. Prefer Server Actions over Route Handlers when possible.

## 3. React Conventions

### 3.1 Hooks Rules

- **Top-level calls only**: No hooks inside conditionals
- **Custom hooks require `use` prefix**
- **Accurate dependency arrays**

### 3.2 Prohibited Patterns

- **React.forwardRef prohibited**: Scheduled for deprecation. Receive ref via props.

```typescript
// NG
const Button = React.forwardRef<HTMLButtonElement, Props>((props, ref) => ...)

// OK
const Button = ({ ref, ...props }: Props & { ref?: React.Ref<HTMLButtonElement> }) => ...
```

## 4. Form Implementation (React Hook Form + Zod)

- Use **zodResolver** for validation schema integration
- User-friendly validation messages
- Proper default values

```typescript
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
});

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '', email: '' },
});
```

## 5. State Management

| Library | Purpose | When to Use |
|---------|---------|-------------|
| TanStack React Query | Server state | API data caching & sync |
| Jotai / Zustand | Client state | UI state, non-form local state |
| React Hook Form | Form state | Form input & validation |

### queryKey Factory Pattern

```typescript
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (filters: StudentFilters) => [...studentKeys.lists(), filters] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
};
```

## 6. Async Processing

### Basic Rules

- **async/await preferred**: Avoid Promise chains (`.then()`)
- **Independent async operations**: Use `Promise.all` for parallel execution
- **Error handling**: try-catch + appropriate UI display

```typescript
// NG - Promise chain
fetchStudents().then(students => {
  setStudents(students);
}).catch(error => {
  setError(error);
});

// OK - async/await
try {
  const students = await fetchStudents();
  setStudents(students);
} catch (error) {
  setError(error);
}

// OK - parallel independent async operations
const [students, courses] = await Promise.all([
  fetchStudents(),
  fetchCourses(),
]);
```

## 7. Component Design

- **1 file = 1 component**: Separate even internal-only components
- **Export at definition**: `export const ComponentName = ...`

## 8. Testing (Vitest + Testing Library)

### 8.1 Specification-Based Testing

- **No implementation-dependent tests**: Don't directly test internal state (useState etc.)
- **Test user operations and expected results**: Verify specification requirements directly
- **Role-based selectors preferred**: `getByRole` > `getByTestId`

```typescript
// NG - implementation-dependent test
expect(component.state.isOpen).toBe(true);

// OK - specification-based test
await userEvent.click(screen.getByRole('button', { name: 'Show details' }));
expect(screen.getByRole('dialog')).toBeInTheDocument();
```

### 8.2 Test File Naming

- `[ComponentName].test.tsx`
- `[hookName].test.ts`

## Checklist

- [ ] TypeScript strict mode - no errors
- [ ] No `any` type usage
- [ ] 1 file = 1 component
- [ ] UI library usage considered
- [ ] React Hook Form + Zod for forms
- [ ] async/await preferred, Promise.all for independent operations
- [ ] Specification-based tests (user operations and results)
