# Backend Coding Rules (Detailed)

> **Tech Stack**: Java + Spring Boot

## Basic Policy

- Google Java Style Guide compliance
- Readability and maintainability first
- AI-friendly code structure

## 1. Java Conventions (Google Java Style Guide)

### 1.1 Formatting

- Indent: **2 spaces**
- Max line length: **100 characters**
- Line ending: LF (Unix)
- Encoding: UTF-8
- Newline at end of file

### 1.2 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Package | lowercase, dot-separated | `product.controller.admin` |
| Class | UpperCamelCase | `StudentService`, `PaymentHistory` |
| Method | lowerCamelCase | `getStudentById`, `calculatePayment` |
| Variable | lowerCamelCase | `studentName`, `courseCount` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |

### 1.3 Class Design Principles

- **Single Responsibility**: 1 class = 1 responsibility
- **Dependency Injection**: Prefer constructor injection
- **Immutability**: Use final where possible for DTOs and entities
- **No wildcard imports**: `import java.util.*;` is prohibited

## 2. Spring Boot Conventions

### 2.1 Controller Conventions

#### Required
- `@RestController` and `@RequestMapping`
- `@RequiredArgsConstructor` for DI
- RESTful endpoint design (no verbs in URLs)
- Validation with `@Valid`

#### Prohibited
- Business logic in Controller
- Direct Repository calls from Controller

```java
@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudent(@PathVariable UUID id) {
        return ResponseEntity.ok(studentService.findById(id));
    }

    @PostMapping
    public ResponseEntity<StudentResponse> createStudent(
            @Valid @RequestBody CreateStudentRequest request) {
        StudentResponse created = studentService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
```

### 2.2 Service Layer

#### Required
- `@Service` annotation
- `@RequiredArgsConstructor` for DI
- `@Slf4j` for logging
- `@Transactional` with `readOnly = true` for reads, default for writes

#### Design Rules
- Business logic aggregation
- Depend on Repository only
- Proper validation implementation
- Appropriate exception throwing

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class StudentService {
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public StudentResponse findById(UUID id) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new StudentNotFoundException(id));
        return StudentConverter.toResponse(student);
    }

    @Transactional
    public StudentResponse create(CreateStudentRequest request) {
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }
        Student student = StudentConverter.toEntity(request);
        Student created = studentRepository.save(student);
        return StudentConverter.toResponse(created);
    }
}
```

### 2.3 DTO Design

#### Naming Conventions
| DTO Type | Suffix | Example |
|----------|--------|---------|
| Request | Request | `CreateStudentRequest` |
| Response | Response | `StudentResponse` |
| Search | SearchCriteria | `StudentSearchCriteria` |

#### Validation
- `@NotBlank`: Required strings
- `@Size`: String length limits
- `@Email`: Email format
- `@Pattern`: Regex patterns

## 3. Repository Conventions

### Naming Conventions

| Operation | Prefix | Return Type | Example |
|-----------|--------|-------------|---------|
| Single fetch | findById | Optional<T> | `findById(UUID id)` |
| Multiple fetch | findBy/findAll | List<T> | `findByStatus(String status)` |
| Existence check | existsBy | boolean | `existsByEmail(String email)` |
| Insert | save/insert | T | `save(Student student)` |
| Update | update | int | `update(Student student)` |
| Delete | delete | int | `delete(UUID id)` |

### Query Optimization

- **No SELECT ***: Specify required columns only
- **Avoid N+1**: Use JOIN or batch fetch
- **Pagination**: Required for large datasets
- **Index usage**: Proper indexes for frequently queried columns

## 4. Testing Conventions

### Test Structure

- **Test class name**: `[TargetClass]Test`
- **Test method name**: Descriptive - "what_condition_expectedResult" format
- **Pattern**: given-when-then
- **Mocking**: Use Mockito for dependency isolation

### Coverage Targets

- **Line coverage**: 80%+ overall (business logic 90%+)
- **Branch coverage**: 75%+ overall

### Specification-Based Testing

- **No implementation-dependent tests**: Don't test internal state or private methods
- **Test functional requirements**: Derive test cases from specifications
- **Limited mock targets**: Only external dependencies (DB, external API, email, etc.)
- **Test independence**: Each test runs independently of others

```java
// NG - implementation-dependent test
@Test
void cacheContainsStudent() {
    service.getStudent(1L);
    assertThat(cache.get("student:1")).isNotNull();
}

// OK - specification-based test
@Test
void returnsStudentById() {
    Student result = service.getStudent(1L);
    assertThat(result.getName()).isEqualTo("Test User");
}
```

## 5. Exception Handling

### Exception Class Naming

| Type | Suffix | Example |
|------|--------|---------|
| Business | Exception | `StudentNotFoundException` |
| Validation | ValidationException | `EmailValidationException` |
| System | SystemException | `DatabaseSystemException` |

### Global Exception Handler

Use `@RestControllerAdvice` for centralized exception handling with appropriate HTTP status codes and error response format.

## Checklist

- [ ] Google Java Style Guide compliance
- [ ] Package structure follows conventions
- [ ] Naming conventions followed
- [ ] Controller contains no business logic
- [ ] Service layer properly uses @Transactional
- [ ] No SELECT * usage
- [ ] N+1 problem avoided
- [ ] Specification-based tests
- [ ] Branch coverage 75%+
- [ ] No sensitive information in error messages
