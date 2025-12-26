# GitHub Actions Workflows

This document describes the GitHub Actions workflows used in this repository.

## Overview

The repository uses two main workflows to handle CI/CD and deployment:

1. **CI/CD Pipeline** (`ci-cd.yml`) - PR validation and testing
2. **Deploy to Production** (`deploy.yml`) - Production deployment

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

### 2. Deploy to Production (`deploy.yml`)

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

| Event                        | CI/CD Pipeline | Deploy to Production |
| ---------------------------- | -------------- | -------------------- |
| PR opened                    | ✅ Runs        | -                    |
| PR synchronized (new commit) | ✅ Runs        | -                    |
| PR reopened                  | ✅ Runs        | -                    |
| PR merged to main            | -              | ✅ Runs              |
| Direct push to main          | -              | ✅ Runs              |

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

Both workflows require the following permissions:

- `contents: read` - Read repository contents
- `packages: write` - Push Docker images to GitHub Container Registry
- `pull-requests: write` - Comment on pull requests (CI/CD only)

## Caching Strategy

Both workflows use GitHub Actions cache for Docker builds:

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

**Benefits:**

- Faster subsequent builds (2-3 min vs 10-15 min)
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

### Cache Issues

If builds are slow or using stale cache:

```bash
# Cache is automatically managed by GitHub
# To force fresh build, update Dockerfile or dependencies
```

## Best Practices

1. **Always create a PR** - Never push directly to main
2. **Wait for CI to pass** - Don't merge failing PRs
3. **Review Docker tags** - Verify images are published correctly
4. **Monitor deployments** - Check GitHub Actions for deployment status
5. **Use specific tags in production** - Prefer SHA tags over `latest` for stability

## Updating Workflows

When modifying workflows:

1. **Test in a branch** - Create a test PR to validate changes
2. **Review job dependencies** - Ensure correct order of execution
3. **Check permissions** - Verify required permissions are granted
4. **Update documentation** - Keep this file in sync with changes
5. **Validate YAML syntax** - Use `yamllint` or GitHub's workflow validator

## Related Documentation

- [DOCKER.md](../../DOCKER.md) - Docker image tags and deployment
- [README.md](../../README.md) - General project documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
