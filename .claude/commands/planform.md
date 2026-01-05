---
name: planform
description: Create list page design specs based on Tasks List gold standard (dimensions, spacing, colors, components)
---

# List Page Design System - Gold Standard Pattern

This document contains the complete design specifications from the Tasks List page. Use these exact dimensions, colors, and component patterns when creating or updating any list page.

---

## PAGE LAYOUT

### Main Container
```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER (navy bg)                                                    │
├─────────────────────────────────────────────────────────────────────┤
│ MAIN (bg-[#f8f9fa], rounded-tr-3xl, p-6 lg:p-8)                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ HERO CARD (ProductivityHero)                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────┬───────────────────────────────┐  │
│  │ LEFT: Content (lg:col-span-2)│ RIGHT: Sidebar (lg:col-span-1)│  │
│  │  ┌─────────────────────────┐ │  ┌─────────────────────────┐  │  │
│  │  │ FILTER CARD             │ │  │ QUICK ACTIONS WIDGET    │  │  │
│  │  └─────────────────────────┘ │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐ │  ┌─────────────────────────┐  │  │
│  │  │ AI SUGGESTION (optional)│ │  │ CALENDAR WIDGET         │  │  │
│  │  └─────────────────────────┘ │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐ │                               │  │
│  │  │ LIST ITEMS              │ │                               │  │
│  │  │ (Card 1)                │ │                               │  │
│  │  │ (Card 2)                │ │                               │  │
│  │  │ ...                     │ │                               │  │
│  │  │ [Load More Button]      │ │                               │  │
│  │  └─────────────────────────┘ │                               │  │
│  └─────────────────────────────┴───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Grid Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Content Column */}
    <div className="lg:col-span-2 space-y-6">
        {/* Filters, Cards */}
    </div>

    {/* Sidebar Column */}
    <div className="lg:col-span-1 space-y-8">
        {/* Quick Actions, Calendar */}
    </div>
</div>
```

---

## 1. FILTER CARD

### Container Dimensions
| Property | Value |
|----------|-------|
| Border Radius | `rounded-[2rem]` (32px) |
| Padding | `p-4 md:p-6` |
| Background | `bg-white` (via GosiCard) |

### Search Input
| Property | Value |
|----------|-------|
| Height | `h-14` (56px) |
| Width | `w-full` |
| Border Radius | `rounded-2xl` (via GosiInput) |
| Padding End | `pe-12` (space for icon) |
| Font Size | `text-base` |
| Icon Position | `end-4 top-1/2 -translate-y-1/2` |
| Icon Size | `h-5 w-5` |

```tsx
<div className="relative w-full">
    <Search className="absolute end-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
    <GosiInput
        type="text"
        placeholder={t('searchPlaceholder')}
        className="pe-12 h-14 w-full text-base"
    />
    {/* Loading indicator */}
    {isFetching && searchQuery && (
        <div className="absolute start-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )}
</div>
```

### Filter Toggle Button
| Property | Value |
|----------|-------|
| Height | `h-14` (56px) |
| Width | `w-full sm:w-auto` |
| Padding X | `px-6` |
| Active State | `bg-navy text-white border-navy` |
| Inactive State | `variant="outline"` |

```tsx
<GosiButton
    variant={showFilters || hasActiveFilters ? "default" : "outline"}
    onClick={() => setShowFilters(!showFilters)}
    className={`h-14 w-full sm:w-auto px-6 whitespace-nowrap transition-all ${
        showFilters || hasActiveFilters ? 'bg-navy text-white border-navy' : ''
    }`}
>
    <Filter className="h-5 w-5 ms-2" />
    {t('filters')}
    {hasActiveFilters && (
        <span className="ms-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">!</span>
    )}
</GosiButton>
```

### Filter Dropdown (GosiSelect)
| Property | Value |
|----------|-------|
| Min Width | `min-w-[220px]` (standard) / `min-w-[240px]` (Arabic priority) |
| Height | `h-14` (56px) |
| Background | `bg-white` |
| Border | `border-slate-100` |
| Hover | `hover:bg-slate-50` |
| Focus | `focus:ring-2 focus:ring-emerald-500/20` |
| Label Style | `text-slate-600 font-bold text-xs uppercase tracking-wider` |
| Value Style | `text-xs font-bold text-slate-950` |

```tsx
<div className="flex-1 min-w-[220px]">
    <GosiSelect value={filter} onValueChange={setFilter}>
        <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
            <div className="flex items-center gap-2 truncate">
                <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('label')}:</span>
                <GosiSelectValue />
            </div>
        </GosiSelectTrigger>
        <GosiSelectContent>
            <GosiSelectItem value="all" className="font-bold">{t('all')}</GosiSelectItem>
            {/* ... options */}
        </GosiSelectContent>
    </GosiSelect>
</div>
```

### Filter Container Animation
```tsx
<div className={`flex-wrap gap-4 transition-all duration-300 ease-in-out overflow-hidden ${
    showFilters ? 'flex opacity-100 max-h-[500px] mt-4' : 'hidden opacity-0 max-h-0'
}`}>
    {/* Filter dropdowns */}
</div>
```

### Clear Filters Button
| Property | Value |
|----------|-------|
| Height | `h-14` |
| Style | `text-red-500 hover:text-red-600 hover:bg-red-50` |
| Border | `border border-dashed border-red-200` |
| Radius | `rounded-2xl` |
| Padding | `px-6` |

```tsx
<GosiButton
    variant="ghost"
    onClick={clearFilters}
    className="h-14 w-full md:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-dashed border-red-200 px-6 hover:shadow-lg hover:shadow-red-500/10 transition-all"
>
    <X className="h-5 w-5 ms-2" />
    {t('clearFilters')}
</GosiButton>
```

---

## 2. LIST ITEM CARD

### Card Container
| Property | Value |
|----------|-------|
| Border Radius | `rounded-2xl` (16px) |
| Padding | `p-3 md:p-4` |
| Background | `bg-white` |
| Border | `ring-1 ring-black/[0.03]` |
| Shadow | `shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]` |
| Hover Shadow | `hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)]` |
| Hover Transform | `hover:-translate-y-1` |
| Animation | `animate-in fade-in slide-in-from-bottom-4 duration-500` |
| Animation Delay | `style={{ animationDelay: \`${index * 50}ms\` }}` |

```tsx
<div
    onClick={() => navigate({ to: ROUTES.detail(id) })}
    style={{ animationDelay: `${index * 50}ms` }}
    className={`
        animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards
        rounded-2xl p-3 md:p-4
        border-0 ring-1 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]
        transition-all duration-300 group
        hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-1
        cursor-pointer relative overflow-hidden
        ${isOverdue ? 'bg-red-50/50 ring-red-200/50' :
          isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50/20' :
          'bg-white ring-black/[0.03]'}
    `}
>
```

### Priority Strip (Left Edge)
| Property | Value |
|----------|-------|
| Width | `w-1.5` (6px) |
| Position | `absolute start-0 top-0 bottom-0` |
| Border Radius | `rounded-s-2xl` |

| Priority | Color |
|----------|-------|
| Critical | `bg-red-500` |
| High | `bg-orange-500` |
| Medium | `bg-amber-400` |
| Low | `bg-emerald-400` |
| None | `bg-gray-300` |

```tsx
<div className={`absolute start-0 top-0 bottom-0 w-1.5 rounded-s-2xl transition-all duration-300 ${
    priority === 'critical' ? 'bg-red-500' :
    priority === 'high' ? 'bg-orange-500' :
    priority === 'medium' ? 'bg-amber-400' :
    priority === 'low' ? 'bg-emerald-400' :
    'bg-gray-300'
}`} />
```

### Icon Container
| Property | Value |
|----------|-------|
| Size | `w-10 h-10` (40px) |
| Border Radius | `rounded-xl` |
| Border | `border` |

| State | Background | Text | Border |
|-------|------------|------|--------|
| Overdue | `bg-red-50` | `text-red-600` | `border-red-200` |
| At Risk | `bg-amber-50` | `text-amber-600` | `border-amber-200` |
| Completed | `bg-emerald-50` | `text-emerald-600` | `border-emerald-200` |
| Default | `bg-slate-50` | `text-slate-500` | `border-slate-100` |
| Default Hover | `group-hover:bg-emerald-50` | `group-hover:text-emerald-600` | - |

### Selection Checkbox
| Property | Value |
|----------|-------|
| Size | `h-5 w-5` |
| Border Radius | `rounded-md` |
| Border | `border-slate-300` |
| Checked BG | `data-[state=checked]:bg-navy` |
| Checked Border | `data-[state=checked]:border-navy` |

### Complete Checkbox (Quick Complete)
| Property | Value |
|----------|-------|
| Size | `h-5 w-5` |
| Border | `border-2 border-slate-300` |
| Checked BG | `data-[state=checked]:bg-emerald-500` |
| Checked Border | `data-[state=checked]:border-emerald-500` |
| Hover | `hover:border-emerald-400` |
| Margin | `me-2` |

### Title Text
| Property | Value |
|----------|-------|
| Font Weight | `font-bold` |
| Font Size | `text-sm md:text-base` |
| Default Color | `text-slate-900` |
| Completed | `text-slate-400 line-through` |
| Hover | `group-hover:text-emerald-900` |

### Status Badges
| Property | Value |
|----------|-------|
| Padding | `px-2 py-0.5` |
| Font Size | `text-[10px]` |
| Font Weight | `font-bold` |
| Border Radius | `rounded-full` |
| Dot Size | `w-1.5 h-1.5 rounded-full` |

| Badge | Background | Text | Border | Dot |
|-------|------------|------|--------|-----|
| Overdue | `bg-red-100` | `text-red-700` | `border-red-200` | `bg-red-500 animate-pulse` |
| At Risk | `bg-amber-100` | `text-amber-700` | `border-amber-200` | `bg-amber-500` |
| In Progress | `bg-blue-50` | `text-blue-700` | `border-blue-200` | `bg-blue-500 animate-pulse` |
| Completed | `bg-emerald-100` | `text-emerald-700` | `border-emerald-200` | - |
| Archived | `bg-slate-100` | `text-slate-600` | `border-slate-300` | - |
| Linked Event | `bg-purple-50` | `text-purple-700` | `border-purple-200` | - |

### Tag Chips
| Property | Value |
|----------|-------|
| Background | `bg-indigo-50` |
| Text | `text-indigo-600` |
| Border | `border-indigo-200` |
| Radius | `rounded-full` |
| Padding | `px-2 py-0.5` |
| Font Size | `text-[10px]` |
| Max Display | 2 tags, then `+N` overflow |

### Meta Text (Client, Assignee)
| Property | Value |
|----------|-------|
| Font Size | `text-xs` |
| Color | `text-slate-500` |
| Prefix | `text-slate-400` for @ symbol |
| Separator | `text-slate-300` for bullet |
| Avatar Size | `w-4 h-4 rounded-full` |

### Card Footer
| Property | Value |
|----------|-------|
| Padding | `pt-2 mt-2` |
| Border | `border-t border-slate-100` |
| Padding Start | `ps-4` (for priority strip) |

### Inline Priority Selector
| Property | Value |
|----------|-------|
| Min Width | `min-w-[80px]` |
| Height | `h-6` |
| Font Size | `text-[10px]` |
| Font Weight | `font-bold` |
| Border | `border-0` |
| Radius | `rounded-md` |
| Padding | `px-2` |

| Priority | Background | Text |
|----------|------------|------|
| Critical | `bg-red-50` | `text-red-700` |
| High | `bg-orange-50` | `text-orange-700` |
| Medium | `bg-amber-50` | `text-amber-700` |
| Low | `bg-emerald-50` | `text-emerald-700` |
| None | `bg-gray-50` | `text-gray-600` |

### Smart Due Date Chip
| Property | Value |
|----------|-------|
| Padding | `px-2 py-1` |
| Font Size | `text-[10px]` |
| Font Weight | `font-bold` |
| Border Radius | `rounded-md` |
| Icon Size | `w-3 h-3` |
| Gap | `gap-1.5` |

| State | Background | Text |
|-------|------------|------|
| Overdue | `bg-red-100` | `text-red-700` |
| At Risk (<=2 days) | `bg-amber-100` | `text-amber-700` |
| Normal | `bg-slate-100` | `text-slate-600` |

### Subtask Progress Bar
| Property | Value |
|----------|-------|
| Container Width | `w-12` |
| Height | `h-1.5` |
| Background | `bg-slate-200` |
| Fill | `bg-emerald-500` |
| Border Radius | `rounded-full` |
| Font Size | `text-[10px]` |

### View Details Button (Footer)
| Property | Value |
|----------|-------|
| Size | `size="sm"` |
| Height | `h-6` |
| Padding | `px-3` |
| Font Size | `text-[10px]` |
| Background | `bg-emerald-50` |
| Text | `text-emerald-600` |
| Hover BG | `hover:bg-emerald-500` |
| Hover Text | `hover:text-white` |
| Border | `border-0` |
| Radius | `rounded-md` |

---

## 3. THREE-DOTS MENU (DropdownMenu)

### Trigger Button
| Property | Value |
|----------|-------|
| Variant | `ghost` |
| Size | `icon` |
| Icon Size | `h-6 w-6` |
| Color | `text-slate-400` |
| Hover Color | `hover:text-navy` |
| Hover BG | `hover:bg-slate-100` |
| Radius | `rounded-xl` |

### Menu Content
| Property | Value |
|----------|-------|
| Width | `w-48` |
| Border Radius | `rounded-xl` |
| Shadow | `shadow-xl` |
| Border | `border-0 ring-1 ring-black/5` |
| Align | `align="end"` |

### Menu Item
| Property | Value |
|----------|-------|
| Padding Y | `py-2.5` |
| Border Radius | `rounded-lg` |
| Cursor | `cursor-pointer` |
| Icon Size | `h-4 w-4` |
| Icon Margin | `ms-2` |

| Item Type | Icon | Icon Color |
|-----------|------|------------|
| Edit | `Edit3` | `text-blue-500` |
| View | `Eye` | default |
| Clone | `Copy` | `text-purple-500` |
| Complete | `CheckCircle` | `text-emerald-500` |
| Reopen | `XCircle` | `text-amber-500` |
| Archive | `Archive` | `text-slate-500` |
| Unarchive | `ArchiveRestore` | `text-slate-500` |
| Delete | `Trash2` | inherits red |

### Delete Item Special Style
```tsx
<DropdownMenuItem
    className="text-red-600 focus:text-red-600 rounded-lg py-2.5 cursor-pointer bg-red-50/50 hover:bg-red-50"
>
```

---

## 4. QUICK ACTIONS SIDEBAR

### Widget Container
| Property | Value |
|----------|-------|
| Background | `bg-gradient-to-br from-emerald-900 to-slate-900` |
| Border Radius | `rounded-3xl` |
| Padding | `p-6` |
| Shadow | `shadow-xl shadow-emerald-900/20` |
| Border | `ring-1 ring-white/10` |

### Background Glow Effects
```tsx
<div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -me-32 -mt-32 pointer-events-none"></div>
<div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ms-32 -mb-32 pointer-events-none"></div>
```

### Tab Toggle Container
| Property | Value |
|----------|-------|
| Background | `bg-[#033a2d]` |
| Padding | `p-1` |
| Border Radius | `rounded-xl` |

### Tab Button
| Property | Value |
|----------|-------|
| Padding | `px-4 py-2` |
| Font Size | `text-sm` |
| Font Weight | `font-bold` |
| Border Radius | `rounded-lg` |
| Transition | `transition-all duration-200` |

| State | Background | Text |
|-------|------------|------|
| Active | `bg-emerald-500` | `text-white` |
| Active Shadow | `shadow-lg shadow-emerald-500/20` | - |
| Inactive | transparent | `text-emerald-200` |
| Inactive Hover | `hover:bg-emerald-500/10` | `hover:text-white` |

### Selection Count Badge (on Bulk Tab)
| Property | Value |
|----------|-------|
| Min Width | `min-w-[20px]` |
| Height | `h-5` |
| Padding | `px-1.5` |
| Border Radius | `rounded-full` |
| Font Size | `text-xs` |
| Font Weight | `font-bold` |

| State | Background | Text |
|-------|------------|------|
| Active Tab | `bg-white` | `text-emerald-600` |
| Inactive Tab | `bg-emerald-500` | `text-white` |

### Action Button Grid
| Property | Value |
|----------|-------|
| Layout | `grid grid-cols-2 gap-4` |
| Animation | `animate-in fade-in slide-in-from-bottom-2 duration-300` |

### Action Button
| Property | Value |
|----------|-------|
| Background | `bg-white` |
| Height | `h-auto py-6` |
| Border Radius | `rounded-3xl` |
| Shadow | `shadow-lg` |
| Hover Scale | `hover:scale-[1.02]` |
| Transition | `transition-all duration-300` |
| Disabled | `disabled:opacity-50 disabled:cursor-not-allowed` |
| Layout | `flex flex-col items-center justify-center gap-2` |

| Button Type | Hover BG | Text Color |
|-------------|----------|------------|
| Create | `hover:bg-emerald-50` | `text-emerald-600` |
| Select (active) | - | `bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400` |
| Select (inactive) | `hover:bg-slate-50` | `text-slate-700` |
| Delete | `hover:bg-red-50` | `text-slate-600 hover:text-red-600` |
| Archive | `hover:bg-slate-50` | `text-slate-600` |
| Unarchive | `hover:bg-emerald-50` | `text-emerald-600` |
| Complete | `hover:bg-emerald-50` | `text-emerald-600` |
| Select All (active) | - | `bg-blue-100 text-blue-700 ring-2 ring-blue-400` |
| Select All (inactive) | `hover:bg-blue-50` | `text-blue-600` |

### Button Icon
| Property | Value |
|----------|-------|
| Size | `h-6 w-6` (regular) / `h-7 w-7` (primary) |

### Button Label with Keyboard Shortcut
| Property | Value |
|----------|-------|
| Container | `flex items-center gap-1.5` |
| Label Size | `text-sm` |
| Label Weight | `font-bold` |
| Kbd Size | `text-[10px]` |
| Kbd Font | `font-mono` |
| Kbd Padding | `px-1.5 py-0.5` |
| Kbd Radius | `rounded` |

| Button | Kbd BG | Kbd Text |
|--------|--------|----------|
| Create | `bg-emerald-100` | `text-emerald-600` |
| Select | `bg-slate-100` / `bg-emerald-200` | `text-slate-500` / `text-emerald-700` |
| Delete | `bg-slate-100` | `text-slate-500` |
| Archive | `bg-slate-100` | `text-slate-500` |
| Complete | `bg-emerald-100` | `text-emerald-600` |
| Select All | `bg-blue-100` | `text-blue-600` |

### Disabled Tooltip
```tsx
title={!isSelectionMode ? 'اضغط على "تحديد" أولاً' : selectedCount === 0 ? 'حدد مهام أولاً' : undefined}
```

---

## 5. CALENDAR WIDGET

### Widget Container
| Property | Value |
|----------|-------|
| Background | `bg-[#022c22]` |
| Border Radius | `rounded-3xl` |
| Padding | `p-6` |
| Shadow | `shadow-lg shadow-emerald-900/20` |
| Hover Shadow | `hover:shadow-xl` |

### Inner Content Container
| Property | Value |
|----------|-------|
| Background | `bg-[#f8fafc]` |
| Border Radius | `rounded-2xl` |
| Padding | `p-4` |
| Min Height | `min-h-[300px]` |
| Border | `border border-white/5 shadow-inner` |

### Calendar Strip Day
| Property | Value |
|----------|-------|
| Layout | `grid grid-cols-5 gap-2` |
| Padding | `p-2` |
| Border Radius | `rounded-xl` |

| State | Background | Text |
|-------|------------|------|
| Selected | `bg-[#022c22]` | `text-white` |
| Selected Shadow | `shadow-lg shadow-emerald-900/20 scale-105` | - |
| Unselected | transparent | `text-slate-500` |
| Unselected Hover | `hover:bg-white` | - |

---

## 6. LOAD MORE PAGINATION

### Load More Button
| Property | Value |
|----------|-------|
| Width | `w-full max-w-sm` |
| Height | `h-12` |
| Border Radius | `rounded-2xl` |
| Border | `border-2 border-dashed border-slate-200` |
| Hover Border | `hover:border-emerald-300` |
| Hover BG | `hover:bg-emerald-50/50` |
| Text | `text-slate-600 hover:text-emerald-600` |
| Font Weight | `font-bold` |

```tsx
<GosiButton
    onClick={handleLoadMore}
    variant="outline"
    className="w-full max-w-sm h-12 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-600 font-bold transition-all"
>
    <Plus className="w-5 h-5 ms-2" />
    {t('showMore')}
    <span className="text-xs text-slate-400 ms-2">
        ({visibleCount} / {totalCount})
    </span>
</GosiButton>
```

---

## 7. LOADING SKELETON

### Skeleton Card
| Property | Value |
|----------|-------|
| Background | `bg-white` |
| Border Radius | `rounded-2xl` |
| Padding | `p-4` |
| Border | `border border-slate-100` |
| Animation | `animate-pulse` |
| Stagger Delay | `style={{ animationDelay: \`${i * 100}ms\` }}` |

```tsx
{[1, 2, 3, 4].map((i) => (
    <div
        key={i}
        className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse"
        style={{ animationDelay: `${i * 100}ms` }}
    >
        <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50">
            <Skeleton className="h-6 w-20 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-lg" />
            <div className="flex-1" />
            <Skeleton className="h-6 w-24 rounded-lg" />
        </div>
    </div>
))}
```

---

## 8. ERROR & EMPTY STATES

### Container
| Property | Value |
|----------|-------|
| Border Radius | `rounded-[2rem]` |
| Padding | `p-12` |
| Text Align | `text-center` |

### Error State
| Property | Value |
|----------|-------|
| Background | `bg-red-50` |
| Border | `border border-red-100` |
| Icon Container | `w-16 h-16 rounded-full bg-red-100` |
| Icon | `w-8 h-8 text-red-500` |

### Empty State
| Property | Value |
|----------|-------|
| Background | `bg-white` |
| Border | `border border-slate-100` |
| Icon Container | `w-16 h-16 rounded-full bg-emerald-50` |
| Icon | `w-8 h-8 text-emerald-500` |

---

## 9. KEYBOARD SHORTCUTS

| Key | Action | Condition |
|-----|--------|-----------|
| `N` | Navigate to create page | Always |
| `S` | Toggle selection mode | Always |
| `D` | Delete selected | Selection mode + has selection |
| `A` | Archive/Unarchive selected | Selection mode + has selection |
| `C` | Complete selected | Selection mode + has selection |
| `L` | Select/Deselect all | Selection mode + has items |
| `V` | Navigate to list view | Always |

### Implementation Pattern
```tsx
useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return
        }
        // Handle shortcuts...
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
}, [/* dependencies */])
```

---

## 10. COLOR PALETTE

### Primary Colors
| Name | Value | Usage |
|------|-------|-------|
| Navy | `navy` (custom) | Primary actions, headers |
| Emerald | `emerald-500/600` | Success, active states |

### Status Colors
| Status | Background | Text | Border |
|--------|------------|------|--------|
| Success/Complete | `emerald-50/100` | `emerald-600/700` | `emerald-200` |
| Warning/At Risk | `amber-50/100` | `amber-600/700` | `amber-200` |
| Error/Overdue | `red-50/100` | `red-500/700` | `red-200` |
| Info/In Progress | `blue-50` | `blue-600/700` | `blue-200` |
| Neutral/Archive | `slate-50/100` | `slate-500/600` | `slate-200/300` |
| Special/Event | `purple-50` | `purple-600/700` | `purple-200` |
| Tag | `indigo-50` | `indigo-600` | `indigo-200` |

### Priority Colors
| Priority | Strip | Badge BG | Badge Text |
|----------|-------|----------|------------|
| Critical | `red-500` | `red-50` | `red-700` |
| High | `orange-500` | `orange-50` | `orange-700` |
| Medium | `amber-400` | `amber-50` | `amber-700` |
| Low | `emerald-400` | `emerald-50` | `emerald-700` |
| None | `gray-300` | `gray-50` | `gray-600` |

---

## USAGE INSTRUCTIONS

When creating or updating a list page:

1. **Copy the page layout structure** from section "PAGE LAYOUT"
2. **Use exact dimensions** for all components (h-14 for inputs, rounded-2xl for cards, etc.)
3. **Follow the color system** for status badges and priority indicators
4. **Implement keyboard shortcuts** using the pattern in section 9
5. **Add loading skeletons** with staggered animation delays
6. **Include the Quick Actions sidebar** with appropriate bulk operations
7. **Test RTL** - all `ms-` and `me-` classes support RTL automatically

### Required Imports
```tsx
import { GosiCard, GosiInput, GosiSelect, GosiSelectContent, GosiSelectItem, GosiSelectTrigger, GosiSelectValue, GosiButton } from '@/components/ui/gosi-ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdaptiveSearchDebounce } from '@/hooks/useAdaptiveDebounce'
```

### Files to Reference
- **List View**: `src/features/tasks/components/tasks-list-view.tsx`
- **Sidebar**: `src/features/tasks/components/tasks-sidebar.tsx`
- **Schema**: `src/features/tasks/data/schema.ts`
