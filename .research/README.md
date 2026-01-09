# Research Library

This folder contains enterprise-level research documentation for TRAF3LI Dashboard features. Each research topic gets its own subfolder with comprehensive analysis from multiple sources.

## Folder Structure

```
.research/
├── README.md                    # This file
├── _template/                   # Template files for new research
│   ├── README.md
│   ├── enterprise-patterns.md
│   ├── open-source.md
│   ├── standards.md
│   ├── legal-tech.md
│   └── recommendations.md
└── {topic}/                     # Research by topic
    ├── README.md                # Executive summary
    ├── enterprise-patterns.md   # AWS, Google, Microsoft, Salesforce patterns
    ├── open-source.md           # GitHub repository analysis
    ├── standards.md             # RFCs, OWASP, industry specs
    ├── legal-tech.md            # Competitor analysis (Clio, etc.)
    └── recommendations.md       # Actionable items for implementation
```

## Research Sources

### Enterprise APIs & Patterns
| Source | Focus Area | URL |
|--------|------------|-----|
| AWS | Console patterns, SDK design | docs.aws.amazon.com |
| Google Cloud | Material Design 3, APIs | cloud.google.com |
| Microsoft Azure | Fluent UI, enterprise | docs.microsoft.com |
| Salesforce | Lightning DS, CRM | developer.salesforce.com |
| ServiceNow | IT service management | docs.servicenow.com |
| Workday | HR/Finance enterprise | community.workday.com |

### Open Source
| Repository Type | Search Terms |
|-----------------|--------------|
| React/TypeScript | `{topic} typescript react` |
| Enterprise | `{topic} enterprise` |
| Best Practices | `{topic} best practices` |
| Legal Tech | `legal practice management open source` |

### Industry Standards
| Standard | Purpose |
|----------|---------|
| OWASP | Security guidelines |
| WCAG 2.1 AA | Accessibility |
| ISO 27001 | Information security |
| GDPR/PDPL | Data protection |

### Legal Tech Competitors
| Competitor | Strengths |
|------------|-----------|
| Clio | Market leader, integrations |
| PracticePanther | User experience |
| MyCase | Client communication |
| Rocket Matter | Time tracking |
| CosmoLex | Accounting integration |

## How to Use

### Starting New Research
```bash
/research {topic}
```
This command will:
1. Create `.research/{topic}/` folder
2. Research enterprise patterns
3. Analyze open source implementations
4. Review industry standards
5. Study legal tech competitors
6. Generate recommendations

### Integrating with Planning
After research is complete:
```bash
/discover {topic}    # Check existing code
/design-concept {topic}  # Create UI specs
/plan {topic}        # Generate requirements
```

## Gold Standard References

When researching, always cross-reference with these approved patterns:

### Code Patterns
- **Tasks List**: `src/features/tasks/` - List view implementation
- **useTasks Hook**: `src/hooks/useTasks.ts` - TanStack Query patterns
- **Clients Module**: `src/features/clients/` - CRUD operations

### Design Patterns
- **planform.md**: `.claude/commands/planform.md` - UI specifications
- **Design Principles**: `context/design-principles.md` - System rules

### API Patterns
- **Backend Spec**: `context/BACKEND-API-SPECIFICATION.md`
- **Operations API**: `contract2/OPERATIONS_API_SUMMARY.md`

## Research Quality Standards

Each research document should:

1. **Be Actionable** - Include specific recommendations
2. **Reference Sources** - Link to documentation/code
3. **Compare Options** - Evaluate alternatives
4. **Consider Context** - TRAF3LI is Saudi legal tech
5. **Prioritize Items** - P0, P1, P2 classifications

## Completed Research

| Topic | Date | Status | Key Findings |
|-------|------|--------|--------------|
| _template | - | Reference | Template files |

## Contributing

When adding research:
1. Copy `_template/` to `{topic}/`
2. Fill in all sections thoroughly
3. Update this README with summary
4. Link recommendations to /plan items
