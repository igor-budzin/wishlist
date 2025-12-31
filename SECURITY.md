# Security

This document describes the security practices and scanning implemented in this repository.

## Automated Security Scanning

This repository uses [Trivy](https://github.com/aquasecurity/trivy) for automated vulnerability scanning. Trivy is an open-source security scanner that detects vulnerabilities in:

- Dependencies (npm packages)
- Container images
- Infrastructure as Code
- Hardcoded secrets
- Misconfigurations

## Workflow Integration

Security scans run automatically on:

- Every pull request to `main`
- Every push to `main` branch

The workflow will **fail** if it finds HIGH or CRITICAL severity vulnerabilities.

### What Gets Scanned

1. **Filesystem Scan** - Analyzes the entire repository for:
   - Vulnerable npm dependencies in `package.json` and `package-lock.json`
   - Hardcoded secrets and API keys
   - Misconfigured files (Dockerfiles, docker-compose.yml, etc.)

2. **Backend Image Scan** - Analyzes the built backend Docker image for:
   - Base image (Node.js Alpine) vulnerabilities
   - Application dependency vulnerabilities
   - Container configuration issues

3. **Frontend Image Scan** - Analyzes the built frontend Docker image for:
   - Base image vulnerabilities
   - Build dependencies
   - Configuration issues

## Viewing Security Results

### GitHub Actions

Check the workflow run for immediate feedback:

1. Go to **Actions** tab in the repository
2. Click on the **Security Scan** workflow
3. View the logs for each scan job

### GitHub Security Tab

View aggregated security findings:

1. Navigate to **Security** → **Code scanning**
2. Filter by tool: **Trivy**
3. Review alerts by severity
4. Click on alerts for detailed information

### Pull Request Checks

Security scans appear as required checks on pull requests. The PR cannot be merged until all security scans pass.

## Handling Vulnerabilities

### Severity Levels

- **CRITICAL** - Immediate action required, blocks deployment
- **HIGH** - Must fix before merging, blocks deployment
- **MEDIUM** - Fix in next sprint, doesn't block deployment
- **LOW** - Fix when convenient, doesn't block deployment

### Fixing Vulnerabilities

#### 1. Update Dependencies

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if available)
npm audit fix

# Update specific package
npm update <package-name>

# Install specific version
npm install <package-name>@<version>
```

#### 2. Update Base Images

If vulnerabilities are in the Docker base image:

```dockerfile
# Update Node.js version in Dockerfile
FROM node:20-alpine  # Update to latest patch version
```

#### 3. Remove Hardcoded Secrets

If secrets are detected:

1. Remove the hardcoded secret from code
2. Use environment variables instead
3. Add the file to `.gitignore` if it contains secrets
4. Rotate any exposed credentials immediately

```javascript
// Bad - Hardcoded secret
const apiKey = 'sk_live_abc123';

// Good - Environment variable
const apiKey = process.env.API_KEY;
```

### Suppressing False Positives

If a vulnerability is not applicable to your use case:

1. **Assess the risk** - Understand why it doesn't affect you
2. **Document the decision** - Add a clear comment
3. **Add to `.trivyignore`** - Suppress the specific CVE

Example `.trivyignore`:

```
# CVE-2023-12345: Not applicable because we don't use the affected feature
CVE-2023-12345

# GHSA-xxxx-yyyy-zzzz: Fixed in our usage pattern, waiting for official patch
GHSA-xxxx-yyyy-zzzz
```

**Important:** Only suppress vulnerabilities after proper risk assessment. Document your reasoning.

## Running Scans Locally

### Install Trivy

```bash
# macOS
brew install aquasecurity/trivy/trivy

# Linux
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# Windows
choco install trivy
```

### Scan Filesystem

```bash
# Scan current directory (automatically excludes node_modules and .git)
trivy fs .

# Scan with specific severity
trivy fs --severity HIGH,CRITICAL .

# Explicitly exclude additional directories
trivy fs --skip-dirs node_modules,.git,dist,build .

# Set via environment variable (alternative method)
TRIVY_SKIP_DIRS=node_modules,.git trivy fs .
```

### Scan Docker Images

```bash
# Build image
docker build -f packages/backend/Dockerfile -t wishlist-backend:test .

# Scan image
trivy image wishlist-backend:test

# Scan with specific severity
trivy image --severity HIGH,CRITICAL wishlist-backend:test
```

### Scan for Secrets Only

```bash
trivy fs --scanners secret .
```

## Troubleshooting

### Trivy Scanning node_modules

If Trivy is scanning `node_modules` despite exclusion settings:

**Solution 1: Verify skip-dirs is set correctly**

```bash
# The workflow uses both parameter and environment variable
skip-dirs: 'node_modules,.git'
env:
  TRIVY_SKIP_DIRS: 'node_modules,.git'
```

**Solution 2: Check if you're running locally**

```bash
# Always explicitly exclude when running locally
trivy fs --skip-dirs node_modules,.git --severity HIGH,CRITICAL .
```

**Solution 3: Verify .trivyignore patterns**

```
# In .trivyignore (for CVEs only, not directories)
# Note: .trivyignore is for CVE IDs, not directory patterns
```

**Important:** Trivy filesystem scans check `package-lock.json` for vulnerabilities, which is correct behavior. It should NOT scan individual files inside `node_modules/`. If you see vulnerability reports, they're coming from dependency analysis of lock files, not file scanning.

## Best Practices

1. **Keep dependencies updated** - Regularly run `npm update` and `npm audit`
2. **Review security alerts promptly** - Check GitHub Security tab weekly
3. **Don't suppress without reason** - Document all `.trivyignore` entries
4. **Rotate exposed secrets immediately** - If secrets leak, rotate them ASAP
5. **Use latest base images** - Keep Docker base images up to date
6. **Follow Node.js LTS** - Use actively supported Node.js versions
7. **Review PRs for security** - Check for new dependencies and configuration changes
8. **Understand scan behavior** - Trivy analyzes lock files (correct) vs scanning source files (unnecessary)

## Security Incident Response

If a security vulnerability is found in production:

1. **Assess severity** - Determine impact and exploitability
2. **Create hotfix branch** - `git checkout -b hotfix/security-CVE-YYYY-XXXXX`
3. **Fix the vulnerability** - Update dependencies or apply patches
4. **Test thoroughly** - Ensure fix doesn't break functionality
5. **Deploy immediately** - Use expedited deployment process for CRITICAL issues
6. **Document incident** - Record what happened and how it was fixed

## Resources

- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [npm audit Documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [GitHub Security Features](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Reporting Security Issues

If you discover a security vulnerability in this project:

1. **Do not** create a public GitHub issue
2. Email the security team directly (if configured)
3. Include detailed information about the vulnerability
4. Allow time for a fix before public disclosure

## Compliance

This security scanning workflow helps maintain compliance with:

- OWASP Top 10 security standards
- CVE vulnerability tracking
- Secret detection and prevention
- Container security best practices
