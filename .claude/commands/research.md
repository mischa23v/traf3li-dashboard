# Enterprise Research Workflow

You are conducting enterprise-level research for the TRAF3LI Dashboard project. This command creates comprehensive research documentation following industry best practices.

## Research Topic
Analyze the user's request to identify the research topic: $ARGUMENTS

## Research Structure

Create research documentation in `.research/{topic}/` with the following files:

### 1. README.md - Research Summary
```markdown
# Research: {Topic}

## Executive Summary
[2-3 sentence overview of findings]

## Key Recommendations
1. [Top recommendation with rationale]
2. [Second recommendation]
3. [Third recommendation]

## Sources Analyzed
- Enterprise APIs: [count] sources
- Open Source: [count] repositories
- Standards: [count] specifications
- Legal Tech: [count] competitors

## Next Steps
- [ ] Review with /plan command
- [ ] Create requirements.md
- [ ] Implement via /complete-phase
```

### 2. enterprise-patterns.md - Enterprise API Analysis
Research and document patterns from these enterprise sources:

**Cloud Providers:**
- AWS: Console patterns, SDK design, error handling
- Google Cloud: Material Design 3, API conventions
- Microsoft Azure: Fluent UI, enterprise patterns

**Enterprise SaaS:**
- Salesforce: Lightning Design System, CRM patterns
- ServiceNow: IT service management patterns
- Workday: HR/Finance enterprise patterns
- SAP: Business process patterns

**Focus Areas:**
- Authentication & authorization patterns
- Multi-tenant architecture
- Audit logging & compliance
- Error handling & recovery
- Performance optimization
- Accessibility (WCAG 2.1 AA)

### 3. open-source.md - GitHub Repository Analysis
Search and analyze relevant open-source implementations:

**Search Queries to Run:**
- `{topic} typescript react` - Modern implementations
- `{topic} enterprise` - Enterprise patterns
- `{topic} best practices` - Community standards

**For Each Repository Document:**
- Repository URL and stars
- Architecture patterns used
- Key implementation decisions
- Code snippets worth adopting
- Lessons learned

### 4. standards.md - Industry Standards
Document relevant standards and specifications:

**Technical Standards:**
- RFCs (if applicable)
- OWASP guidelines (security)
- W3C/WHATWG specs (web)
- ISO standards (if applicable)

**Design Standards:**
- WCAG 2.1 AA accessibility
- RTL/LTR internationalization
- Mobile-first responsive design

### 5. legal-tech.md - Competitor Analysis
Analyze legal tech competitors for relevant patterns:

**Primary Competitors:**
- Clio: Case management, billing, client portal
- PracticePanther: Practice management, integrations
- MyCase: Client communication, calendaring
- Rocket Matter: Time tracking, reporting
- CosmoLex: Accounting integration, compliance

**Analysis Points:**
- Feature implementation approach
- UX/UI patterns
- API design decisions
- Mobile experience
- Pricing/packaging patterns

### 6. recommendations.md - Actionable Items
Synthesize findings into actionable recommendations:

```markdown
# Recommendations for {Topic}

## Must Have (P0)
- [ ] [Critical feature/pattern with enterprise source]
- [ ] [Critical feature/pattern with rationale]

## Should Have (P1)
- [ ] [Important enhancement]
- [ ] [Important enhancement]

## Nice to Have (P2)
- [ ] [Future consideration]
- [ ] [Future consideration]

## Anti-Patterns to Avoid
- ❌ [Pattern to avoid with reason]
- ❌ [Pattern to avoid with reason]

## Integration with Existing Patterns
Reference gold standard implementations:
- Tasks List: `src/features/tasks/` - List view patterns
- useTasks Hook: `src/hooks/useTasks.ts` - Query patterns
- Design Specs: `.claude/commands/planform.md` - UI specifications
```

## Research Process

### Step 1: Web Research
Use WebSearch to find:
1. Enterprise documentation and best practices
2. GitHub repositories with high stars
3. Industry standards and specifications
4. Legal tech competitor features

### Step 2: Codebase Analysis
Check existing implementations:
1. Search for similar patterns in codebase
2. Review gold standard files (tasks, planform.md)
3. Check backend API specifications
4. Review existing components for reuse

### Step 3: Documentation
Create all files in `.research/{topic}/`:
1. Write README.md with executive summary
2. Document enterprise patterns found
3. List relevant open-source repos
4. Record applicable standards
5. Analyze legal tech competitors
6. Synthesize recommendations

### Step 4: Integration
Prepare for next steps:
1. Identify items for /plan command
2. Note design considerations for /design-concept
3. Flag technical decisions for /implementation

## Output Format

After completing research, provide:

```
## Research Complete: {Topic}

### Key Findings
- [Finding 1]
- [Finding 2]
- [Finding 3]

### Files Created
- .research/{topic}/README.md
- .research/{topic}/enterprise-patterns.md
- .research/{topic}/open-source.md
- .research/{topic}/standards.md
- .research/{topic}/legal-tech.md
- .research/{topic}/recommendations.md

### Recommended Next Steps
1. Run `/plan {topic}` to create requirements
2. Run `/design-concept {topic}` for UI planning
3. Run `/implementation {topic}` for technical design

### Integration Points
- Existing patterns: [list relevant existing code]
- API endpoints needed: [list from backend spec]
- Components to create/modify: [list]
```

## Gold Standard References

Always cross-reference with these approved patterns:

1. **List Views**: `src/features/tasks/` - Task list implementation
2. **Hooks**: `src/hooks/useTasks.ts` - TanStack Query patterns
3. **Design Specs**: `.claude/commands/planform.md` - UI dimensions and colors
4. **API Patterns**: `context/BACKEND-API-SPECIFICATION.md`
5. **Design Principles**: `context/design-principles.md`

## Example Usage

```bash
/research client-portal
/research invoice-management
/research document-automation
/research reporting-dashboard
```
