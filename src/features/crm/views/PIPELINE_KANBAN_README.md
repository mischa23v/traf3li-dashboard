# Pipeline Kanban View

A comprehensive Kanban board view for managing CRM leads through pipeline stages with drag-and-drop functionality.

## Features Implemented

### 1. Board Layout
- ✅ Horizontal scrollable board
- ✅ One column per pipeline stage
- ✅ Column headers showing:
  - Stage name
  - Lead count badge
  - Total value
  - Weighted value (with tooltip)
- ✅ Collapse/Expand toggle for each column
- ✅ Progress bar in column header

### 2. Lead Card Design
- ✅ Drag handle (GripVertical icon)
- ✅ Lead name (bold)
- ✅ Company name (if available)
- ✅ Expected revenue in SAR (toggleable)
- ✅ Probability badge (toggleable)
- ✅ Assigned user avatar
- ✅ Days in stage indicator (clock icon with tooltip)
- ✅ Color coding by:
  - Deal Health (stale leads highlighted)
  - Age (color by days in stage)
  - Probability (color by win probability)
- ✅ VIP indicator (star icon)
- ✅ Urgent indicator (alert triangle)
- ✅ Practice area badge
- ✅ Contact information (phone, email)
- ✅ Organization/Contact links
- ✅ Lead score
- ✅ Time since created

### 3. Card Quick Actions (Hover Menu)
- ✅ Open detail (navigates to lead detail page)
- ✅ Schedule activity (navigates to activity creation)
- ✅ Move to stage (submenu with all available stages)

### 4. Filters (Top Bar)
- ✅ Pipeline selector (with default selection)
- ✅ Search field (searches by name, email, phone, company)
- ✅ Assigned to filter
- ✅ Team filter
- ✅ Territory filter
- ✅ Clear filters button

### 5. Board Settings Dropdown
- ✅ Toggle: Show/hide value on cards
- ✅ Toggle: Show/hide probability
- ✅ Color by dropdown:
  - Deal Health
  - Age
  - Probability

### 6. Drag and Drop
- ✅ Visual feedback during drag (opacity + ring)
- ✅ Drop zones highlight (emerald background when hovering)
- ✅ Confirm dialog when moving to Won/Lost stages
- ✅ Smooth card movement with @dnd-kit
- ✅ Drag overlay with rotated card preview

### 7. Internationalization
- ✅ Full RTL support
- ✅ Arabic translations for all labels
- ✅ Date formatting with Arabic locale
- ✅ Currency formatting (SAR)

## Usage

```tsx
import { PipelineKanbanView } from '@/features/crm/views'

// In your route component
<Route path="/crm/pipeline/kanban" component={PipelineKanbanView} />
```

## Dependencies

The component uses:
- `@dnd-kit/core` - Core drag-and-drop functionality
- `@dnd-kit/sortable` - Sortable lists
- `@dnd-kit/utilities` - Utility functions for DnD
- `date-fns` - Date formatting and manipulation
- `@tanstack/react-router` - Routing
- `@tanstack/react-query` - Data fetching via hooks

## API Integration

The component integrates with:
- `useLeadsByPipeline(pipelineId)` - Fetches leads grouped by stage
- `usePipelines()` - Fetches all available pipelines
- `useMoveLeadToStage()` - Mutation to move leads between stages

## Component Structure

```
PipelineKanbanView (Main)
├── Top Bar (Filters & Settings)
│   ├── Pipeline Selector
│   ├── Search Field
│   ├── Filter Dropdowns
│   └── Board Settings Menu
├── DndContext (Drag & Drop Provider)
│   ├── KanbanColumn (foreach stage)
│   │   ├── Column Header
│   │   ├── Value Display
│   │   └── LeadCard (foreach lead)
│   │       ├── Drag Handle
│   │       ├── Lead Info
│   │       ├── Contact Details
│   │       ├── Badges & Indicators
│   │       └── Quick Actions Menu
│   └── DragOverlay (Active card preview)
└── Confirm Dialog (Won/Lost stages)
```

## Customization

### Adding New Filters

To add a new filter, extend the `Filters` interface and add the filter UI in the top bar:

```tsx
interface Filters {
  // ... existing filters
  customFilter: string
}
```

### Changing Card Colors

Modify the `getCardColor()` function in the `LeadCard` component:

```tsx
const getCardColor = () => {
  if (settings.colorBy === 'custom') {
    // Your custom color logic
    return 'border-custom-color'
  }
  // ... existing logic
}
```

### Adding Card Actions

Add new actions to the quick actions dropdown menu:

```tsx
<DropdownMenuItem onClick={() => handleCustomAction(lead._id)}>
  <CustomIcon className="h-4 w-4 me-2" />
  {isRTL ? 'إجراء مخصص' : 'Custom Action'}
</DropdownMenuItem>
```

## Performance Optimizations

- ✅ Components memoized with `React.memo()`
- ✅ Callbacks wrapped with `useCallback()`
- ✅ Computed values cached with `useMemo()`
- ✅ ScrollArea for virtualized scrolling
- ✅ Efficient drag detection with activation constraints

## Accessibility

- ✅ Proper ARIA labels
- ✅ Keyboard navigation support (via @dnd-kit)
- ✅ Tooltips for icon-only actions
- ✅ Focus management during drag operations
- ✅ Screen reader compatible

## Future Enhancements

Potential improvements:
- [ ] Bulk actions (select multiple leads)
- [ ] Inline editing of lead details
- [ ] Custom field configuration
- [ ] Save custom views/filters
- [ ] Export to CSV/PDF
- [ ] Activity timeline on cards
- [ ] Attachments preview
- [ ] Email/Call quick actions
- [ ] Lead assignment from board
- [ ] Stage-specific validations
