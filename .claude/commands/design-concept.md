# Design Concept Command

You are creating a distinctive, production-grade design concept for the TRAF3LI Dashboard. This command integrates enterprise research with the Frontend Design Skill to create UI specifications that avoid generic "AI slop" aesthetics.

## Design Topic
Create design concept for: $ARGUMENTS

## Design Philosophy

### Avoid "AI Slop" Aesthetics
❌ **DO NOT USE:**
- Generic fonts (Inter, Roboto, Open Sans defaults)
- Predictable card layouts with rounded corners
- Purple/blue gradients
- Stock illustration styles
- Overly safe, committee-designed interfaces
- Excessive whitespace without purpose
- Generic icon sets without customization

✅ **DO USE:**
- Bold, committed typography choices
- Distinctive color palettes with personality
- Unexpected but functional layouts
- Purposeful motion and micro-interactions
- Custom iconography or thoughtfully curated sets
- Density where appropriate for power users
- Visual hierarchy that guides without hand-holding

## Design Concept Structure

### 1. Design Brief
```markdown
# Design Brief: {Feature}

## Problem Statement
[What user problem are we solving?]

## Target Users
- Primary: [User type and their needs]
- Secondary: [Additional user types]

## Success Metrics
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]

## Constraints
- RTL/LTR bilingual support required
- Mobile-responsive (but desktop-first for this app)
- WCAG 2.1 AA accessibility
- Consistent with existing TRAF3LI design system
```

### 2. Visual Direction
```markdown
## Visual Direction

### Typography
- Headings: [Font choice with rationale]
- Body: [Font choice with rationale]
- Monospace (if needed): [Font choice]
- Scale: [Size progression]

### Color Palette
Reference existing TRAF3LI palette from planform.md:
- Background: slate-900 (#0f172a)
- Cards: slate-800 (#1e293b)
- Text Primary: slate-50 (#f8fafc)
- Text Secondary: slate-400 (#94a3b8)
- Accent: [Feature-specific accent]

Priority Colors (from gold standard):
- Critical: red-500 (#ef4444)
- High: orange-500 (#f97316)
- Medium: amber-400 (#fbbf24)
- Low: emerald-400 (#34d399)
- Default: slate-400 (#94a3b8)

### Spacing System
Reference planform.md specifications:
- Container padding: p-6
- Card gaps: gap-4
- Section margins: space-y-6
- Input heights: h-14
- Border radius: rounded-2xl (cards), rounded-[2rem] (containers)

### Motion
- Transitions: 200ms ease-out (default)
- Hover states: scale-105 with shadow
- Loading: Skeleton animations
- Page transitions: Fade with slight slide
```

### 3. Component Specifications
```markdown
## Component Specifications

### Page Layout
Following planform.md gold standard:
┌─────────────────────────────────────────────────────────┐
│ [Sidebar] │ [Filter Card]          │ [Quick Actions]   │
│           │ [List Items]           │ [Calendar Widget] │
│           │ [Load More]            │                   │
└─────────────────────────────────────────────────────────┘

### Filter Card (if applicable)
- Background: bg-slate-800/50
- Border: border border-white/5
- Radius: rounded-2xl
- Padding: p-6
- Inputs: h-14 bg-slate-800 rounded-xl

### List Item Cards
- Container: bg-slate-800/30 hover:bg-slate-800/50
- Border: border border-white/5
- Radius: rounded-xl
- Padding: p-4
- Transition: transition-all duration-200

### Quick Actions Sidebar (if applicable)
- Width: w-80
- Background: bg-slate-800/30
- Sections: Upcoming, Statistics, Quick Actions

### Empty State
- Icon: [Relevant icon]
- Message: Bilingual (AR/EN)
- Action: Primary CTA button

### Loading State
- Skeleton: bg-slate-700 animate-pulse
- Count: 5 skeleton items
```

### 4. Interaction Design
```markdown
## Interaction Design

### Keyboard Shortcuts
Reference planform.md patterns:
- N: New item
- S: Toggle select mode
- D: Delete selected
- A: Archive selected
- Escape: Clear selection
- /: Focus search

### Hover States
- Cards: Scale 1.02, shadow increase
- Buttons: Background lighten
- Links: Underline or color shift

### Click/Tap Feedback
- Buttons: Scale 0.98 on press
- Cards: Subtle depression effect
- Interactive elements: Ripple effect (optional)

### Loading Feedback
- Inline spinners for quick actions
- Skeleton screens for page loads
- Progress indicators for long operations
- Optimistic updates where appropriate
```

### 5. Responsive Behavior
```markdown
## Responsive Behavior

### Desktop (1280px+)
- Three-column layout
- Full sidebar visible
- Quick actions panel

### Tablet (768px - 1279px)
- Two-column layout
- Collapsible sidebar
- Quick actions in sheet

### Mobile (< 768px)
- Single column
- Bottom navigation
- Full-screen sheets for actions
```

### 6. RTL Considerations
```markdown
## RTL/LTR Support

### Layout Mirroring
- Flex direction: Use `flex-row-reverse` in RTL
- Text alignment: Use `text-start` not `text-left`
- Icons: Mirror directional icons
- Margins/Paddings: Use logical properties (ms-, me-, ps-, pe-)

### Typography
- Arabic: System Arabic fonts with proper line-height
- Numbers: Use Arabic numerals in AR context
- Mixed content: Proper bidirectional handling

### Components to Review
- Navigation arrows
- Progress indicators
- Form layouts
- Table columns
```

### 7. Accessibility Checklist
```markdown
## Accessibility (WCAG 2.1 AA)

### Color Contrast
- [ ] Text meets 4.5:1 ratio
- [ ] Large text meets 3:1 ratio
- [ ] Interactive elements meet 3:1 ratio

### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Visible focus indicators
- [ ] Logical tab order
- [ ] Escape closes modals/popovers

### Screen Reader
- [ ] Proper heading hierarchy
- [ ] ARIA labels on icons
- [ ] Form labels associated
- [ ] Status announcements

### Motion
- [ ] Respects prefers-reduced-motion
- [ ] No content-blocking animations
- [ ] Pausable auto-playing content
```

## Output Format

```markdown
# Design Concept: {Feature}

## Summary
[Brief description of the design direction]

## Visual Direction
[Key visual decisions with rationale]

## Key Components
| Component | Specification | Reference |
|-----------|---------------|-----------|
| {name} | {specs} | planform.md |

## Interaction Patterns
[Key interactions and their implementations]

## Files to Create/Modify
1. `src/features/{feature}/components/{Component}.tsx`
2. `src/features/{feature}/components/{Component}.tsx`

## Design Tokens Needed
- [New color if any]
- [New spacing if any]

## Questions/Decisions
1. [Design decision needing user input]
2. [Alternative approaches to discuss]

## Next Steps
→ Run `/plan {feature}` with this design context
→ Run `/implementation {feature}` for technical design
```

## Gold Standard References

**Always reference these approved designs:**
1. **Tasks List**: `src/features/tasks/` - List view gold standard
2. **Design Specs**: `.claude/commands/planform.md` - Exact dimensions
3. **Design Principles**: `context/design-principles.md` - System rules
4. **Components**: `src/components/ui/` - Shadcn/ui base

## Example Usage

```bash
/design-concept client-portal
/design-concept invoice-management
/design-concept calendar-view
/design-concept reporting-dashboard
```

## Integration with Workflow

### Before /design-concept
- `/research {topic}` - Enterprise patterns
- `/discover {topic}` - Existing code analysis

### After /design-concept
- `/plan {topic}` - Requirements with design context
- `/implementation {topic}` - Technical architecture
- `/complete-phase` - Implementation
