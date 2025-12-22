# Kanban Components

Odoo-style Kanban workflow view components with drag-and-drop support.

## Components

### KanbanBoard
Main board component that manages drag-and-drop and column layout.

**Features:**
- Drag and drop between columns using @dnd-kit
- Optimistic updates
- RTL support
- Responsive layout

**Props:**
```typescript
interface KanbanBoardProps {
  stages: KanbanStage[]
  cards: KanbanCard[]
  onCardMove: (cardId: string, newStageId: string, newOrder?: number) => void
  onCardClick?: (card: KanbanCard) => void
  onQuickCreate?: (stageId: string, title: string) => void
  className?: string
  isLoading?: boolean
}
```

### KanbanColumn
Column component representing a workflow stage.

**Features:**
- Column header with stage name and count
- Virtualized card list for performance
- Quick create inline form
- Column collapse/expand
- Progress indicator

### KanbanCard
Individual card component representing a case/task.

**Features:**
- Title and description
- Assignee avatar with fallback
- Priority indicator with color coding
- Due date badge with status (overdue, today, tomorrow)
- Tags display
- Quick actions menu (view, edit, delete)
- Drag handle
- Claim amount display

### KanbanQuickCreate
Inline form for quick card creation.

**Features:**
- Auto-focus input
- Enter to submit, Escape to cancel
- RTL support

## Usage

```tsx
import { KanbanBoard } from '@/components/kanban'
import { useKanban } from '@/hooks/useKanban'

function MyKanbanView() {
  const {
    stages,
    cards,
    handleCardMove,
    handleQuickCreate,
  } = useKanban({
    category: 'labor'
  })

  return (
    <KanbanBoard
      stages={stages}
      cards={cards}
      onCardMove={handleCardMove}
      onQuickCreate={handleQuickCreate}
    />
  )
}
```

## Hook

### useKanban
Custom hook for managing kanban data and operations.

**Features:**
- Fetch cases and transform to kanban cards
- Handle drag and drop with optimistic updates
- Quick card creation
- Real-time sync (future enhancement via WebSocket)

**Options:**
```typescript
interface UseKanbanOptions {
  category?: string  // Filter by case category
  stages?: KanbanStage[]  // Custom stages (optional)
}
```

**Returns:**
```typescript
{
  stages: KanbanStage[]
  cards: KanbanCard[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
  handleCardMove: (cardId: string, newStageId: string, newOrder?: number) => void
  handleQuickCreate: (stageId: string, title: string) => void
}
```

## Stages

Default workflow stages for cases:
1. **New** - Newly created cases
2. **Consultation** - Initial consultation phase
3. **Filing** - Case filing and documentation
4. **In Progress** - Active hearings and proceedings
5. **Verdict** - Awaiting or reviewing verdict
6. **Closed** - Completed cases

## Integration

The Kanban view is integrated into the Cases feature at:
- Route: `/dashboard/cases/kanban`
- Component: `CasesKanbanView`
- Toggle available in `CasesListView` toolbar

## RTL Support

All components support RTL layout for Arabic:
- Automatic direction based on `i18n.language`
- Proper alignment of drag handles and icons
- Text direction in inputs and cards

## Performance

- Virtualized card lists using `react-window` (via ScrollArea)
- Optimistic updates for drag and drop
- Debounced search and filters
- Query caching with TanStack Query

## Accessibility

- Keyboard navigation (Tab, Enter, Escape)
- ARIA labels for icons and actions
- Focus management in quick create form
- Tooltips for icon-only buttons
