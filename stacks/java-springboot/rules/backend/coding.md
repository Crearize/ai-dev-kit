# Backend Coding Rules

> **Tech Stack**: Java + Spring Boot

## Prohibited Patterns

### Wildcard imports prohibited

```java
// NG
import java.util.*;

// OK
import java.util.List;
import java.util.Map;
```

### Full package name usage prohibited

Always add import statements and use short names.

```java
// NG
java.util.Map<String, Object> data = new java.util.HashMap<>();

// OK
import java.util.Map;
import java.util.HashMap;
Map<String, Object> data = new HashMap<>();
```

### Unnecessary try-catch prohibited

Delegate to the common exception handler. Only use try-catch for special cases (resource management, etc.).

## Layer Architecture

- **Controller**: Routing and validation only. No business logic.
- **Service**: Business logic aggregation. Transaction management.
- **Repository**: Data access only. No `SELECT *`. Avoid N+1 problems.

## Coding Conventions

- Google Java Style Guide compliance
- Constructor injection (`@RequiredArgsConstructor`)
- DRY principle - check existing utilities before writing new code
- Specification-based testing (test functional requirements, not internal state)
