# GitHub Actions Workflows

This document describes the GitHub Actions workflows used in this repository.

## Overview

The repository uses three main workflows to handle CI/CD, security, and deployment:

1. **CI/CD Pipeline** (`ci-cd.yml`) - PR validation and testing
2. **Security Scan** (`security-scan.yml`) - Trivy vulnerability scanning
3. **Deploy to Production** (`deploy.yml`) - Production deployment

## Workflow Descriptions

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Purpose:** Validates pull requests before merging to ensure code quality and functionality.

**Trigger:**

- Pull request events (opened, synchronize, reopened) to `main` branch

**Jobs:**

1. **quality-checks** - Runs linting, formatting, and type checking
2. **test** - Executes test suite with coverage reporting
3. **build** - Builds all packages to verify compilation
4. **docker-build** - Builds and pushes Docker images with PR-specific tags

**Docker Tags Created:**

- `pr-<branch-name>` - Latest build of the PR branch
- `pr-<number>-<sha>` - Specific commit within the PR

**Example Tags:**

```
ghcr.io/igor-budzin/wishlist-frontend:pr-feature-auth
ghcr.io/igor-budzin/wishlist-frontend:pr-123-abc1234
ghcr.io/igor-budzin/wishlist-backend:pr-123
```

**Concurrency:** Cancels in-progress runs when new commits are pushed to the same PR (saves resources).

**Duration:** ~10-15 minutes

### 2. Security Scan (`security-scan.yml`)

**Purpose:** Scans repository and Docker images for security vulnerabilities using Trivy.

**Trigger:**

- Pull request events to `main` branch
- Push events to `main` branch

**Jobs:**

1. **filesystem-scan** - Scans repository filesystem for vulnerabilities in dependencies, secrets, and misconfigurations
2. **backend-image-scan** - Scans backend Docker image for vulnerabilities
3. **frontend-image-scan** - Scans frontend Docker image for vulnerabilities
4. **scan-summary** - Aggregates results from all scans

**Security Scanners:**

- **vuln** - Known vulnerabilities (CVEs) in dependencies
- **secret** - Hardcoded secrets and API keys
- **misconfig** - Configuration issues (Dockerfile, Kubernetes, Terraform, etc.)

**Severity Levels:**

- Fails on: `HIGH` or `CRITICAL` vulnerabilities
- Reports all findings to GitHub Security tab

**Features:**

- Trivy database caching for faster scans
- SARIF output uploaded to GitHub Security tab
- Excludes `.git` and `node_modules` directories
- Uses `.trivyignore` file for exception management
- Minimal permissions (contents: read, security-events: write)

**Concurrency:** Cancels in-progress runs when new commits are pushed (saves resources).

**Duration:** ~15-20 minutes

**Suppressing Vulnerabilities:**

To suppress specific vulnerabilities after risk assessment, add them to `.trivyignore`:

```
# Example: Suppress a specific CVE
CVE-2023-12345  # Safe because: using feature X which is not affected
```

### 3. Deploy to Production (`deploy.yml`)

**Purpose:** Deploys production-ready Docker images when code is merged to the main branch.

**Trigger:**

- Push events to `main` branch (after PR merge)

**Jobs:**

1. **quality-checks** - Validates code quality before deployment
2. **test** - Runs full test suite for safety
3. **build** - Verifies all packages build successfully
4. **docker-build-and-push** - Builds and pushes production Docker images

**Docker Tags Created:**

- `latest` - Always points to most recent main branch build
- `sha-<full-commit-sha>` - Exact version (40 characters) for audit/compliance
- `sha-<short-sha>` - Human-readable version (7 characters)
- `<timestamp>` - ISO 8601 timestamp for chronological ordering

**Example Tags:**

```
ghcr.io/igor-budzin/wishlist-frontend:latest
ghcr.io/igor-budzin/wishlist-frontend:sha-1234567890abcdef...
ghcr.io/igor-budzin/wishlist-frontend:sha-abc1234
ghcr.io/igor-budzin/wishlist-frontend:2025-12-26T14-30-45Z
```

**Concurrency:** Never cancels in-progress deployments (safety measure).

**Duration:** ~15-20 minutes

## Workflow Triggers Matrix

| Event                        | CI/CD Pipeline | Security Scan | Deploy to Production |
| ---------------------------- | -------------- | ------------- | -------------------- |
| PR opened                    | ✅ Runs        | ✅ Runs       | -                    |
| PR synchronized (new commit) | ✅ Runs        | ✅ Runs       | -                    |
| PR reopened                  | ✅ Runs        | -             | -                    |
| PR merged to main            | -              | ✅ Runs       | ✅ Runs              |
| Direct push to main          | -              | ✅ Runs       | ✅ Runs              |

## Job Dependencies

Both workflows follow the same job dependency chain:

```
quality-checks (lint, format, type-check)
    ↓
test (unit/integration tests with PostgreSQL)
    ↓
build (compile all packages)
    ↓
docker-build(-and-push) (create Docker images)
```

Each job must succeed before the next job runs. This ensures:

- Code quality is verified before running expensive tests
- Tests pass before building packages
- Builds succeed before creating Docker images

## Docker Image Strategy

### PR Images (Validation)

- **Purpose:** Test changes before merging
- **Lifecycle:** Temporary, for review and testing
- **Tags:** `pr-<number>`, `pr-<branch>`, `pr-<number>-<sha>`
- **Storage:** Can be pruned periodically

### Production Images (Deployment)

- **Purpose:** Deploy to production environments
- **Lifecycle:** Permanent, immutable versions
- **Tags:** `latest`, `sha-<sha>`, `<timestamp>`
- **Storage:** Keep for rollback capability

## Permissions

Workflows use minimal permissions following the principle of least privilege:

**CI/CD Pipeline:**

- `contents: read` - Read repository contents
- `packages: write` - Push Docker images to GitHub Container Registry
- `pull-requests: write` - Comment on pull requests

**Security Scan:**

- `contents: read` - Read repository contents
- `security-events: write` - Upload SARIF reports to Security tab

**Deploy to Production:**

- `contents: read` - Read repository contents
- `packages: write` - Push Docker images to GitHub Container Registry
- `pull-requests: write` - Comment on deployment status

## Caching Strategy

Workflows use GitHub Actions cache for improved performance:

**Docker Builds (CI/CD and Deploy):**

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

**Trivy Database (Security Scan):**

```yaml
path: ~/.cache/trivy
key: trivy-db-${{ github.run_id }}
restore-keys: trivy-db-
```

**Benefits:**

- Faster Docker builds (2-3 min vs 10-15 min)
- Trivy scans complete in seconds instead of minutes
- Shared cache between workflows
- Automatic cache management by GitHub

## Concurrency Control

### CI/CD Pipeline

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

- Cancels old runs when new commits are pushed to the same PR
- Saves GitHub Actions minutes
- Speeds up feedback loop

### Security Scan

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

- Cancels old scans when new commits are pushed
- Saves GitHub Actions minutes
- Always scans latest code

### Deploy to Production

```yaml
concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false
```

- Never cancels production deployments
- Ensures deployment integrity
- Prevents incomplete deployments

## Services

Both workflows use the following service containers:

### PostgreSQL (Test Suite)

- **Image:** `postgres:16-alpine`
- **Purpose:** Run tests against real database
- **Configuration:**
  - Database: `wishlist_test`
  - User: `test_user`
  - Password: `test_password`
  - Health checks enabled

## Artifacts

### CI/CD Pipeline

- **Coverage Reports:** Backend and frontend test coverage
- **Retention:** 30 days
- **Format:** JSON and HTML reports

## Notifications

### PR Comments

The CI/CD workflow posts sticky comments to PRs with:

- Test results and coverage metrics
- Docker image tags for testing
- Pull commands for preview images

### Deployment Summary

The deployment workflow creates a GitHub Actions summary with:

- Published Docker image tags
- Pull commands for each image
- Commit SHA and triggering user

## Troubleshooting

### Workflow Not Running

**PR Workflow:**

- Check that PR targets `main` branch
- Verify PR is in `opened`, `synchronize`, or `reopened` state

**Deploy Workflow:**

- Verify push is to `main` branch
- Check workflow file syntax with `yamllint`

### Build Failures

**Common Issues:**

1. **Quality Checks Fail:** Run `npm run lint:fix` and `npm run format` locally
2. **Tests Fail:** Run `npm test` locally with PostgreSQL running
3. **Build Fails:** Run `npm run build` locally after `npm run build:shared`
4. **Docker Build Fails:** Test locally with `docker build -f packages/frontend/Dockerfile .`

### Security Scan Failures

**Common Issues:**

1. **HIGH/CRITICAL vulnerabilities found:**
   - Update dependencies: `npm audit fix` or `npm update`
   - Check npm advisory for patches
   - If no fix available, assess risk and add to `.trivyignore` with justification

2. **Secrets detected:**
   - Remove hardcoded secrets from code
   - Use environment variables instead
   - Rotate any exposed credentials

3. **Misconfiguration found:**
   - Review Dockerfile best practices
   - Fix reported configuration issues
   - Update base images to latest secure versions

4. **False positives:**
   - Add CVE to `.trivyignore` with clear comment explaining why it's safe
   - Example: `CVE-2023-12345  # Not applicable: we don't use the affected feature`

### Cache Issues

If builds are slow or using stale cache:

```bash
# Cache is automatically managed by GitHub
# To force fresh build, update Dockerfile or dependencies
```

## Best Practices

1. **Always create a PR** - Never push directly to main
2. **Wait for all checks to pass** - Don't merge failing PRs (including security scans)
3. **Address security findings promptly** - Review and fix vulnerabilities before merging
4. **Review Docker tags** - Verify images are published correctly
5. **Monitor deployments** - Check GitHub Actions for deployment status
6. **Use specific tags in production** - Prefer SHA tags over `latest` for stability
7. **Keep dependencies updated** - Regularly run `npm audit` and update packages
8. **Review Security tab** - Check GitHub Security tab for SARIF reports and trends

## Updating Workflows

When modifying workflows:

1. **Test in a branch** - Create a test PR to validate changes
2. **Review job dependencies** - Ensure correct order of execution
3. **Check permissions** - Verify required permissions are granted
4. **Update documentation** - Keep this file in sync with changes
5. **Validate YAML syntax** - Use `yamllint` or GitHub's workflow validator

## Security Scanning Details

### What Trivy Scans

**Filesystem Scan:**

- `package.json` and `package-lock.json` for vulnerable npm packages
- Configuration files (Dockerfiles, docker-compose.yml, etc.)
- Infrastructure as Code files (if any)
- Hardcoded secrets and API keys

**Docker Image Scans:**

- OS packages in base image (Alpine Linux)
- Node.js runtime vulnerabilities
- Application dependencies
- Container configuration issues

### Viewing Security Results

1. **In GitHub Actions:** Check the workflow run logs for immediate feedback
2. **Security Tab:** Navigate to repository → Security → Code scanning alerts
3. **PR Checks:** Security scan must pass before merging
4. **SARIF Reports:** Uploaded as artifacts for detailed analysis

### Managing Vulnerabilities

**Priority Levels:**

1. **CRITICAL** - Fix immediately, block deployment
2. **HIGH** - Fix before merging, block deployment
3. **MEDIUM** - Fix soon, doesn't block deployment
4. **LOW** - Fix when convenient

**Action Steps:**

1. Review the vulnerability details in Security tab
2. Check if a patch/update is available
3. Update the affected package: `npm update <package>`
4. If no fix exists:
   - Assess if the vulnerability affects your usage
   - Document risk assessment
   - Add to `.trivyignore` if acceptable
   - Plan migration if needed

## Related Documentation

- [DOCKER.md](../../DOCKER.md) - Docker image tags and deployment
- [README.md](../../README.md) - General project documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [.trivyignore](./.trivyignore) - Vulnerability suppressions
