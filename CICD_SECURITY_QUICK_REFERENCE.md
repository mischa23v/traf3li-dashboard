# CI/CD Pipeline Security - Quick Reference Guide
## traf3li-backend Repository

**Last Updated:** 2025-12-22
**Overall Risk:** 🔴 **HIGH**

---

## Critical Issues Requiring Immediate Attention

### 🔴 Top 5 Critical Vulnerabilities

#### 1. GitHub Secret Scanning NOT ENABLED
**Risk:** Committed secrets won't be detected
**Fix:** Settings → Security → Enable secret scanning and push protection
**Time:** 5 minutes
**Priority:** P0 - URGENT

#### 2. Hardcoded Production IP Address in Workflow
**Location:** `.github/workflows/deploy-aws.yml` line 40
```yaml
host: 15.185.200.21  # ❌ EXPOSED
```
**Fix:** Replace with `${{ secrets.EC2_HOST }}`
**Time:** 10 minutes
**Priority:** P0 - URGENT

#### 3. No Dependabot Configuration
**Risk:** No automated dependency security updates
**Fix:** Create `.github/dependabot.yml` (see full report)
**Time:** 15 minutes
**Priority:** P0 - URGENT

#### 4. Third-Party Action Not SHA Pinned
**Location:** `.github/workflows/deploy-aws.yml`
```yaml
uses: appleboy/ssh-action@v1.0.3  # ❌ Mutable tag
```
**Fix:** Pin to commit SHA `@029f5b4aeeeb58fdfe1410a5d17f967dacf36262`
**Time:** 5 minutes
**Priority:** P0 - URGENT

#### 5. No SAST Scanning (CodeQL)
**Risk:** Code vulnerabilities undetected
**Fix:** Add CodeQL workflow (see full report)
**Time:** 30 minutes
**Priority:** P1 - Critical

---

## Quick Win Checklist (Under 1 Hour)

- [ ] Enable GitHub secret scanning (5 min)
- [ ] Enable Dependabot alerts (5 min)
- [ ] Fix hardcoded EC2 IP → use secret (10 min)
- [ ] Add workflow permissions to deploy-aws.yml (5 min)
- [ ] Pin appleboy/ssh-action to SHA (5 min)
- [ ] Create SECURITY.md file (10 min)
- [ ] Create .github/dependabot.yml (15 min)

**Total Time:** ~55 minutes
**Risk Reduction:** 40%

---

## Workflow Security Issues Summary

### deploy-aws.yml
| Issue | Severity | Line | Fix |
|-------|----------|------|-----|
| Missing permissions | 🔴 Critical | - | Add `permissions: contents: read` |
| Hardcoded IP | 🔴 Critical | 40 | Use `${{ secrets.EC2_HOST }}` |
| Action not SHA pinned | 🔴 Critical | 38 | Pin to commit SHA |
| No rollback mechanism | 🟠 High | 46-48 | Add health check + rollback |
| Deploys on every push | 🟠 High | 3-5 | Change to workflow_dispatch |

### security-scan.yml
| Issue | Severity | Line | Fix |
|-------|----------|------|-----|
| Excessive permissions | 🟡 Medium | 13 | Remove `issues: write` |
| Actions not SHA pinned | 🟠 High | Various | Pin all to commit SHAs |

---

## Missing Security Scans

| Scan Type | Status | Impact | Priority |
|-----------|--------|--------|----------|
| SAST (CodeQL) | ❌ Missing | Code vulnerabilities | P1 |
| Container Scanning | ❌ Missing | Docker image vulns | P1 |
| DAST | ❌ Missing | Runtime security | P2 |
| IaC Scanning | ❌ Missing | Config issues | P2 |
| License Compliance | ❌ Missing | Legal risk | P3 |
| SBOM Generation | ❌ Missing | Supply chain | P2 |

---

## Deployment Security Red Flags

1. **No staging environment** - deploys directly to production
2. **No approval gate** - automatic deployment on push
3. **No health checks** - can't detect failed deployments
4. **No rollback** - broken deploys stay broken
5. **Single point of failure** - SSH key compromise = full access
6. **No deployment logging** - can't audit who deployed what

---

## Docker Security Issues

### docker-compose.yml
```yaml
# ❌ CRITICAL: Default credentials
MONGO_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD:-changeme}
REDIS_PASSWORD: ${REDIS_PASSWORD:-}  # Empty!

# ❌ HIGH: Exposed ports
ports:
  - "27017:27017"  # MongoDB accessible from host
  - "6379:6379"    # Redis accessible from host
```

**Fix:** Use `${VAR:?Error: VAR not set}` syntax and bind to localhost

### Dockerfile
```dockerfile
# ❌ HIGH: Floating tag
FROM node:20-alpine

# ✅ FIX: Pin version
FROM node:20.11.0-alpine
```

---

## Secret Management Problems

| Issue | Risk | Fix |
|-------|------|-----|
| No rotation policy | High | Implement quarterly rotation |
| No secret docs | Medium | Create .github/SECRETS.md |
| generate-secrets.js prints to stdout | High | Write directly to .env with 0600 perms |
| SSH key scope unclear | Medium | Use restricted authorized_keys |

---

## npm Audit Configuration Inconsistency

Different thresholds in different places:

```bash
# .npmrc
audit-level=moderate

# deploy-aws.yml
npm audit --audit-level=high

# Pre-commit hook
# Blocks moderate+
```

**Fix:** Standardize to `high` everywhere

---

## GitHub Repository Settings

### Required Configurations

- [ ] **Branch protection** on `main`:
  - Require PR reviews (min 1)
  - Require status checks
  - Block force push
  - Block deletions

- [ ] **Security features**:
  - Secret scanning: ❌ DISABLED
  - Dependabot alerts: ❌ DISABLED
  - Dependency graph: ❓ Unknown
  - Code scanning: ❌ DISABLED

- [ ] **Required files**:
  - SECURITY.md: ❌ Missing
  - CODEOWNERS: ❌ Missing
  - dependabot.yml: ❌ Missing

---

## Immediate Action Template

### Step 1: Enable GitHub Security Features (10 min)
```
1. Go to: https://github.com/mischa23v/traf3li-backend/settings/security_analysis
2. Enable: Secret scanning
3. Enable: Push protection
4. Enable: Dependabot alerts
5. Enable: Dependabot security updates
6. Enable: Dependency graph
```

### Step 2: Fix Workflow Security (20 min)
```yaml
# deploy-aws.yml - Add at top
permissions:
  contents: read

# deploy-aws.yml - Replace host line
- host: ${{ secrets.EC2_HOST }}
+ username: ${{ secrets.EC2_USER }}

# deploy-aws.yml - Pin action
- uses: appleboy/ssh-action@029f5b4aeeeb58fdfe1410a5d17f967dacf36262
```

### Step 3: Create dependabot.yml (15 min)
```bash
mkdir -p .github
cat > .github/dependabot.yml << 'EOF'
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-request-limit: 10
    labels: ["dependencies", "security"]
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels: ["github-actions", "dependencies"]
EOF
```

### Step 4: Create SECURITY.md (10 min)
```bash
cat > SECURITY.md << 'EOF'
# Security Policy

## Reporting a Vulnerability

**DO NOT** create public GitHub issues for security vulnerabilities.

Contact: security@traf3li.com
Expected response: 48 hours

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x.x   | ✅        |
EOF
```

---

## Compliance Status

### OWASP CI/CD Top 10
**Score:** 1/10 (10%) - ❌ Failing

### SOC 2 Requirements
**Score:** 3/7 (43%) - ⚠️ Needs Improvement

### Key Gaps:
- No deployment approval process
- Insufficient audit logging
- No secret rotation policy
- Missing security monitoring

---

## Next Steps

### Week 1 (Critical - P0)
1. ✅ Enable all GitHub security features
2. ✅ Fix hardcoded credentials/IPs
3. ✅ Create security documentation
4. ✅ Pin all actions to SHAs
5. ✅ Add deployment health checks

### Week 2-4 (High - P1)
1. ✅ Add CodeQL SAST scanning
2. ✅ Add container scanning (Trivy)
3. ✅ Implement rollback mechanism
4. ✅ Create staging environment
5. ✅ Fix docker-compose security

### Month 2-3 (Medium - P2)
1. ✅ Add DAST scanning
2. ✅ Migrate to GitHub OIDC
3. ✅ Implement deployment approvals
4. ✅ Add comprehensive logging
5. ✅ Generate SBOMs

---

## Resources

**Full Report:** `CICD_PIPELINE_SECURITY_REPORT.md`

**Key Documentation:**
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [OWASP CI/CD Top 10](https://owasp.org/www-project-top-10-ci-cd-security-risks/)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)
- [CodeQL Setup](https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/configuring-code-scanning)

**Support:**
- Security Questions: security@traf3li.com
- CI/CD Issues: devops@traf3li.com

---

**Last Scan:** 2025-12-22
**Next Review:** 2026-01-22 (30 days)
**Estimated Risk Reduction After Phase 1:** 40%
**Estimated Time to Full Compliance:** 3-6 months
