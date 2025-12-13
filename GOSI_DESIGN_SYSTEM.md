# Gosi Design System Guidelines 🎨

> **"World Class" Premium Aesthetic for Traf3li Dashboard**
> *Goal: 10/10 Visual Quality*

This document serves as the **Single Source of Truth** for the Gosi Design style. When creating new pages or refactoring existing ones, **ALWAYS** follow these rules to ensure consistency.

---

## 1. Core Philosophy ✨

*   **Highly Rounded**: We use `rounded-3xl` (24px) or `rounded-[2rem]` (32px) for containers. `rounded-2xl` for inputs.
*   **Deep Depth**: Multi-layer shadows to create a "floating" effect.
*   **Tactile Inputs**: Inputs should feel "thick" and clickable, with subtle backgrounds.
*   **Vibrant Accents**: Use **Emerald** gradients for primary actions, avoiding flat colors where possible.
*   **Clean & Spacious**: Avoid clutter. Remove unnecessary headers or helper text (e.g., "Required fields").

---

## 2. Component Library Location

All Gosi components are located at:
```
src/components/ui/gosi-ui.tsx
```

Available components:
- `GosiCard` - Premium rounded card container
- `GosiInput` - Filled-style input with focus ring
- `GosiTextarea` - Styled textarea
- `GosiLabel` - Label with optional icon
- `GosiSelect` - Premium dropdown select
- `GosiButton` - Gradient/soft buttons
- `GosiTaskCard` - Task list card with status strip
- `GosiFilterBar` - Flexbox wrap filter container
- `GosiFilterSelect` - Smart-width filter dropdown
- `GosiIconBox` - Styled icon container
- `GosiPriorityBadge` - Priority indicator badge

---

## 3. Component Specifications 🛠️

### Cards (`GosiCard`)
*   **Shape**: `rounded-[2rem]` (Approx 32px).
*   **Background**: `bg-white/95` or `bg-white/80` with `backdrop-blur-xl`.
*   **Shadow**: Deep, multi-layer shadow.
    *   `shadow-[0_20px_40px_-5px_rgba(0,0,0,0.05),0_8px_20px_-6px_rgba(0,0,0,0.01)]`
*   **Border**: No solid border (`border-0`), utilize `ring-1 ring-black/[0.03]` for subtle definition.

### Inputs (`GosiInput`)
*   **Height**:
    *   **Standard**: `h-14` (56px) for main fields.
    *   **Compact**: `h-12` (48px) for Date/Time or secondary rows.
*   **Shape**: `rounded-2xl`.
*   **Style**: Filled style. `bg-slate-50` hovering to `bg-slate-100`.
*   **Focus State**: Strong ring! `ring-4 ring-emerald-500/10` + `border-emerald-500/50`.
*   **Typography**: `font-medium text-slate-900`.

### Buttons (`GosiButton`)
*   **Primary**: Gradient background.
    *   `bg-gradient-to-r from-emerald-600 to-emerald-500`
    *   **Shadow**: `shadow-lg shadow-emerald-500/20`
*   **Soft**: `bg-emerald-50` → fills emerald on hover
*   **Shape**: `rounded-[18px]` or `rounded-xl`.
*   **Hover**: Scale up slightly (`hover:scale-[1.02]`).

### Task Cards (`GosiTaskCard` - Clean Slate Pattern)
*   **Container**: Unboxed floating cards with `rounded-[2rem]`
*   **Status Strip**: 6px colored bar on left edge (urgent=red, high=orange, medium=amber, low=green)
*   **Icon Box**: `bg-slate-50` (soft variant)
*   **Animation**: Staggered fade-in with `animationDelay: index * 50ms`
*   **Mobile**: ChevronLeft indicator, full card clickable

---

## 4. Layout Patterns 📐

### The "Compact Date Row" (Critical!) 📅
Do **NOT** use a 50/50 Grid for Date and Time. It creates too much whitespace.
Instead, use a **Flexbox** layout with **Fixed Widths**.

**Rules:**
1.  **Date Width**: `w-[180px]` (Fixed).
2.  **Time Width**: `w-[130px]` (Fixed).
3.  **Assignee/Other**: `flex-1` (Fills remaining space).
4.  **Text Alignment**: `text-center` for Date/Time inputs.

**Code Snippet:**
```tsx
<div className="flex flex-col md:flex-row gap-6">
    {/* Date */}
    <div className="space-y-3 w-full md:w-auto">
        <GosiLabel icon={<Calendar className="w-4 h-4" />}>
            التاريخ
        </GosiLabel>
        <GosiInput
            type="date"
            variant="compact"
            className="w-full md:w-[180px] text-center text-sm font-bold"
        />
    </div>

    {/* Time */}
    <div className="space-y-3 w-full md:w-auto">
        <GosiLabel icon={<Clock className="w-4 h-4" />}>
            الوقت
        </GosiLabel>
        <GosiInput
            type="time"
            variant="compact"
            className="w-full md:w-[130px] text-center text-sm font-bold"
        />
    </div>

    {/* Assignee fills the rest */}
    <div className="space-y-3 flex-1">
         <GosiLabel icon={<Users className="w-4 h-4" />}>
            تعيين إلى
         </GosiLabel>
         <GosiSelect placeholder="اختر المسؤول">...</GosiSelect>
    </div>
</div>
```

### Smart Filter Bar (Flexbox Wrap)
For filter bars, use `GosiFilterBar` with smart-width filters that expand for Arabic text:

```tsx
<GosiCard className="p-4">
    <GosiFilterBar className="gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <GosiInput
                placeholder="بحث..."
                variant="compact"
                className="pe-10"
            />
        </div>

        {/* Filters with smart minWidth */}
        <GosiFilterSelect
            placeholder="الأولوية"
            minWidth="160px"  {/* Grows for Arabic text */}
        >
            <SelectItem value="all">كل الأولويات</SelectItem>
            <SelectItem value="urgent">عاجل</SelectItem>
        </GosiFilterSelect>
    </GosiFilterBar>
</GosiCard>
```

### Form Header 🚫
*   **Prefer NO Header** inside the card if there is a Page Hero.
*   Start directly with the first input (usually "Title").
*   Avoid "New Task" or "Edit Item" text inside the white card—it's redundant.

### Footer Actions
*   **Alignment**: `justify-end` (Right aligned in LTR, Left in RTL).
*   **Content**: Only distinct buttons (Cancel / Save).
*   **Prohibited**: Do NOT include "* Required Fields" helper text.

```tsx
{/* Footer - Gosi Pattern */}
<div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100/50 flex items-center justify-end gap-3">
    <GosiButton variant="ghost">
        إلغاء
    </GosiButton>
    <GosiButton variant="primary">
        <Save className="w-4 h-4" />
        حفظ
    </GosiButton>
</div>
```

---

## 5. Task List Pattern (Clean Slate) 📋

The task list uses "floating island" cards instead of a bordered table:

```tsx
{/* Task Cards - Floating Islands */}
<div className="space-y-4">
    {tasks.map((task, index) => (
        <GosiTaskCard
            key={task.id}
            priority={task.priority}
            animationDelay={index * 50}  {/* Staggered animation */}
            className="p-6 cursor-pointer"
            onClick={() => handleViewTask(task.id)}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                    {/* Soft Slate Icon Box */}
                    <GosiIconBox variant="soft" size="md">
                        <Briefcase className="h-6 w-6" />
                    </GosiIconBox>
                    <div>
                        <h4 className="font-bold text-slate-900 text-lg">{task.title}</h4>
                        <p className="text-slate-500 text-sm">{task.client}</p>
                    </div>
                </div>
                {/* ... actions dropdown */}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {/* Priority, Due Date, etc. */}

                {/* Soft Button (Desktop) */}
                <div className="hidden sm:block">
                    <GosiButton variant="soft" size="sm">
                        عرض التفاصيل
                    </GosiButton>
                </div>

                {/* Mobile Chevron */}
                <div className="sm:hidden text-slate-400">
                    <ChevronLeft className="h-5 w-5" />
                </div>
            </div>
        </GosiTaskCard>
    ))}
</div>
```

---

## 6. Typography & Colors 🎨

*   **Font**: `IBM Plex Sans Arabic`.
*   **Primary Color**: Emerald (`emerald-500`, `emerald-600`).
*   **Background**: `bg-[#f8f9fa]` (Light Gray/Blue tint) for the main page background to let the white cards pop.
*   **Text Colors**:
    *   Headings: `text-slate-900`
    *   Body: `text-slate-600`
    *   Muted: `text-slate-500`
    *   Links: `text-emerald-600`

---

## 7. Animation Guidelines 🎬

*   **Staggered Entry**: List items cascade in with `animationDelay: index * 50ms`
*   **Hover Lift**: Cards lift on hover with `-translate-y-1.5` and deeper shadow
*   **Button Scale**: Primary buttons scale up `hover:scale-[1.02]`
*   **Transitions**: Use `transition-all duration-200` or `duration-300`

---

## HOW TO USE ME

Attach this file when asking an AI to "Apply Gosi Design" to a new page. It contains all the secret sauce! 🥫

### Quick Reference:

```tsx
// Import Gosi components
import {
    GosiCard,
    GosiInput,
    GosiTextarea,
    GosiLabel,
    GosiSelect,
    GosiSelectItem,
    GosiButton,
    GosiTaskCard,
    GosiFilterBar,
    GosiFilterSelect,
    GosiIconBox,
    GosiPriorityBadge,
} from '@/components/ui/gosi-ui'
```
