# Recommendations: {Topic}

## Executive Summary

Based on research across enterprise patterns, open source implementations, industry standards, and legal tech competitors, here are the actionable recommendations for implementing {topic} in TRAF3LI Dashboard.

---

## Must Have (P0) - Critical for Launch

### 1. [Recommendation Title]
**Source**: [Enterprise/Open Source/Standard/Competitor]
**Rationale**: [Why this is critical]

**Implementation**:
- [ ] [Specific task 1]
- [ ] [Specific task 2]
- [ ] [Specific task 3]

**Reference**: [Link to source documentation or code]

---

### 2. [Recommendation Title]
**Source**: [Enterprise/Open Source/Standard/Competitor]
**Rationale**: [Why this is critical]

**Implementation**:
- [ ] [Specific task 1]
- [ ] [Specific task 2]

**Reference**: [Link to source documentation or code]

---

## Should Have (P1) - Important Enhancements

### 1. [Recommendation Title]
**Source**: [Enterprise/Open Source/Standard/Competitor]
**Rationale**: [Why this is important]

**Implementation**:
- [ ] [Specific task 1]
- [ ] [Specific task 2]

**Reference**: [Link to source]

---

### 2. [Recommendation Title]
**Source**: [Enterprise/Open Source/Standard/Competitor]
**Rationale**: [Why this is important]

**Implementation**:
- [ ] [Specific task 1]
- [ ] [Specific task 2]

---

## Nice to Have (P2) - Future Considerations

### 1. [Recommendation Title]
**Source**: [Enterprise/Open Source/Standard/Competitor]
**Rationale**: [Why this would be nice]

**Implementation**:
- [ ] [Specific task 1]

---

### 2. [Recommendation Title]
**Source**: [Enterprise/Open Source/Standard/Competitor]
**Rationale**: [Why this would be nice]

---

## Anti-Patterns to Avoid

### ❌ [Anti-Pattern 1]
**Seen In**: [Where observed]
**Why Avoid**: [Explanation]
**Instead Do**: [Correct approach]

### ❌ [Anti-Pattern 2]
**Seen In**: [Where observed]
**Why Avoid**: [Explanation]
**Instead Do**: [Correct approach]

---

## Integration with TRAF3LI Existing Patterns

### Gold Standard References
Use these existing implementations as patterns:

| Pattern | Location | How to Apply |
|---------|----------|--------------|
| List View | `src/features/tasks/` | [Adaptation] |
| Query Hooks | `src/hooks/useTasks.ts` | [Adaptation] |
| UI Design | `.claude/commands/planform.md` | [Application] |
| Error Handling | `bilingualError()` pattern | [Application] |

### Existing Components to Reuse
- `src/components/ui/[component]` - [How to use]
- `src/components/ui/[component]` - [How to use]

### New Patterns to Introduce
- [Pattern] - Inspired by [source]
- [Pattern] - Inspired by [source]

---

## Backend Requirements

### Existing Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/[endpoint]` | GET | [Purpose] |
| `/api/v1/[endpoint]` | POST | [Purpose] |

### New Endpoints Needed
| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/v1/[endpoint]` | GET | [Purpose] | P0 |
| `/api/v1/[endpoint]` | POST | [Purpose] | P1 |

### Questions for Backend Team
1. [Question about API design]
2. [Question about data structure]

---

## Technical Architecture

### Recommended Approach
```
[Diagram or description of architecture]
```

### Data Flow
```
[User Action] → [Component] → [Hook] → [API Service] → [Backend]
                    ↓
              [State Update] → [UI Update]
```

### State Management
- **Server State**: TanStack Query with [specific patterns]
- **Client State**: Zustand for [specific use cases]

---

## Design Specifications

### Layout
Reference: `.claude/commands/planform.md`
- Container: [Specs]
- Grid: [Specs]
- Spacing: [Specs]

### Components
| Component | Specification | Reference |
|-----------|---------------|-----------|
| [Component] | [Specs] | planform.md |
| [Component] | [Specs] | planform.md |

### i18n Requirements
- [ ] AR translations for [list items]
- [ ] EN translations for [list items]
- [ ] RTL layout considerations for [specific elements]

---

## Implementation Roadmap

### Phase 1: Foundation
- [ ] [Task] - From P0 recommendation 1
- [ ] [Task] - From P0 recommendation 2

### Phase 2: Core Features
- [ ] [Task] - From P0 recommendation 3
- [ ] [Task] - From P1 recommendation 1

### Phase 3: Enhancements
- [ ] [Task] - From P1 recommendation 2
- [ ] [Task] - From P2 recommendation 1

---

## Next Steps

1. **Run `/discover {topic}`** - Verify existing code analysis
2. **Run `/design-concept {topic}`** - Create detailed UI specs
3. **Run `/plan {topic}`** - Generate requirements.md with EARS format
4. **Run `/implementation {topic}`** - Create technical design
5. **Run `/complete-phase`** - Execute implementation

---

## Appendix: Research Sources

### Enterprise Documentation
- [URL 1] - [What was learned]
- [URL 2] - [What was learned]

### Open Source Repositories
- [Repo 1] - [What was learned]
- [Repo 2] - [What was learned]

### Standards
- [Standard 1] - [How it applies]
- [Standard 2] - [How it applies]

### Competitor Features
- [Competitor 1] - [What was learned]
- [Competitor 2] - [What was learned]
