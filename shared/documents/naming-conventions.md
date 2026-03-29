# Naming Conventions

Project-wide naming conventions.

## 1. File Naming

| File Type | Convention | Example |
|-----------|-----------|---------|
| Java class | PascalCase | `StudentService.java` |
| Test class | PascalCase + Test | `StudentServiceTest.java` |
| Config file | kebab-case | `application-local.yml` |
| SQL migration | Version + description | `V2_1_0__AddPaymentDueDate.sql` |
| Markdown | kebab-case | `development-policy.md` |
| TSX component | PascalCase | `StudentList.tsx` |
| TypeScript | camelCase | `useStudentData.ts` |

## 2. Java Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Package | lowercase, dot-separated | `product.controller.admin` |
| Class | UpperCamelCase | `StudentService`, `PaymentHistory` |
| Method | lowerCamelCase | `getStudentById`, `calculatePayment` |
| Variable | lowerCamelCase | `studentName`, `courseCount` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |

## 3. TypeScript / React Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Component | PascalCase | `StudentList`, `PaymentForm` |
| Custom Hook | camelCase (use prefix) | `useStudentData`, `useAuth` |
| Function | camelCase | `fetchStudents`, `formatDate` |
| Variable | camelCase | `studentName`, `isLoading` |
| Type/Interface | PascalCase | `StudentResponse`, `CreateStudentRequest` |
| Constant | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_PAGE_SIZE` |

## 4. Database Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Table name | snake_case (plural) | `students`, `student_courses` |
| Column name | snake_case | `student_name`, `created_at` |
| Primary key | `id` | `id` |
| Foreign key | `[singular_table]_id` | `student_id`, `course_id` |
| Index | `idx_[table]_[column]` | `idx_students_email` |

## 5. API Endpoint Naming

| Method | Path Format | Example |
|--------|------------|---------|
| GET | `/api/v1/resources` | `/api/v1/students` |
| GET | `/api/v1/resources/{id}` | `/api/v1/students/{id}` |
| POST | `/api/v1/resources` | `/api/v1/students` |
| PUT | `/api/v1/resources/{id}` | `/api/v1/students/{id}` |
| DELETE | `/api/v1/resources/{id}` | `/api/v1/students/{id}` |

## 6. DTO Naming

| DTO Type | Suffix | Example |
|----------|--------|---------|
| Request | Request | `CreateStudentRequest` |
| Response | Response | `StudentResponse` |
| Search criteria | SearchCriteria | `StudentSearchCriteria` |

## 7. Git Naming

### Branch Name

```
[type]/[description]-[issue-number]
```

Example: `feature/add-login-123`, `fix/auth-bug-456`

### Commit Message

```
<type>: <subject>
```

Types: feat / fix / docs / style / refactor / test / chore / perf
