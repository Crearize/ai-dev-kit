# Common Coding Rules

Project-wide coding rules and development standards.

## Basic Principles

- Consistency: Unified style across the project
- Readability: Code understandable by developers and AI
- Maintainability: Easy to change and extend
- Security: No vulnerability-introducing implementations

## 1. Git/GitHub Conventions

### 1.1 Commit Messages

#### Format
```
<type>: <subject>

[optional body]

[optional footer]
```

#### Types
| Type | Description | Example |
|------|------------|---------|
| feat | New feature | `feat: add student search` |
| fix | Bug fix | `fix: resolve login error` |
| docs | Documentation | `docs: update API spec` |
| style | Code style | `style: fix indentation` |
| refactor | Refactoring | `refactor: simplify service logic` |
| test | Tests | `test: add controller tests` |
| chore | Build/tools | `chore: update dependencies` |
| perf | Performance | `perf: optimize queries` |

#### Rules
- Subject line: 50 characters or less
- Start with verb
- Body: wrap at 72 characters
- Include Issue number if applicable (#123)

### 1.2 Branch Strategy

```
feature/[feature-name]     # New feature
fix/[bug-description]      # Bug fix
docs/[document-name]       # Documentation
refactor/[target]          # Refactoring
test/[test-target]         # Test additions/fixes
```

#### Rules
- Use kebab-case (`feature/student-search`)
- Concise and descriptive names
- Include Issue number if applicable (`feature/student-search-123`)

### 1.3 Pull Requests

#### PR Template
```markdown
## Summary
<!-- Brief description of what was implemented/fixed -->

## Purpose
<!-- Why this change is needed -->

## Changes
<!-- Main changes as bullet points -->

## Test Results
<!-- Tests performed -->

## Checklist
- [ ] Tests pass
- [ ] Documentation updated (if needed)
- [ ] Ready for code review

## Related Issue
Closes #
```

## 2. Comment Conventions

### Required Comments
- **Public methods**: Purpose and usage
- **Complex logic**: Intent of processing
- **External API integration**: Specification references

### TODO/FIXME Comments
```
// TODO: [deadline] Implementation description
// FIXME: [priority] Fix description
// NOTE: Important supplementary information
// HACK: Temporary workaround
```

#### Rules
- Deadline/priority required
- Include Issue number if available
- Review and remove periodically
- Prohibited: Leaving commented-out code

## 3. Environment Variable Conventions

### Rules
- Follow framework-standard hierarchical structure
- Variable names: UPPER_SNAKE_CASE
- Default values: Set for development environment
- Sensitive information: Listed in .gitignore

### Security Rules
- Never commit API keys to Git
- Production secrets managed via environment variable services
- Secret configuration files always in .gitignore

## 4. Security Rules

### Secret Management
- **Environment variable management** (no hardcoding)
- **Log output masking**
- **Never commit to Git** (.gitignore)
- **Never expose to client-side**

### Input Validation
- Server-side validation required
- SQL injection prevention (parameterized queries)
- XSS prevention (output escaping)

### OWASP Top 10 Awareness
- **Injection**: 全ての外部入力にパラメタライズドクエリを使用。動的SQLの文字列結合は禁止
- **Broken Authentication**: セッショントークンは十分なエントロピーで生成。パスワードはbcrypt/scryptでハッシュ化
- **Sensitive Data Exposure**: APIレスポンスに不要な個人情報を含めない。ログにパスワード・トークン・個人情報を出力しない
- **Broken Access Control**: 全てのエンドポイントで認証・認可チェックを実施。IDORに注意（他ユーザーのリソースにアクセスできないこと）
- **Security Misconfiguration**: 本番環境でデバッグモード無効。不要なHTTPメソッド無効。適切なセキュリティヘッダー設定
- **CSRF**: 状態変更リクエスト（POST/PUT/DELETE）にCSRF対策を実施（SPAの場合はSameSite Cookie + CORSで対応可）
- **SSRF**: 外部URLを受け取る機能はホワイトリスト方式で制限

### Dependency Security
- 既知の脆弱性がある依存パッケージを使用しない
- セキュリティアップデートは速やかに適用

## 5. Performance Rules

### Required
- **N+1 problem prevention**: Use JOIN or batch fetch
- **Index design**: Set on frequently queried columns
- **Pagination**: Required for large datasets
- **No unnecessary column fetching**: No SELECT *

## Checklist

### Git/GitHub
- [ ] Commit message follows `<type>: <subject>` format
- [ ] Type is correct
- [ ] Subject line 50 chars or less
- [ ] Branch name is kebab-case and follows conventions

### Security
- [ ] No hardcoded API keys or secrets
- [ ] Secrets managed via environment variables
- [ ] Log output masked for sensitive data
- [ ] Input validation implemented (server-side required)
- [ ] No IDOR vulnerabilities (authorization checked for resource access)
- [ ] CSRF protection implemented
- [ ] Security headers configured (production)
- [ ] No sensitive data in API responses beyond what's necessary

### Performance
- [ ] No N+1 problems
- [ ] Proper caching strategy
- [ ] Pagination for large datasets
- [ ] Proper indexes set

### Code Quality
- [ ] Documentation comments appropriate
- [ ] TODO/FIXME has deadline/priority
- [ ] No System.out.println / console.log in production
- [ ] No commented-out code
- [ ] Proper error handling
