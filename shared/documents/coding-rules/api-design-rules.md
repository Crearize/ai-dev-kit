# API Design Rules

REST API design rules for this project.

## 1. Endpoint Naming

### Basic Rules
- **Lowercase + hyphen-case**: `/api/v1/student-courses`
- **Resource names are plural**: `/api/v1/students`, `/api/v1/payments`
- **No verbs**: HTTP methods express operations (`/api/v1/students/create` is prohibited)

### Prefix Examples
| Target | Prefix | Example |
|--------|--------|---------|
| Admin | `/admin/v1/` | `/admin/v1/students` |
| User-facing | `/api/v1/` | `/api/v1/me` |
| Public (no auth) | `/public/v1/` | `/public/v1/products` |
| Debug (local only) | `/debug/v1/` | `/debug/v1/token` |

## 2. URL Nesting Limit

- **2 levels max**: `/api/v1/students/{id}/courses` is OK
- **3+ levels should be flattened**: Use query parameters

```
# NG - 3+ levels (prohibited)
GET /api/v1/students/{studentId}/courses/{courseId}/payments

# OK - flattened (recommended)
GET /api/v1/payments?studentId={studentId}&courseId={courseId}
```

## 3. HTTP Method Usage

| Method | Purpose | Idempotent | Request Body |
|--------|---------|-----------|--------------|
| GET | Retrieve | Yes | None |
| POST | Create | No | Yes |
| PUT | Full update | Yes | Yes |
| PATCH | Partial update | No | Yes |
| DELETE | Delete | Yes | None |

## 4. Path Parameters vs Query Parameters

| Usage | Use | Example |
|-------|-----|---------|
| Resource identification | Path parameter | `/students/{id}` |
| Filtering | Query parameter | `?status=active` |
| Sorting | Query parameter | `?sort=createdAt,desc` |
| Paging | Query parameter | `?page=0&size=20` |

## 5. Pagination

### Request Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 0 | Page number (0-based) |
| `size` | int | 20 | Items per page |
| `sort` | String | - | Sort criteria (e.g., `createdAt,desc`) |

### Response Format
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 5,
  "number": 0,
  "size": 20,
  "first": true,
  "last": false
}
```

## 6. Error Response Format

Unified error response format:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found",
    "details": {
      "resourceId": "550e8400-e29b-41d4-a716-446655440000"
    }
  },
  "timestamp": "2025-01-08T10:00:00+09:00"
}
```

### Top-Level Fields
| Field | Type | Description |
|-------|------|-------------|
| `error` | Object | Error detail object |
| `timestamp` | String | Error timestamp (ISO 8601 with timezone) |

### `error` Object Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | String | Yes | Error code (defined in error-codes.md) |
| `message` | String | Yes | Human-readable error message |
| `details` | Object | No | Additional info (validation field details, etc.) |

## Checklist

- [ ] Endpoints use lowercase + hyphen-case
- [ ] Resource names are plural
- [ ] URL nesting 2 levels or less
- [ ] HTTP methods appropriate
- [ ] Pagination uses page/size/sort parameters
- [ ] Error responses follow unified format
