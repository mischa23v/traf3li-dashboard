# Industry Standards: {Topic}

## Security Standards

### OWASP Guidelines
- **Relevant Guidelines**: [List applicable OWASP items]
- **URL**: https://owasp.org/[relevant-page]

#### OWASP Top 10 Considerations
| Risk | Applies? | Mitigation |
|------|----------|------------|
| Injection | Yes/No | [How to prevent] |
| Broken Auth | Yes/No | [How to prevent] |
| Sensitive Data | Yes/No | [How to prevent] |
| XXE | Yes/No | [How to prevent] |
| Broken Access | Yes/No | [How to prevent] |
| Security Misconfig | Yes/No | [How to prevent] |
| XSS | Yes/No | [How to prevent] |
| Insecure Deserialization | Yes/No | [How to prevent] |
| Known Vulnerabilities | Yes/No | [How to prevent] |
| Insufficient Logging | Yes/No | [How to prevent] |

---

## Accessibility Standards

### WCAG 2.1 AA Requirements
- **URL**: https://www.w3.org/WAI/WCAG21/quickref/

#### Perceivable
| Criterion | Level | Applies | Implementation |
|-----------|-------|---------|----------------|
| 1.1.1 Non-text Content | A | Yes | Alt text, ARIA |
| 1.3.1 Info and Relationships | A | Yes | Semantic HTML |
| 1.4.3 Contrast | AA | Yes | 4.5:1 ratio |
| 1.4.11 Non-text Contrast | AA | Yes | 3:1 ratio |

#### Operable
| Criterion | Level | Applies | Implementation |
|-----------|-------|---------|----------------|
| 2.1.1 Keyboard | A | Yes | Tab navigation |
| 2.4.3 Focus Order | A | Yes | Logical flow |
| 2.4.7 Focus Visible | AA | Yes | Focus rings |

#### Understandable
| Criterion | Level | Applies | Implementation |
|-----------|-------|---------|----------------|
| 3.1.1 Language | A | Yes | lang attribute |
| 3.2.1 On Focus | A | Yes | No auto-changes |
| 3.3.1 Error Identification | A | Yes | Clear errors |

#### Robust
| Criterion | Level | Applies | Implementation |
|-----------|-------|---------|----------------|
| 4.1.1 Parsing | A | Yes | Valid HTML |
| 4.1.2 Name, Role, Value | A | Yes | ARIA labels |

---

## Data Protection Standards

### PDPL (Saudi Arabia)
- **Personal Data Protection Law**
- **Relevant Articles**: [List]

#### Requirements
| Requirement | Implementation |
|-------------|----------------|
| Consent | [How to implement] |
| Data Minimization | [How to implement] |
| Purpose Limitation | [How to implement] |
| Storage Limitation | [How to implement] |
| Security | [How to implement] |

### GDPR Alignment (if applicable)
| Principle | Implementation |
|-----------|----------------|
| Lawfulness | [How to implement] |
| Purpose | [How to implement] |
| Minimization | [How to implement] |
| Accuracy | [How to implement] |
| Storage | [How to implement] |
| Security | [How to implement] |
| Accountability | [How to implement] |

---

## API Standards

### REST Best Practices
| Standard | Implementation |
|----------|----------------|
| HTTP Methods | GET, POST, PUT, DELETE |
| Status Codes | 200, 201, 400, 401, 403, 404, 500 |
| Pagination | Cursor-based or offset |
| Versioning | URL or header |
| Error Format | Consistent JSON structure |

### Relevant RFCs
| RFC | Title | Applies |
|-----|-------|---------|
| RFC 7231 | HTTP/1.1 Semantics | Yes |
| RFC 7807 | Problem Details | Yes |
| RFC 6749 | OAuth 2.0 | Yes |
| RFC 7519 | JWT | Yes |

---

## Internationalization Standards

### RTL/LTR Requirements
| Standard | Implementation |
|----------|----------------|
| Unicode BiDi | dir="rtl" attribute |
| Logical Properties | margin-inline-start |
| Number Formatting | Intl.NumberFormat |
| Date Formatting | Intl.DateTimeFormat |

### Arabic Language Specific
| Consideration | Implementation |
|---------------|----------------|
| Font Support | System Arabic fonts |
| Line Height | 1.6-1.8 for readability |
| Kashida | CSS text-justify |
| Numerals | Arabic-Indic option |

---

## Summary: Standards Checklist

### Must Comply (P0)
- [ ] [Standard] - [Requirement]
- [ ] [Standard] - [Requirement]

### Should Comply (P1)
- [ ] [Standard] - [Requirement]
- [ ] [Standard] - [Requirement]

### Best Practice (P2)
- [ ] [Standard] - [Requirement]
- [ ] [Standard] - [Requirement]
