# /naming-check - Naming Convention Validation

Run this command before `/arch-review` to validate naming convention compliance across the codebase.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## What This Command Does

1. Scans all modified/new files for naming convention violations
2. Validates against React/TypeScript naming standards
3. Reports issues with suggested fixes
4. Must PASS before running `/arch-review`

---

## Naming Convention Rules

### Components
| Pattern | Example | Status |
|---------|---------|--------|
| PascalCase | `ClientList.tsx` | Correct |
| camelCase | `clientList.tsx` | Wrong |
| kebab-case | `client-list.tsx` | Wrong |

```bash
# Check for wrong component naming
Grep: files matching "src/components/**/*.tsx" with lowercase first letter
```

### Hooks
| Pattern | Example | Status |
|---------|---------|--------|
| `use` prefix + PascalCase | `useClientData.ts` | Correct |
| Missing `use` prefix | `clientData.ts` | Wrong |
| Wrong case | `UseClientData.ts` | Wrong |

```bash
# Check hooks follow useXxx pattern
Glob: "src/hooks/*.ts" should all start with "use"
```

### Services
| Pattern | Example | Status |
|---------|---------|--------|
| camelCase + Service | `clientService.ts` | Correct |
| PascalCase | `ClientService.ts` | Wrong |
| Missing Service suffix | `client.ts` | Wrong |

### Types/Interfaces
| Pattern | Example | Status |
|---------|---------|--------|
| PascalCase | `interface ClientData {}` | Correct |
| I prefix (legacy) | `interface IClientData {}` | Avoid |
| camelCase | `interface clientData {}` | Wrong |

### Constants
| Pattern | Example | Status |
|---------|---------|--------|
| SCREAMING_SNAKE_CASE | `const API_BASE_URL = ...` | Correct |
| camelCase | `const apiBaseUrl = ...` | Wrong for constants |

### Files & Folders
| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `ClientCard.tsx` |
| Hooks | camelCase with use | `useClients.ts` |
| Services | camelCase | `clientService.ts` |
| Types | camelCase | `client.ts` |
| Utils | camelCase | `formatDate.ts` |
| Constants | camelCase | `routes.ts` |
| Folders | kebab-case | `client-management/` |

---

## Validation Checks

### 1. Component Naming
```bash
# Find components not using PascalCase
find src/components -name "*.tsx" | grep -E "^[a-z]"
find src/features -name "*.tsx" | grep -E "/[a-z][^/]*\.tsx$"
```

### 2. Hook Naming
```bash
# Find hooks not starting with 'use'
find src/hooks -name "*.ts" ! -name "use*" ! -name "index.ts"
```

### 3. Service Naming
```bash
# Find services not ending with 'Service'
find src/services -name "*.ts" ! -name "*Service.ts" ! -name "api.ts" ! -name "index.ts"
```

### 4. Type Export Naming
```bash
# Find type/interface not using PascalCase
Grep: "^export (type|interface) [a-z]" in src/types
```

### 5. Constant Naming
```bash
# Find exported constants not using SCREAMING_SNAKE_CASE
Grep: "^export const [a-z]" in src/constants
```

---

## Output Format

```markdown
# Naming Convention Report

## Summary
| Category | Checked | Violations | Status |
|----------|---------|------------|--------|
| Components | X | X | PASS/FAIL |
| Hooks | X | X | PASS/FAIL |
| Services | X | X | PASS/FAIL |
| Types | X | X | PASS/FAIL |
| Constants | X | X | PASS/FAIL |

## Violations Found

### Components
- `src/components/clientCard.tsx` → Rename to `ClientCard.tsx`

### Hooks
- `src/hooks/clientData.ts` → Rename to `useClientData.ts`

### Services
- `src/services/Client.ts` → Rename to `clientService.ts`

## Auto-Fix Available
The following can be auto-fixed:
1. [File rename suggestions]

## Manual Review Required
The following need manual intervention:
1. [Complex cases]

---

## Final Status
- [ ] All naming conventions followed
- [ ] Ready for `/arch-review`
```

---

## MANDATORY STOP

After validation, output:

```markdown
---

## Naming Check Complete

**Verdict**: PASS / FAIL

### Summary
| Category | Status |
|----------|--------|
| Components | PASS/FAIL |
| Hooks | PASS/FAIL |
| Services | PASS/FAIL |
| Types | PASS/FAIL |
| Constants | PASS/FAIL |

### Violations (if any)
- {Violation 1}
- {Violation 2}

---

If PASS:
→ Proceed to `/arch-review`

If FAIL:
→ Fix violations first, then re-run `/naming-check`

Reply with `yes` or `continue` to proceed to arch-review.
```

**WAIT FOR USER RESPONSE.**

---

## Workflow Position

```
/plan → /design → /tasks → /complete-phase → /arewedone →
/naming-check ← YOU ARE HERE → /arch-review → /verify → PR
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-17 | Initial version (ported from backend) |
