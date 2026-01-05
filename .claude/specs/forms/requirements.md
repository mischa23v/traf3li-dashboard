# List Page Pattern - Requirements

## Scale Assessment
**Type**: [x] Enterprise
**Estimated Files**: ~70 list pages to upgrade
**Risk Level**: Medium (existing pages need incremental updates)

## Problem Statement
The Tasks List page has evolved into a gold-standard list page with comprehensive features including adaptive search, smart filters, selection mode with bulk actions, and a powerful Quick Actions sidebar. These patterns need to be documented and applied consistently across all ~70 list pages in the application.

## Target Users
- Primary: All dashboard users managing data lists (Tasks, Cases, HR, Finance, etc.)
- Secondary: Developers implementing new list pages

---

## Complete Tasks List Page Feature Analysis

### 1. SEARCH FUNCTIONALITY

#### 1.1 Adaptive Debounce Search (Gold Standard Pattern)
**Location**: `tasks-list-view.tsx:153-164`

```typescript
const { debouncedCallback: debouncedSetSearch, recordKeypress } = useAdaptiveSearchDebounce(
    (value: string) => {
        // Only search if empty (clear) or has at least 2 characters
        if (value === '' || value.trim().length >= 2) {
            setSearchQuery(value)
        }
    }
)
```

**Rules**:
| Rule | Implementation | Reason |
|------|----------------|--------|
| Minimum 2 characters | `value.trim().length >= 2` | Prevents overly broad searches |
| Empty allowed | `value === ''` | Allows clearing the filter |
| Adaptive delay | Based on typing speed | Fast typers get longer wait |
| Network-aware | Adjusts for slow connections | Better UX on poor networks |
| Loading indicator | Shows spinner while fetching | Visual feedback |

**UI Implementation**:
```tsx
<GosiInput
    type="text"
    placeholder={t('tasks.list.searchPlaceholder')}
    defaultValue={searchQuery}
    onKeyDown={recordKeypress}  // Tracks typing speed
    onChange={(e) => debouncedSetSearch(e.target.value)}
    className="pe-12 h-14 w-full text-base"
/>
{/* Loading indicator when searching */}
{isFetching && searchQuery && (
    <div className="absolute start-4 top-1/2 -translate-y-1/2">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
)}
```

---

### 2. FILTERS SYSTEM

#### 2.1 Filter Bar Structure
**Location**: `tasks-list-view.tsx:685-862`

**Filter Container Pattern**:
```tsx
<GosiCard className="p-4 md:p-6 rounded-[2rem]">
    <div className="space-y-4">
        {/* Top Row: Search + Filter Toggle */}
        <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Input */}
            {/* Filter Toggle Button */}
        </div>

        {/* Collapsible Filters - Animated */}
        <div className={`flex-wrap gap-4 transition-all duration-300 ease-in-out overflow-hidden ${
            showFilters ? 'flex opacity-100 max-h-[500px] mt-4' : 'hidden opacity-0 max-h-0'
        }`}>
            {/* Filter Dropdowns */}
        </div>
    </div>
</GosiCard>
```

#### 2.2 Available Filters
| Filter | API Parameter | Options | UI Component |
|--------|---------------|---------|--------------|
| **Status** | `status` | all, active, completed, archived | GosiSelect |
| **Priority** | `priority` | all, critical, high, medium, low, none | GosiSelect |
| **Assigned To** | `assignedTo` | all, me, unassigned, [team members] | GosiSelect |
| **Due Date** | `dueDateFrom/dueDateTo/overdue` | all, today, thisWeek, thisMonth, overdue, noDueDate | GosiSelect |
| **Case** | `caseId` | all, [cases list] | GosiSelect |
| **Sort By** | `sortBy/sortOrder` | dueDate, createdAt, priority | GosiSelect |

#### 2.3 Filter Toggle Button Pattern
```tsx
<GosiButton
    variant={showFilters || hasActiveFilters ? "default" : "outline"}
    onClick={() => setShowFilters(!showFilters)}
    className={`h-14 w-full sm:w-auto px-6 whitespace-nowrap transition-all ${
        showFilters || hasActiveFilters ? 'bg-navy text-white border-navy' : ''
    }`}
>
    <Filter className="h-5 w-5 ms-2" />
    {t('tasks.list.filters', 'تصفية')}
    {hasActiveFilters && (
        <span className="ms-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">
            !
        </span>
    )}
</GosiButton>
```

#### 2.4 Clear Filters Pattern
```tsx
{hasActiveFilters && (
    <GosiButton
        variant="ghost"
        onClick={clearFilters}
        className="h-14 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-dashed border-red-200 px-6"
    >
        <X className="h-5 w-5 ms-2" />
        {t('tasks.list.clearFilters')}
    </GosiButton>
)}
```

#### 2.5 Filter State Management
```typescript
// Filter states
const [searchQuery, setSearchQuery] = useState('')
const [priorityFilter, setPriorityFilter] = useState<string>('all')
const [assignedFilter, setAssignedFilter] = useState<string>('all')
const [dueDateFilter, setDueDateFilter] = useState<string>('all')
const [caseFilter, setCaseFilter] = useState<string>('all')
const [sortBy, setSortBy] = useState<string>('dueDate')

// Check if any filter is active
const hasActiveFilters = useMemo(() =>
    searchQuery || priorityFilter !== 'all' || assignedFilter !== 'all' ||
    dueDateFilter !== 'all' || caseFilter !== 'all',
    [searchQuery, priorityFilter, assignedFilter, dueDateFilter, caseFilter]
)

// Reset visible count when filters change
useEffect(() => {
    setVisibleCount(10)
}, [activeStatusTab, searchQuery, priorityFilter, assignedFilter, dueDateFilter, caseFilter, sortBy])
```

---

### 3. TASK CARDS

#### 3.1 Card Structure
**Location**: `tasks-list-view.tsx:1032-1381`

```
┌────────────────────────────────────────────────────────────────┐
│ [Priority Strip]                                               │
│   [Selection Checkbox] [Icon] [Title] [Status Badges] [Tags]   │
│                        [Client] [Assignee]                     │
│                                              [Checkbox][Menu]  │
│ ─────────────────────────────────────────────────────────────  │
│   [Priority Chip] [Due Date] [Subtask Progress] [View Button]  │
└────────────────────────────────────────────────────────────────┘
```

#### 3.2 Priority Strip (Left Edge Color)
```tsx
<div className={`absolute start-0 top-0 bottom-0 w-1.5 rounded-s-2xl transition-all duration-300 ${
    task.priority === 'critical' ? 'bg-red-500' :
    task.priority === 'high' ? 'bg-orange-500' :
    task.priority === 'medium' ? 'bg-amber-400' :
    task.priority === 'low' ? 'bg-emerald-400' :
    'bg-gray-300'
}`} />
```

#### 3.3 Status Badges
| Badge | Condition | Style |
|-------|-----------|-------|
| Overdue | `timeline.status === 'overdue'` | `bg-red-100 text-red-700 border-red-200` |
| At Risk | `timeline.status === 'at-risk'` | `bg-amber-100 text-amber-700 border-amber-200` |
| In Progress | `status === 'in_progress'` | `bg-blue-50 text-blue-700 border-blue-200` |
| Completed | `status === 'done'` | `bg-emerald-100 text-emerald-700 border-emerald-200` |
| Archived | `isArchived === true` | `bg-slate-100 text-slate-600 border-slate-300` |
| Linked Event | `linkedEventId \|\| eventId` | `bg-purple-50 text-purple-700 border-purple-200` |

#### 3.4 Selection Checkbox (Selection Mode)
```tsx
{isSelectionMode && (
    <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
        <Checkbox
            checked={selectedTaskIds.includes(task.id)}
            onCheckedChange={() => handleSelectTask(task.id)}
            className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-navy data-[state=checked]:border-navy"
        />
    </div>
)}
```

#### 3.5 Complete Task Checkbox (Next to 3-dots)
```tsx
<div onClick={(e) => e.stopPropagation()} className="hidden md:flex items-center">
    <Checkbox
        checked={task.status === 'done'}
        onCheckedChange={(checked) => {
            if (checked) handleCompleteTask(task.id)
            else handleReopenTask(task.id)
        }}
        className="h-5 w-5 rounded-md border-2 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 hover:border-emerald-400 me-2"
    />
</div>
```

#### 3.6 Three-Dots Menu (DropdownMenu)
**Location**: `tasks-list-view.tsx:1252-1307`

| Menu Item | Icon | Action | Condition |
|-----------|------|--------|-----------|
| Edit | `Edit3` (blue) | Navigate to edit page | Always |
| View Details | `Eye` | Navigate to detail page | Always |
| Clone | `Copy` (purple) | Clone task | Always |
| --- | Separator | --- | --- |
| Complete | `CheckCircle` (emerald) | Mark as done | `status !== 'done'` |
| Reopen | `XCircle` (amber) | Reopen task | `status === 'done'` |
| --- | Separator | --- | --- |
| Archive | `Archive` (slate) | Archive task | `!isArchived` |
| Unarchive | `ArchiveRestore` (slate) | Unarchive task | `isArchived` |
| --- | Separator | --- | --- |
| Delete | `Trash2` (red) | Delete with confirm | Always |

**Menu Structure**:
```tsx
<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy hover:bg-slate-100 rounded-xl">
            <MoreHorizontal className="h-6 w-6" />
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-0 ring-1 ring-black/5">
        <DropdownMenuItem onClick={() => handleEditTask(task.id)} className="rounded-lg py-2.5 cursor-pointer">
            <Edit3 className="h-4 w-4 ms-2 text-blue-500" />
            {t('tasks.list.editTask')}
        </DropdownMenuItem>
        {/* ... more items */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
            onClick={() => handleDeleteTask(task.id)}
            className="text-red-600 focus:text-red-600 rounded-lg py-2.5 cursor-pointer bg-red-50/50 hover:bg-red-50"
        >
            <Trash2 className="h-4 w-4 ms-2" />
            {t('tasks.list.deleteTask')}
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
```

#### 3.7 Card Footer
**Inline Priority Selector**:
```tsx
<GosiSelect value={task.priority} onValueChange={(value) => handlePriorityChange(task.id, value)}>
    <GosiSelectTrigger className={`w-auto min-w-[80px] h-6 text-[10px] font-bold rounded-md border-0 px-2 ${
        task.priority === 'critical' ? 'bg-red-50 text-red-700' :
        task.priority === 'high' ? 'bg-orange-50 text-orange-700' :
        task.priority === 'medium' ? 'bg-amber-50 text-amber-700' :
        task.priority === 'low' ? 'bg-emerald-50 text-emerald-700' :
        'bg-gray-50 text-gray-600'
    }`}>
        <GosiSelectValue />
    </GosiSelectTrigger>
    <GosiSelectContent>
        {/* Priority options */}
    </GosiSelectContent>
</GosiSelect>
```

**Smart Due Date Display**:
```tsx
<div className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md font-bold ${
    task.smartDate.isOverdue ? 'bg-red-100 text-red-700' :
    task.smartDate.daysRemaining !== null && task.smartDate.daysRemaining <= 2 ? 'bg-amber-100 text-amber-700' :
    'bg-slate-100 text-slate-600'
}`}>
    {task.smartDate.isOverdue ? <AlertTriangle className="w-3 h-3" /> :
     task.smartDate.daysRemaining <= 2 ? <Clock className="w-3 h-3" /> :
     <Calendar className="w-3 h-3" />}
    <span>{task.smartDate.label}</span>
</div>
```

---

### 4. QUICK ACTIONS SIDEBAR

#### 4.1 Sidebar Structure
**Location**: `tasks-sidebar.tsx`

```
┌─────────────────────────────────┐
│ QUICK ACTIONS WIDGET            │
│ ┌─────────────────────────────┐ │
│ │ [أساسي] [جماعي (count)]     │ │ ← Toggle Tabs
│ └─────────────────────────────┘ │
│ ┌─────────┬─────────┐          │
│ │ إنشاء   │ تحديد   │          │ ← Main Tab
│ │   (N)   │   (S)   │          │
│ ├─────────┼─────────┤          │
│ │  حذف    │ أرشفة   │          │
│ │   (D)   │   (A)   │          │
│ └─────────┴─────────┘          │
│                                 │
│ ┌─────────┬─────────┐          │
│ │تحديد الكل│ إكمال   │          │ ← Bulk Tab
│ │   (L)   │   (C)   │          │
│ ├─────────┼─────────┤          │
│ │  حذف    │ أرشفة   │          │
│ │   (D)   │   (A)   │          │
│ └─────────┴─────────┘          │
├─────────────────────────────────┤
│ CALENDAR/NOTIFICATIONS WIDGET   │
│ ┌─────────────────────────────┐ │
│ │ [التقويم] [التنبيهات]       │ │
│ └─────────────────────────────┘ │
│ [Calendar Strip - 5 days]       │
│ [Events for selected date]      │
└─────────────────────────────────┘
```

#### 4.2 Tab Toggle Pattern
```tsx
<div className="flex bg-[#033a2d] p-1 rounded-xl">
    <button
        onClick={() => setQuickActionsTab('main')}
        className={cn(
            "px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200",
            quickActionsTab === 'main'
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "text-emerald-200 hover:text-white hover:bg-emerald-500/10"
        )}
    >
        أساسي
    </button>
    <button
        onClick={() => setQuickActionsTab('bulk')}
        className={cn(
            "px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 flex items-center gap-2",
            quickActionsTab === 'bulk'
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "text-emerald-200 hover:text-white hover:bg-emerald-500/10"
        )}
    >
        جماعي
        {selectedCount > 0 && (
            <span className={cn(
                "min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center",
                quickActionsTab === 'bulk'
                    ? "bg-white text-emerald-600"
                    : "bg-emerald-500 text-white"
            )}>
                {selectedCount}
            </span>
        )}
    </button>
</div>
```

#### 4.3 Main Tab Actions
| Button | Shortcut | Icon | Action | Disabled When |
|--------|----------|------|--------|---------------|
| إنشاء (Create) | N | Plus | Navigate to create page | Never |
| تحديد (Select) | S | CheckSquare/X | Toggle selection mode | Never |
| حذف (Delete) | D | Trash2 | Delete selected | Not in selection mode OR no selection |
| أرشفة (Archive) | A | Archive | Archive selected | Not in selection mode OR no selection |
| إلغاء أرشفة (Unarchive) | A | ArchiveRestore | Unarchive selected | Not in selection mode OR no selection (only in archived view) |

#### 4.4 Bulk Tab Actions
| Button | Shortcut | Icon | Action | Disabled When |
|--------|----------|------|--------|---------------|
| تحديد الكل (Select All) | L | CheckCheck | Select/deselect all | Not in selection mode OR no items |
| إكمال (Complete) | C | CheckCircle | Complete selected | Not in selection mode OR no selection |
| حذف (Delete) | D | Trash2 | Delete selected | Not in selection mode OR no selection |
| أرشفة (Archive) | A | Archive | Archive selected | Not in selection mode OR no selection |

#### 4.5 Keyboard Shortcuts Implementation
**Location**: `tasks-sidebar.tsx:122-204`

```typescript
useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Skip if user is typing in an input
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return
        }

        switch (e.key.toLowerCase()) {
            case 'n':
                e.preventDefault()
                navigate({ to: currentLinks.create })
                break
            case 's':
                e.preventDefault()
                onToggleSelectionMode?.()
                break
            case 'd':
                e.preventDefault()
                if (isSelectionMode && selectedCount > 0) {
                    onDeleteSelected?.()
                }
                break
            case 'a':
                e.preventDefault()
                if (isSelectionMode && selectedCount > 0) {
                    if (isViewingArchived) {
                        onBulkUnarchive?.()
                    } else {
                        onBulkArchive?.()
                    }
                }
                break
            case 'c':
                e.preventDefault()
                if (isSelectionMode && selectedCount > 0) {
                    onBulkComplete?.()
                }
                break
            case 'l':
                e.preventDefault()
                if (isSelectionMode && totalTaskCount > 0) {
                    onSelectAll?.()
                }
                break
            case 'v':
                e.preventDefault()
                navigate({ to: currentLinks.viewAll })
                break
        }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
}, [/* dependencies */])
```

#### 4.6 Button with Disabled Tooltip Pattern
```tsx
<button
    className="bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] shadow-lg"
    onClick={onDeleteSelected}
    disabled={!isSelectionMode || selectedCount === 0}
    title={!isSelectionMode ? 'اضغط على "تحديد" أولاً' : selectedCount === 0 ? 'حدد مهام أولاً' : undefined}
>
    <Trash2 className="h-6 w-6" />
    <span className="flex items-center gap-1.5 text-sm font-bold">
        <kbd className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">D</kbd>
        {selectedCount > 0 ? `حذف (${selectedCount})` : 'حذف'}
    </span>
</button>
```

#### 4.7 Sidebar Props Interface
```typescript
interface TasksSidebarProps {
    context?: 'tasks' | 'reminders' | 'events' | 'reports'
    isSelectionMode?: boolean
    onToggleSelectionMode?: () => void
    selectedCount?: number
    onDeleteSelected?: () => void
    // Bulk action props
    onBulkComplete?: () => void
    onBulkArchive?: () => void
    onBulkUnarchive?: () => void
    onSelectAll?: () => void
    totalTaskCount?: number
    isBulkCompletePending?: boolean
    isBulkArchivePending?: boolean
    isBulkUnarchivePending?: boolean
    isViewingArchived?: boolean
    // Task details specific props
    taskId?: string
    isTaskCompleted?: boolean
    onCompleteTask?: () => void
    onDeleteTask?: () => void
    isCompletePending?: boolean
    isDeletePending?: boolean
}
```

---

### 5. LOAD MORE PAGINATION

**Location**: `tasks-list-view.tsx:1384-1410`

```tsx
const [visibleCount, setVisibleCount] = useState(10)
const visibleTasks = useMemo(() => tasks.slice(0, visibleCount), [tasks, visibleCount])
const hasMoreTasks = tasks.length > visibleCount
const handleLoadMore = useCallback(() => setVisibleCount(prev => prev + 10), [])

{/* Load More Button */}
{hasMoreTasks && (
    <GosiButton
        onClick={handleLoadMore}
        variant="outline"
        className="w-full max-w-sm h-12 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-600 font-bold"
    >
        <Plus className="w-5 h-5 ms-2" />
        {t('tasks.list.showMore', 'عرض المزيد')}
        <span className="text-xs text-slate-400 ms-2">
            ({visibleCount} / {tasks.length})
        </span>
    </GosiButton>
)}
```

---

### 6. LOADING & ERROR STATES

#### 6.1 Loading Skeleton
```tsx
{isLoading && (
    <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
            <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
            >
                {/* Skeleton structure */}
            </div>
        ))}
    </div>
)}
```

#### 6.2 Error State
```tsx
{isError && (
    <div className="bg-red-50 rounded-[2rem] p-12 text-center border border-red-100">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <h3>{t('error.title')}</h3>
        <p>{error?.message}</p>
        <Button onClick={() => refetch()}>
            {t('common.retry')}
        </Button>
    </div>
)}
```

#### 6.3 Empty State
```tsx
{!isLoading && !isError && tasks.length === 0 && (
    <div className="bg-white rounded-[2rem] p-12 border border-slate-100 text-center">
        <Briefcase className="w-8 h-8 text-emerald-500" />
        <h3>{t('tasks.list.noTasks')}</h3>
        <p>{t('tasks.list.noTasksDescription')}</p>
        <GosiButton asChild>
            <Link to={ROUTES.dashboard.tasks.new}>
                <Plus className="w-4 h-4 ms-2" />
                {t('tasks.list.newTask')}
            </Link>
        </GosiButton>
    </div>
)}
```

---

### 7. SELECTION MODE STATE MANAGEMENT

```typescript
// Selection state
const [isSelectionMode, setIsSelectionMode] = useState(false)
const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

// Selection handlers
const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedTaskIds([]) // Clear selection when toggling
}, [isSelectionMode])

const handleSelectTask = useCallback((taskId: string) => {
    if (selectedTaskIds.includes(taskId)) {
        setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId))
    } else {
        setSelectedTaskIds([...selectedTaskIds, taskId])
    }
}, [selectedTaskIds])

const handleSelectAll = useCallback(() => {
    if (!tasks) return
    // Toggle: if all selected, deselect all; otherwise select all
    if (selectedTaskIds.length === tasks.length && tasks.length > 0) {
        setSelectedTaskIds([])
    } else {
        setSelectedTaskIds(tasks.map(t => t.id))
    }
}, [tasks, selectedTaskIds])
```

---

### 8. API FILTER MAPPING

**Location**: `tasks-list-view.tsx:250-329`

```typescript
const filters = useMemo(() => {
    const f: any = {}

    // Status filter
    if (activeStatusTab === 'active') {
        f.status = ['backlog', 'todo', 'in_progress']
        f.isArchived = false
    } else if (activeStatusTab === 'completed') {
        f.status = 'done'
        f.isArchived = false
    } else if (activeStatusTab === 'archived') {
        f.isArchived = true
    } else if (activeStatusTab === 'all') {
        f.isArchived = false
    }

    // Search (min 2 chars)
    if (searchQuery.trim()) {
        f.search = searchQuery.trim()
    }

    // Priority
    if (priorityFilter !== 'all') {
        f.priority = priorityFilter
    }

    // Assigned To
    if (assignedFilter === 'me') {
        f.assignedTo = 'me'
    } else if (assignedFilter === 'unassigned') {
        f.assignedTo = 'unassigned'
    } else if (assignedFilter !== 'all') {
        f.assignedTo = assignedFilter
    }

    // Case
    if (caseFilter !== 'all') {
        f.caseId = caseFilter
    }

    // Due Date ranges
    if (dueDateFilter === 'today') {
        const today = new Date()
        f.dueDateFrom = today.toISOString().split('T')[0]
        f.dueDateTo = today.toISOString().split('T')[0]
    } else if (dueDateFilter === 'overdue') {
        f.overdue = true
    }
    // ... etc

    // Sort
    if (sortBy === 'dueDate') {
        f.sortBy = 'dueDate'
        f.sortOrder = 'asc'
    }
    // ... etc

    return f
}, [/* dependencies */])
```

---

## Implementation Checklist for New List Pages

### Required Features
- [ ] Adaptive search with debounce (useAdaptiveSearchDebounce hook)
- [ ] Search minimum 2 characters rule
- [ ] Collapsible filter bar with toggle button
- [ ] Clear filters button when filters active
- [ ] Status filter (all, active, completed, archived)
- [ ] Priority filter (if applicable)
- [ ] Date range filter (if applicable)
- [ ] Sort by dropdown
- [ ] Card-based list items with priority strip
- [ ] Three-dots action menu per item
- [ ] Quick complete checkbox (if applicable)
- [ ] Selection mode with checkboxes
- [ ] Quick Actions sidebar with Main/Bulk tabs
- [ ] Keyboard shortcuts (N, S, D, A, C, L, V)
- [ ] Selection count badge on Bulk tab
- [ ] Disabled button tooltips
- [ ] Load more pagination (10 at a time)
- [ ] Loading skeleton
- [ ] Error state with retry
- [ ] Empty state with create action
- [ ] RTL/LTR support

### API Requirements
- [ ] List endpoint with filters support
- [ ] Bulk delete endpoint (`/api/{resource}/bulk`)
- [ ] Bulk complete endpoint (`/api/{resource}/bulk/complete`)
- [ ] Bulk archive endpoint (`/api/{resource}/bulk/archive`)
- [ ] Bulk unarchive endpoint (`/api/{resource}/bulk/unarchive`)

---

## List Pages to Upgrade (~70 pages)

### Priority 1 (Core Features)
1. `cases-list-view.tsx`
2. `clients-list-view.tsx` (if exists)
3. `leads-list-view.tsx`
4. `employees-list-view.tsx`

### Priority 2 (Finance & Sales)
5. `invoices-list-view.tsx`
6. `payments-list-view.tsx`
7. `sales-reports-list-view.tsx`
8. `finance-reports-list-view.tsx`

### Priority 3 (HR)
9-25. All HR list views

### Priority 4 (Operations)
26-45. Inventory, Manufacturing, Quality, etc.

### Priority 5 (Support & CRM)
46-70. Support, CRM, etc.

---

## Open Questions
- [ ] Should all list pages have the Calendar/Notifications widget in sidebar, or just Tasks?
- [ ] Which pages need bulk complete vs just bulk delete/archive?
- [ ] Should we create a shared ListPageSidebar component or keep TasksSidebar flexible with context prop?

## Dependencies
- **Existing**: `useAdaptiveSearchDebounce` hook, GosiCard/GosiSelect/GosiButton components, TasksSidebar component
- **New**: May need generic `ListPageSidebar` component for reuse

---

**Approve these requirements? (yes/no)**
