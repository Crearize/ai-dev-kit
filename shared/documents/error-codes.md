# Error Code List

Error codes used in this project. When implementing new error codes, always add them to this file.

## Error Code Naming Convention

### Format

```
[FEATURE]_[TYPE]_[DETAIL]
```

### Examples

```
USER_NOT_FOUND
AUTH_TOKEN_EXPIRED
PAYMENT_VALIDATION_ERROR
```

## HTTP Status Code Mapping

| HTTP Status | Usage | Error Code Example |
|-------------|-------|-------------------|
| 400 Bad Request | Validation error | `VALIDATION_ERROR` |
| 401 Unauthorized | Authentication error | `AUTH_TOKEN_EXPIRED`, `AUTH_INVALID_TOKEN` |
| 403 Forbidden | Authorization error | `AUTH_INSUFFICIENT_PERMISSION` |
| 404 Not Found | Resource not found | `USER_NOT_FOUND`, `RESOURCE_NOT_FOUND` |
| 409 Conflict | Conflict (duplicate, etc.) | `DUPLICATE_EMAIL` |
| 500 Internal Server Error | System error | `SYSTEM_INTERNAL_ERROR` |

## Error Codes

### Authentication / Authorization (AUTH)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_TOKEN_EXPIRED` | 401 | ID token expired |
| `AUTH_INVALID_TOKEN` | 401 | Invalid ID token |
| `AUTH_INSUFFICIENT_PERMISSION` | 403 | Insufficient permissions |

### General (GENERAL)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `DATA_NOT_FOUND` | 404 | Generic data not found |
| `DUPLICATE_DATA` | 409 | Data duplication |

### Validation (VALIDATION)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input |
| `INVALID_REQUEST` | 400 | Invalid request parameters |

### System (SYSTEM)

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `SYSTEM_INTERNAL_ERROR` | 500 | Unexpected system error |

---

**Note**: When adding new error codes, place them in the appropriate category.
If no suitable category exists, create a new section.
