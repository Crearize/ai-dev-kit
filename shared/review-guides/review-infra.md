# Infrastructure / CI Review Guide

**Note**: Review only when the following files have been changed:
- `.github/workflows/**`
- `Dockerfile` / `docker-compose.yml`
- Build configuration files (e.g., `build.gradle`, `package.json`)
- Deployment configuration files

---

## Review Checklist

### 1. CI Workflows

- [ ] Actions versions pinned to major version (e.g., `actions/checkout@v4`)
- [ ] `timeout-minutes` set on all jobs
- [ ] `permissions` follows least-privilege principle
- [ ] Cache strategy appropriate (dependencies, build artifacts)
- [ ] No secrets hardcoded (use `${{ secrets.XXX }}`)
- [ ] Job dependencies (`needs`) appropriate
- [ ] Conditions (`if`) correctly configured
- [ ] Path filters prevent unnecessary triggers
- [ ] Error notifications and fallbacks considered

### 2. Docker Configuration

- [ ] Multi-stage build used (minimize image size)
- [ ] Base image version pinned (avoid `:latest`)
- [ ] `.dockerignore` properly configured
- [ ] Unnecessary layers minimized (combine RUN instructions)
- [ ] Security: non-root user used
- [ ] Health check configured
- [ ] Port numbers correct

### 3. Docker Compose (Local Development)

- [ ] Service definitions appropriate
- [ ] Volume mounts correct
- [ ] Environment variables properly configured
- [ ] Port numbers follow development conventions
- [ ] Timezone configuration included

### 4. Build Configuration

- [ ] Dependency versions pinned
- [ ] No unnecessary dependencies included
- [ ] No known security vulnerabilities in dependencies
- [ ] Plugin versions appropriate
- [ ] Test task configuration correct
- [ ] Build artifact settings correct

### 5. Package Configuration

- [ ] Dependency versions appropriate (semantic versioning)
- [ ] devDependencies vs dependencies properly separated
- [ ] Scripts definitions accurate
- [ ] Engine constraints maintained

### 6. Security

- [ ] Secrets not included in source code
- [ ] Secret references correct
- [ ] CORS settings appropriate
- [ ] SSL configuration appropriate
