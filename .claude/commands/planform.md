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

## 11. HERO CARD (ProductivityHero)

The hero card appears at the top of every list and detail page.

### Container
| Property | Value |
|----------|-------|
| Background | `bg-[#022c22]` |
| Border Radius | `rounded-3xl` |
| Padding | `p-6` |
| Min Height | `min-h-[140px] lg:min-h-[160px] xl:min-h-[180px]` |
| Max Height | `max-h-[180px] lg:max-h-[190px] xl:max-h-[220px]` |
| Shadow | `shadow-xl shadow-emerald-900/20` |
| Position | `relative overflow-hidden` |

### Background Effects
```tsx
{/* Animated Gradient Background */}
<div className="absolute inset-0 z-0">
    <div className="absolute inset-0 opacity-20" style={{
        background: 'linear-gradient(-45deg, #022c22, #064e3b, #022c22, #0f766e)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 20s ease infinite'
    }} />
</div>
{/* Pattern Overlay */}
<div className="absolute inset-0 z-0">
    <img src="/images/hero-wave.png" className="w-full h-full object-cover opacity-25 mix-blend-overlay" />
</div>
{/* Accent Glow */}
<div className="absolute top-0 end-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl -me-32 -mt-32 pointer-events-none" />
```

### Layout Grid
| Property | Value |
|----------|-------|
| Container | `grid grid-cols-1 xl:grid-cols-12 gap-6 items-center` |
| Left Column | `xl:col-span-4 space-y-6` (Title & Actions) |
| Right Column | `xl:col-span-8` (Stats Grid) |
| Stats Grid | `grid grid-cols-2 lg:grid-cols-4 gap-3` |

### Badge
| Property | Value |
|----------|-------|
| Container | `inline-flex items-center gap-2 px-3 py-1 rounded-full` |
| Background | `bg-white/5` |
| Border | `border border-white/10` |
| Text | `text-white text-xs font-medium` |
| Icon | `w-3 h-3` |

### Title
| Property | Value |
|----------|-------|
| Size | `text-2xl lg:text-3xl` |
| Weight | `font-bold` |
| Color | `text-white` |
| Tracking | `tracking-tight` |

### Icon Container (beside title)
| Property | Value |
|----------|-------|
| Padding | `p-2` |
| Background | `bg-white/10` |
| Radius | `rounded-xl` |
| Icon Size | `w-6 h-6` |
| Icon Color | `text-emerald-400 fill-emerald-400/20` |

### Primary Action Button
| Property | Value |
|----------|-------|
| Height | `h-10` |
| Padding | `px-5` |
| Background | `bg-emerald-500 hover:bg-emerald-600` |
| Text | `text-white text-sm font-bold` |
| Radius | `rounded-xl` |
| Shadow | `shadow-lg shadow-emerald-500/20` |
| Border | `border-0` |

### Secondary Action Button
| Property | Value |
|----------|-------|
| Height | `h-10` |
| Padding | `px-5` |
| Background | `bg-transparent hover:bg-white/10` |
| Border | `border-white/10` |
| Text | `text-white text-sm font-bold` |
| Radius | `rounded-xl` |

### Stat Card (inside Hero)
| Property | Value |
|----------|-------|
| Padding | `py-3 px-4` |
| Background | Semi-transparent glass |
| Count | 4 cards in grid |

---

## 12. CREATE/EDIT FORM PAGE

Standard form page layout for creating or editing entities.

### Page Container
| Property | Value |
|----------|-------|
| Background | `bg-[#f8f9fa]` |
| Padding | `p-6 lg:p-8` |
| Spacing | `space-y-8` |
| Border Radius | `rounded-tr-3xl` |
| Shadow | `shadow-inner` |
| Border | `border-e border-white/5` |

### Grid Layout
| Property | Value |
|----------|-------|
| Container | `grid grid-cols-1 lg:grid-cols-3 gap-8` |
| Form Column | `lg:col-span-2 space-y-8` |
| Sidebar Column | `lg:col-span-1` |

### Form Card Container
| Property | Value |
|----------|-------|
| Background | `bg-white` |
| Border Radius | `rounded-3xl` |
| Padding | `p-8` |
| Shadow | `shadow-sm` |
| Border | `border border-slate-100` |

### Form Mode Toggle (Basic/Advanced)
| Property | Value |
|----------|-------|
| Container | `inline-flex p-1 bg-slate-100/80 rounded-full` |
| Button Padding | `px-4 py-2` |
| Button Text | `text-sm font-medium` |
| Active State | `text-emerald-600` with white bg slider |
| Inactive State | `text-slate-500 hover:text-slate-600` |
| Slider | `bg-white rounded-full shadow-sm border border-slate-200/50` |
| Transition | `transition-all duration-300 ease-out` |
| Icon Size | `w-4 h-4` |

### Form Field Label
| Property | Value |
|----------|-------|
| Container | `flex items-center gap-2` |
| Text Size | `text-sm` |
| Weight | `font-medium` |
| Color | `text-slate-700` |
| Icon Size | `w-4 h-4` |
| Icon Color | `text-emerald-500` |

### Text Input
| Property | Value |
|----------|-------|
| Border Radius | `rounded-xl` |
| Border | `border-slate-200` |
| Focus Border | `focus:border-emerald-500` |
| Focus Ring | `focus:ring-emerald-500` |
| Error Border | `border-red-500 focus:border-red-500 focus:ring-red-500/20` |

### Select Dropdown
| Property | Value |
|----------|-------|
| Border Radius | `rounded-xl` |
| Border | `border-slate-200` |
| Focus Ring | `focus:ring-emerald-500` |

### Textarea
| Property | Value |
|----------|-------|
| Min Height | `min-h-[100px]` |
| Border Radius | `rounded-xl` |
| Border | `border-slate-200` |
| Focus | `focus:border-emerald-500 focus:ring-emerald-500` |

### Form Grid Layouts
```tsx
{/* Standard 3-column: Wide, Wide, Narrow */}
<div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_0.5fr] gap-4">
    {/* 1fr = Status/Category (wide) */}
    {/* 1fr = Priority/Estimated (wide) */}
    {/* 0.5fr = Due Date/Time (narrow) */}
</div>

{/* Full width field */}
<div className="space-y-2">
    <label>...</label>
    <Input />
</div>
```

### Collapsible Section
| Property | Value |
|----------|-------|
| Header | `flex items-center justify-between` |
| Title | `text-lg font-semibold text-slate-800` |
| Title Icon | `w-5 h-5 text-emerald-500` |
| Chevron | `w-5 h-5` |
| Content BG | `bg-slate-50` |
| Content Radius | `rounded-xl` |
| Content Padding | `p-4` |

### Subtask Item
| Property | Value |
|----------|-------|
| Container | `flex items-center gap-3 p-3 bg-slate-50 rounded-xl` |
| Text | `flex-1 text-slate-700` |
| Remove Button | `text-red-500 hover:text-red-600 hover:bg-red-50` |

### Tag Badge
| Property | Value |
|----------|-------|
| Component | `Badge variant="secondary"` |
| Layout | `flex flex-wrap gap-2` |
| Remove Icon | `w-3 h-3 hover:text-red-500` |

### Form Footer
| Property | Value |
|----------|-------|
| Layout | `flex items-center justify-end gap-4` |
| Padding | `pt-6` |
| Border | `border-t border-slate-100` |

### Submit Button
| Property | Value |
|----------|-------|
| Min Width | `min-w-[140px]` |
| Background | `bg-emerald-500 hover:bg-emerald-600` |
| Text | `text-white` |
| Radius | `rounded-xl` |
| Shadow | `shadow-lg shadow-emerald-500/20` |

### Cancel Button
| Property | Value |
|----------|-------|
| Variant | `ghost` |
| Color | `text-slate-500 hover:text-navy` |

---

## 13. UNIVERSAL KEYBOARD SHORTCUTS

**⚠️ CRITICAL: Use these EXACT shortcuts across ALL pages and ALL modules for consistency.**

Keyboard shortcuts are centrally handled in **TasksSidebar** component (or equivalent `{Module}Sidebar`).
The sidebar receives `mode` and `taskId` props to determine which shortcuts to activate.

### List View Shortcuts (mode='list', no taskId)
| Key | Action | Condition | Arabic Label |
|-----|--------|-----------|--------------|
| `N` | Navigate to create page | Always | إنشاء |
| `S` | Toggle selection mode | Always | تحديد / إلغاء |
| `D` | Delete selected | Selection mode + has selection | حذف |
| `A` | Archive/Unarchive selected | Selection mode + has selection | أرشفة / إلغاء أرشفة |
| `C` | Complete selected | Selection mode + has selection | إكمال |
| `L` | Select/Deselect all | Selection mode | تحديد الكل / إلغاء الكل |
| `V` | Navigate to list view | Always | عرض جميع |

### Detail View Shortcuts (taskId exists)
| Key | Action | Condition | Arabic Label |
|-----|--------|-----------|--------------|
| `C` | Complete/Reopen item | Always | إكمال / إعادة فتح |
| `E` | Edit item | Always | تعديل |
| `D` | Delete item | Always (with confirm) | حذف |
| `V` | Navigate to list view | Always | عرض جميع |

### Create/Edit View Shortcuts (mode='create')
| Key | Action | Condition | Arabic Label |
|-----|--------|-----------|--------------|
| `N` | Navigate to create (refresh) | Always | إنشاء |
| `C` | Clear form | Always | مسح |
| `D` | Cancel and return to list | Always | إلغاء |
| `S` | Save form | Always | حفظ |

### Quick Actions Widget - Tabs

The Quick Actions sidebar has TWO tabs in list view:

**Main Tab (أساسي)**:
| Button | Key | Icon | Color |
|--------|-----|------|-------|
| Create | `N` | Plus | `text-emerald-600` |
| Select | `S` | CheckSquare / X | `text-slate-700` / `text-emerald-800` (active) |
| Delete | `D` | Trash2 | `text-slate-600 hover:text-red-600` |
| Archive | `A` | Archive / ArchiveRestore | `text-slate-600` / `text-emerald-600` |

**Bulk Tab (جماعي)** - Shows selected count badge:
| Button | Key | Icon | Color |
|--------|-----|------|-------|
| Select All | `L` | CheckCheck | `text-blue-600` |
| Complete | `C` | CheckCircle | `text-emerald-600` |
| Delete | `D` | Trash2 | `text-slate-600 hover:text-red-600` |
| Archive | `A` | Archive / ArchiveRestore | `text-slate-600` / `text-emerald-600` |

### Implementation Pattern (MANDATORY)
```tsx
// In {Module}Sidebar component - handle all keyboard shortcuts centrally
useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Skip if user is typing in an input, textarea, or contenteditable
        const target = e.target as HTMLElement
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        ) {
            return
        }

        // Handle shortcuts based on view mode
        if (mode === 'create') {
            // Create Page shortcuts
            switch (e.key.toLowerCase()) {
                case 'n': e.preventDefault(); navigate({ to: currentLinks.create }); break
                case 'c': e.preventDefault(); onClearForm?.(); break
                case 'd': e.preventDefault(); navigate({ to: currentLinks.viewAll }); break
                case 's': e.preventDefault(); onSaveForm?.(); break
            }
        } else if (taskId) {
            // Detail View shortcuts
            switch (e.key.toLowerCase()) {
                case 'c': e.preventDefault(); onCompleteTask?.(); break
                case 'e': e.preventDefault(); navigate({ to: ROUTES.dashboard.{module}.new, search: { editId: taskId } }); break
                case 'd': e.preventDefault(); onDeleteTask?.(); break
                case 'v': e.preventDefault(); navigate({ to: currentLinks.viewAll }); break
            }
        } else {
            // List View shortcuts
            switch (e.key.toLowerCase()) {
                case 'n': e.preventDefault(); navigate({ to: currentLinks.create }); break
                case 's': e.preventDefault(); onToggleSelectionMode?.(); break
                case 'd':
                    if (isSelectionMode && selectedCount > 0) {
                        e.preventDefault(); onDeleteSelected?.()
                    }
                    break
                case 'a':
                    if (isSelectionMode && selectedCount > 0) {
                        e.preventDefault()
                        isViewingArchived ? onBulkUnarchive?.() : onBulkArchive?.()
                    }
                    break
                case 'c':
                    if (isSelectionMode && selectedCount > 0) {
                        e.preventDefault(); onBulkComplete?.()
                    }
                    break
                case 'l':
                    if (isSelectionMode && totalTaskCount > 0) {
                        e.preventDefault(); onSelectAll?.()
                    }
                    break
                case 'v': e.preventDefault(); navigate({ to: currentLinks.viewAll }); break
            }
        }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
}, [mode, taskId, currentLinks, navigate, ...dependencies])
```

### Sidebar Props for Keyboard Handling
```tsx
interface {Module}SidebarProps {
    context?: 'tasks' | 'reminders' | 'events' | 'reports'
    mode?: 'list' | 'create' | 'details'  // Determines which shortcuts

    // List view props
    isSelectionMode?: boolean
    onToggleSelectionMode?: () => void
    selectedCount?: number
    onDeleteSelected?: () => void
    onBulkComplete?: () => void
    onBulkArchive?: () => void
    onBulkUnarchive?: () => void
    onSelectAll?: () => void
    totalTaskCount?: number
    isViewingArchived?: boolean
    isBulkCompletePending?: boolean
    isBulkArchivePending?: boolean
    isBulkUnarchivePending?: boolean

    // Detail view props
    taskId?: string
    isTaskCompleted?: boolean
    onCompleteTask?: () => void
    onDeleteTask?: () => void
    isCompletePending?: boolean
    isDeletePending?: boolean

    // Create page props
    onClearForm?: () => void
    onSaveForm?: () => void
    isSaving?: boolean
}
```

### Keyboard Badge UI Specifications
| Property | Value |
|----------|-------|
| Container | `flex items-center gap-1.5` |
| Label | `text-sm font-bold` |
| Kbd Size | `text-[10px]` |
| Kbd Font | `font-mono` |
| Kbd Padding | `px-1.5 py-0.5` |
| Kbd Radius | `rounded` |

### Kbd Background Colors by Action
| Action | Kbd BG | Kbd Text |
|--------|--------|----------|
| Create (N) | `bg-emerald-100` | `text-emerald-600` |
| Select (S) | `bg-slate-100` / `bg-emerald-200` (active) | `text-slate-500` / `text-emerald-700` |
| Delete (D) | `bg-red-100` / `bg-slate-100` | `text-red-500` / `text-slate-500` |
| Archive (A) | `bg-slate-100` / `bg-emerald-100` (unarchive) | `text-slate-500` / `text-emerald-600` |
| Complete (C) | `bg-emerald-100` / `bg-amber-100` (reopen) | `text-emerald-600` / `text-amber-600` |
| Select All (L) | `bg-blue-100` | `text-blue-600` |
| Edit (E) | `bg-blue-100` | `text-blue-600` |
| View All (V) | `bg-slate-100` | `text-slate-500` |
| Clear (C) | `bg-amber-100` | `text-amber-600` |
| Save (S) | `bg-blue-100` | `text-blue-600` |

### Quick Action Button Styling
| Property | Value |
|----------|-------|
| Container | `h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl shadow-lg transition-all duration-300 hover:scale-[1.02]` |
| Background | `bg-white` |
| Hover | `hover:bg-{color}-50` |
| Icon Size | `h-6 w-6` / `h-7 w-7` |
| Disabled | `disabled:opacity-50 disabled:cursor-not-allowed` |
| Active State | `ring-2 ring-{color}-400` |

---

## 14. AI SUGGESTION CARD (Optional)

For pages with AI-powered suggestions.

### Container
| Property | Value |
|----------|-------|
| Background | `bg-gradient-to-r from-purple-50 to-indigo-50` |
| Border | `border border-purple-100` |
| Radius | `rounded-2xl` |
| Padding | `p-4` |

### Header
| Property | Value |
|----------|-------|
| Icon | Sparkles `w-5 h-5 text-purple-500` |
| Title | `text-sm font-bold text-purple-900` |
| Refresh Button | Ghost, `text-purple-500` |
| Dismiss Button | Ghost, X icon |

### Content
| Property | Value |
|----------|-------|
| Text | `text-sm text-purple-800` |
| Icon | Lightbulb `w-4 h-4 text-purple-400` |

### Loading State
| Property | Value |
|----------|-------|
| Spinner | `w-4 h-4 animate-spin text-purple-500` |
| Background | Same container with `animate-pulse` |

### Error State
| Property | Value |
|----------|-------|
| Background | `bg-red-50` |
| Border | `border-red-100` |
| Text | `text-red-700` |
| Retry Button | `text-red-600` |

---

## 15. DETAIL VIEW PAGE

Comprehensive specifications for entity detail pages.

### Page Layout Structure
```tsx
<Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
    {/* Loading State */}
    {isLoading && <DetailSkeleton />}

    {/* Error State */}
    {isError && <ErrorCard />}

    {/* Empty State */}
    {!isLoading && !isError && !data && <NotFoundCard />}

    {/* Success State */}
    {!isLoading && !isError && data && (
        <>
            <ProductivityHero badge="إدارة المهام" title={data.title} type="tasks" listMode={true} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Content Card with Tabs */}
                </div>
                <TasksSidebar context="tasks" taskId={id} ... />
            </div>
        </>
    )}
</Main>
```

### Loading Skeleton
```tsx
<div className="space-y-6">
    <Skeleton className="h-48 w-full rounded-3xl" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
        <div>
            <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
    </div>
</div>
```

### Error State Card
| Property | Value |
|----------|-------|
| Container | `bg-white rounded-2xl p-12 border border-slate-100 text-center` |
| Icon Container | `w-16 h-16 rounded-full bg-red-50 flex items-center justify-center` |
| Icon | `w-8 h-8 text-red-500` |
| Title | `text-lg font-bold text-slate-900 mb-2` |
| Message | `text-slate-500 mb-4` |
| Retry Button | `bg-emerald-500 hover:bg-emerald-600` |

### Empty/Not Found State
| Property | Value |
|----------|-------|
| Container | `bg-white rounded-2xl p-12 border border-slate-100 text-center` |
| Icon Container | `w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center` |
| Icon | `w-8 h-8 text-emerald-500` |
| Title | `text-lg font-bold text-slate-900 mb-2` |
| Message | `text-slate-500 mb-4` |
| Back Button | `bg-emerald-500 hover:bg-emerald-600` |

### Main Content Card (GosiCard with Tabs)
| Property | Value |
|----------|-------|
| Container | `GosiCard className="min-h-[600px] p-0"` |
| Tab Header | `px-4 sm:px-6 pt-4 flex items-center justify-between gap-4` |
| Tab Content BG | `bg-slate-50/50 min-h-[400px] sm:min-h-[500px]` |
| Tab Content Padding | `p-4 sm:p-6` |

### Tab Navigation
| Property | Value |
|----------|-------|
| Container | `flex items-center gap-2 border-b border-slate-200 pb-0 flex-1` |
| Tab Button | `px-4 py-2 text-sm font-medium rounded-t-xl transition-colors relative` |
| Active Tab | `bg-emerald-500 text-white` |
| Inactive Tab | `text-slate-600 hover:text-slate-900 hover:bg-slate-100` |

### Standard Detail Tabs
```tsx
const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'time-tracking', label: 'تتبع الوقت' },
    { id: 'files', label: 'المرفقات' },
    { id: 'comments', label: 'التعليقات' }
]
```

### Export Button (Header)
| Property | Value |
|----------|-------|
| Background | `bg-[#022c22] hover:bg-[#064e3b]` |
| Text | `text-white` |
| Radius | `rounded-xl` |
| Padding | `px-3 py-2` |
| Icon | `h-4 w-4` |

### Description Card
| Property | Value |
|----------|-------|
| Container | `border-none shadow-sm bg-white rounded-2xl overflow-hidden` |
| Header Title | `text-lg font-bold text-navy` |
| Description Text | `text-slate-600 leading-relaxed` |

### Compact Info Row (Inside Description)
```tsx
<div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
    {/* Info Item */}
    <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-{color}-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-{color}-600" />
        </div>
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm font-semibold text-navy">{value}</p>
        </div>
    </div>
    {/* Divider */}
    <div className="h-8 w-px bg-slate-200" />
</div>
```

### Info Item Colors
| Type | BG | Icon Color |
|------|----|-----------|
| Date | `blue-50` | `blue-600` |
| Assignee | `emerald-50` | `emerald-600` |
| Progress | `purple-50` | `purple-600` |
| Status | `amber-50` | `amber-600` |

### Progress Bar (in info row)
| Property | Value |
|----------|-------|
| Track | `h-2 bg-slate-100 rounded-full overflow-hidden` |
| Fill | `h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500` |
| Label | `text-xs text-slate-500` |
| Value | `text-sm font-bold text-navy` |

### Section Card (Generic)
| Property | Value |
|----------|-------|
| Container | `border-none shadow-sm bg-white rounded-2xl overflow-hidden` |
| Padding | `p-5` |
| Header | `flex items-center gap-3 mb-4` |
| Icon Box | `w-10 h-10 rounded-xl bg-{color}-100 text-{color}-600 flex items-center justify-center` |
| Title | `text-sm font-bold text-navy` |
| Subtitle | `text-xs text-slate-500` |

### Two-Column Info Cards
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                <Icon className="w-4 h-4 text-{color}-600" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {/* Info rows */}
        </CardContent>
    </Card>
</div>
```

### Info Row (Inside Cards)
| Property | Value |
|----------|-------|
| Container | `flex justify-between text-sm` |
| Label | `text-slate-500` |
| Value | `font-medium text-slate-900` |

### Link Row
| Property | Value |
|----------|-------|
| Text | `text-blue-600 text-sm hover:underline inline-flex items-center gap-1` |
| Icon | `h-3 w-3` |

### Subtask Section
| Property | Value |
|----------|-------|
| Card | `border-none shadow-sm bg-white rounded-2xl overflow-hidden` |
| Header | `CardHeader className="pb-3"` |
| Title | `text-base font-bold text-navy flex items-center gap-2` |
| Badge | `Badge variant="secondary" className="me-2 bg-slate-100 text-slate-600"` |

### Subtask Item
| Property | Value |
|----------|-------|
| Container | `flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all` |
| Checkbox (unchecked) | `w-5 h-5 rounded-md border border-slate-300 hover:border-emerald-500 cursor-pointer` |
| Checkbox (checked) | `bg-emerald-600 border-emerald-600 text-white` |
| Title (incomplete) | `flex-1 font-medium text-navy` |
| Title (complete) | `flex-1 font-medium text-slate-500 line-through` |

### Add Subtask Form
| Property | Value |
|----------|-------|
| Container | `flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100` |
| Input | `flex-1 h-8 border-0 bg-transparent focus-visible:ring-0 text-navy` |
| Add Button | `h-8 bg-emerald-600 hover:bg-emerald-700` |
| Cancel Button | `h-8 w-8 p-0 variant="ghost"` |

### Add Button (Ghost)
| Property | Value |
|----------|-------|
| Style | `variant="ghost" w-full justify-start text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl` |
| Icon | `w-5 h-5 ms-2` |

### Comments Section
| Property | Value |
|----------|-------|
| Card | `border-none shadow-sm bg-white rounded-2xl` |
| ScrollArea | `h-[300px]` |
| Empty State Icon | `w-10 h-10 mx-auto mb-2 opacity-30` |

### Comment Item
| Property | Value |
|----------|-------|
| Container | `flex gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors` |
| Avatar | `w-9 h-9` |
| Avatar BG | `bg-emerald-100 text-emerald-700 text-sm font-bold` |
| Username | `text-sm font-semibold text-navy` |
| Time | `text-xs text-slate-400` |
| Text | `text-sm text-slate-600 mt-1` |

### Comment Input
| Property | Value |
|----------|-------|
| Container | `flex gap-3 pt-4 border-t border-slate-100` |
| Input | `flex-1 rounded-xl resize-none border-slate-200 focus:border-emerald-500` |
| Button | `rounded-xl bg-emerald-500 hover:bg-emerald-600 p-3` |

### Attachments/Files Section
| Property | Value |
|----------|-------|
| Grid | `grid gap-3` |
| File Card | `flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group` |

### File Item
| Property | Value |
|----------|-------|
| Icon Container | `w-10 h-10 rounded-xl flex items-center justify-center` |
| PDF Icon BG | `bg-red-100 text-red-600` |
| DOC Icon BG | `bg-blue-100 text-blue-600` |
| XLS Icon BG | `bg-emerald-100 text-emerald-600` |
| IMG Icon BG | `bg-purple-100 text-purple-600` |
| File Name | `text-sm font-medium text-navy` |
| File Info | `text-xs text-slate-400` |
| Actions | `opacity-0 group-hover:opacity-100 transition-opacity flex gap-1` |

### Delete Confirmation Dialog
| Property | Value |
|----------|-------|
| Overlay | `fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4` |
| Card | `GosiCard className="p-8 max-w-md w-full"` |
| Icon Box | `GosiIconBox variant="soft" size="lg" className="bg-red-50 text-red-500"` |
| Icon | `w-8 h-8` |
| Title | `text-xl font-bold text-slate-900 text-center mb-2` |
| Message | `text-slate-500 text-center mb-8` |
| Buttons | `flex gap-3 justify-center` |
| Cancel | `GosiButton variant="ghost"` |
| Confirm | `GosiButton variant="danger"` |

### Sidebar Props for Detail View
```tsx
<TasksSidebar
    context="tasks"
    taskId={id}
    isTaskCompleted={data.status === 'done'}
    onCompleteTask={handleComplete}
    onDeleteTask={() => setShowDeleteConfirm(true)}
    isCompletePending={completeMutation.isPending || reopenMutation.isPending}
    isDeletePending={deleteMutation.isPending}
/>
```

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
- **Create View**: `src/features/tasks/components/create-task-view.tsx`
- **Detail View**: `src/features/tasks/components/task-details-view.tsx`
- **Sidebar**: `src/features/tasks/components/tasks-sidebar.tsx`
- **Schema**: `src/features/tasks/data/schema.ts`
- **Constants**: `src/features/tasks/constants/task-options.ts`
- **Hero Component**: `src/components/productivity-hero.tsx`

---

## 16. MODULE REPLICATION GUIDE

When creating a new module (HR, Finance, etc.), follow this structure:

### Folder Structure
```
src/features/{module}/
├── components/
│   ├── {module}-list-view.tsx      # Main list page (copy tasks-list-view.tsx)
│   ├── create-{entity}-view.tsx    # Create form (copy create-task-view.tsx)
│   ├── {entity}-details-view.tsx   # Detail view (copy task-details-view.tsx)
│   ├── {module}-sidebar.tsx        # Sidebar widget (copy tasks-sidebar.tsx)
│   ├── {module}-columns.tsx        # Table columns (copy tasks-columns.tsx)
│   └── {module}-dialogs.tsx        # Modals/dialogs
├── constants/
│   └── {module}-options.ts         # Dropdown options, status/priority maps
├── data/
│   └── schema.ts                   # Zod schemas
├── hooks/
│   └── use{Module}.ts              # Custom hooks (if not in src/hooks/)
└── index.tsx                       # Route exports
```

### Step-by-Step Module Creation

1. **Copy Tasks Module Structure**
   ```bash
   cp -r src/features/tasks src/features/{new-module}
   ```

2. **Rename Files**
   - `tasks-list-view.tsx` → `{module}-list-view.tsx`
   - `create-task-view.tsx` → `create-{entity}-view.tsx`
   - etc.

3. **Search and Replace**
   - `tasks` → `{module}` (lowercase)
   - `Tasks` → `{Module}` (PascalCase)
   - `task` → `{entity}` (singular)
   - `Task` → `{Entity}` (PascalCase singular)

4. **Update Constants**
   - Add routes to `src/constants/routes.ts`
   - Add query keys to `src/lib/query-keys.ts`
   - Add cache invalidation to `src/lib/cache-invalidation.ts`

5. **Create Hook** (in `src/hooks/use{Module}.ts`)
   - Copy `useTasks.ts` pattern
   - Update API endpoints
   - Update query keys
   - Update cache times

6. **Update Sidebar Navigation**
   - Add to sidebar menu
   - Add icon

7. **Update Hero Component**
   - Add type config in `buttonConfig`
   - Add type config in `listButtonConfig`

### Checklist for New Module
- [ ] List view with all 15 sections from planform.md
- [ ] Create view with Basic/Advanced mode toggle
- [ ] Detail view with back navigation
- [ ] Sidebar with Quick Actions
- [ ] Keyboard shortcuts (same keys as tasks)
- [ ] Hero card with stats
- [ ] Loading skeletons
- [ ] Empty/Error states
- [ ] RTL support tested
- [ ] Translations in AR/EN

### Module-Specific Adaptations

| Module | Entity | Special Features |
|--------|--------|------------------|
| Tasks | Task | Subtasks, recurring, AI suggestions |
| HR | Employee | Leave balances, org chart |
| Finance | Invoice | Line items, payments, totals |
| CRM | Lead | Pipeline stages, scoring |
| Cases | Case | Documents, timeline, parties |

### Do NOT Change
These patterns MUST stay consistent across ALL modules:
- ❌ Keyboard shortcuts (N, S, D, A, C, L, /, Escape)
- ❌ Filter card dimensions (h-14 inputs, rounded-2xl)
- ❌ List item card structure
- ❌ Quick Actions sidebar layout
- ❌ Hero card structure
- ❌ Color palette (priority, status colors)
- ❌ Animation timings

### DO Customize
These CAN vary per module:
- ✅ Status options (todo/done vs pending/approved)
- ✅ Priority labels
- ✅ Filter dropdown options
- ✅ Stat cards in hero
- ✅ Quick action buttons (Complete vs Approve)
- ✅ Form fields in create/edit
- ✅ Column definitions in list

---

## QUICK REFERENCE CARD

### Dimensions Cheat Sheet
| Component | Dimension |
|-----------|-----------|
| Input height | `h-14` |
| Button height (primary) | `h-14` (filter) / `h-10` (hero) / `h-12` (load more) |
| Card radius | `rounded-2xl` |
| Container radius | `rounded-[2rem]` / `rounded-3xl` |
| Icon (small) | `w-4 h-4` / `w-5 h-5` |
| Icon (medium) | `w-6 h-6` / `w-7 w-7` |
| Badge text | `text-[10px]` |

### Spacing Cheat Sheet
| Context | Value |
|---------|-------|
| Page padding | `p-6 lg:p-8` |
| Card padding | `p-4` / `p-6` / `p-8` |
| Grid gap | `gap-4` / `gap-6` / `gap-8` |
| Item spacing | `space-y-6` |

### Color Cheat Sheet
| Use Case | Color |
|----------|-------|
| Primary action | `emerald-500/600` |
| Secondary action | `navy` |
| Danger | `red-500/600` |
| Warning | `amber-400/500` |
| Info | `blue-500/600` |
| Neutral | `slate-400/500` |
| Background light | `bg-[#f8f9fa]` |
| Background dark | `bg-[#022c22]` |
