---
name: discover
description: Analyze existing codebase before planning new features
version: 1.1.0
risk: A
reviewer: null
last_updated: 2026-01-14
---

# Pre-Planning Discovery Command

You are conducting a comprehensive codebase analysis before planning any new feature. This is a MANDATORY step before running `/plan`.

## Discovery Topic
Analyze the user's request: $ARGUMENTS

## Discovery Checklist

### 1. Existing Components Search
Search for related components that might already exist:

```bash
# Search patterns to run:
Glob: src/**/*{topic}*.tsx
Glob: src/**/*{topic}*.ts
Glob: src/features/**/*{related-term}*
Glob: src/components/**/*{related-term}*
Grep: "{topic}" in src/
Grep: "{related-term}" in src/
```

**Document:**
- [ ] Components found: [list with paths]
- [ ] Hooks found: [list with paths]
- [ ] Services found: [list with paths]
- [ ] Types found: [list with paths]
- [ ] Utils found: [list with paths]

### 2. Feature Module Analysis
Check if a feature module exists:

```
src/features/{topic}/
 components/     # UI components
 hooks/         # Feature-specific hooks
 services/      # API services
 types/         # TypeScript types
 utils/         # Utilities
 index.ts       # Public exports
```

**Status:**
- [ ] Feature module EXISTS → Document structure
- [ ] Feature module MISSING → Will need to create

### 3. Shared Hooks Check
Search for reusable hooks:

```bash
Glob: src/hooks/use*.ts
Grep: "use{Topic}" in src/hooks/
```

**Gold Standard Hooks to Reference:**
- `useTasks.ts` - TanStack Query patterns, optimistic updates
- `useClients.ts` - CRUD operations pattern
- `useCases.ts` - Complex entity management

### 4. API Services Check
Search for existing API integrations:

```bash
Glob: src/services/*{topic}*.ts
Grep: "{topic}" in src/services/
```

**Check Backend Specifications:**
- `context/BACKEND-API-SPECIFICATION.md`
- `contract2/OPERATIONS_API_SUMMARY.md`
- `BACKEND.md`

**Document:**
- [ ] Existing endpoints: [list]
- [ ] Missing endpoints needed: [list]
- [ ] Backend changes required: [yes/no with details]

### 5. Route Structure Check
Check existing routes:

```bash
Grep: "{topic}" in src/constants/routes.ts
Grep: "{topic}" in src/routes/
```

**Document:**
- [ ] Existing routes: [list]
- [ ] New routes needed: [list]

### 6. Query Keys Check
Verify query key patterns:

```bash
Grep: "{topic}" in src/lib/query-keys.ts
```

**Document:**
- [ ] Existing query keys: [list]
- [ ] New query keys needed: [list]

### 7. Type Definitions Check
Search for existing types:

```bash
Glob: src/types/*{topic}*.ts
Grep: "interface {Topic}" in src/
Grep: "type {Topic}" in src/
```

**Document:**
- [ ] Existing types: [list with locations]
- [ ] Types to extend: [list]
- [ ] New types needed: [list]

### 8. Similar Features Analysis
Find similar features to use as patterns:

**Gold Standard Features:**
| Feature | Location | Pattern |
|---------|----------|---------|
| Tasks | `src/features/tasks/` | List view, CRUD, filters |
| Clients | `src/features/clients/` | Entity management |
| Cases | `src/features/cases/` | Complex workflows |
| Invoices | `src/features/invoices/` | Financial transactions |

**Analyze Similar Feature:**
1. Read the feature's main component
2. Document the patterns used
3. Note reusable code
4. Identify adaptable structures

### 9. Design System Check
Check existing UI patterns:

```bash
Glob: src/components/ui/*.tsx
Grep: "{component-type}" in src/components/
```

**Reference:**
- `.claude/commands/planform.md` - Gold standard design specs
- `context/design-principles.md` - Design system rules

### 10. i18n Keys Check
Search for translation patterns:

```bash
Grep: "{topic}" in src/locales/
Grep: "{topic}" in public/locales/
```

**Document:**
- [ ] Existing translations: [list]
- [ ] New translations needed: [list]

## Output Format

After discovery, provide this report:

```markdown
# Discovery Report: {Topic}

## Executive Summary
[2-3 sentences on what exists vs what's needed]

## Existing Assets

### Components Found
| Component | Path | Reusable? |
|-----------|------|-----------|
| {name} | {path} | Yes/No/Partial |

### Hooks Found
| Hook | Path | Pattern |
|------|------|---------|
| {name} | {path} | {pattern used} |

### Services Found
| Service | Path | Endpoints |
|---------|------|-----------|
| {name} | {path} | {endpoints} |

### Types Found
| Type | Path | Can Extend? |
|------|------|-------------|
| {name} | {path} | Yes/No |

## Gap Analysis

### Must Create
- [ ] {Component/Hook/Service} - {reason}
- [ ] {Component/Hook/Service} - {reason}

### Must Modify
- [ ] {File} - {modification needed}
- [ ] {File} - {modification needed}

### Can Reuse As-Is
- {Component} from {path}
- {Hook} from {path}

## Backend Requirements
- [ ] API exists: {list existing endpoints}
- [ ] API needed: {list missing endpoints}
- [ ] Ask user about: {unclear backend requirements}

## Similar Feature to Follow
Recommended pattern source: `src/features/{similar}/`
Key files to reference:
1. {file1} - {reason}
2. {file2} - {reason}

## Questions for User
1. {Question about unclear requirement}
2. {Question about backend/API}

## Ready for Planning
- [ ] All existing code documented
- [ ] Gap analysis complete
- [ ] Backend requirements clear
- [ ] User questions answered

→ Run `/plan {topic}` when ready
→ Run `/research {topic}` if more context needed
```

## Integration with Other Commands

### Before /discover
- `/research {topic}` - If you need enterprise patterns first

### After /discover
- `/plan {topic}` - Create requirements with EARS format
- `/design-concept {topic}` - Plan UI/UX approach

## Example Usage

```bash
/discover client-portal
/discover invoice-management
/discover calendar-integration
/discover document-automation
```

## Critical Rules

1. **NEVER skip discovery** - Always run before /plan
2. **Document everything found** - No assumptions
3. **Ask if unclear** - Especially about backend/API
4. **Reference gold standards** - Tasks, planform.md
5. **Update todo list** - Track discovery progress
