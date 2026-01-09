import { useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'

/**
 * GOLD STANDARD: Universal Keyboard Shortcuts Hook
 *
 * This hook provides centralized keyboard shortcuts for all modules.
 * ALL modules (Tasks, HR, Finance, CRM, etc.) MUST use this hook to ensure
 * consistent keyboard shortcuts across the entire platform.
 *
 * @example
 * ```tsx
 * // List View
 * useKeyboardShortcuts({
 *     mode: 'list',
 *     links: { create: ROUTES.dashboard.tasks.new, viewAll: ROUTES.dashboard.tasks.list },
 *     listCallbacks: {
 *         onToggleSelectionMode,
 *         onDeleteSelected,
 *         onBulkArchive,
 *         onBulkUnarchive,
 *         onBulkComplete,
 *         onSelectAll,
 *         isSelectionMode,
 *         selectedCount,
 *         totalCount,
 *         isViewingArchived,
 *     }
 * })
 *
 * // Detail View
 * useKeyboardShortcuts({
 *     mode: 'detail',
 *     links: { create: ROUTES.dashboard.tasks.new, viewAll: ROUTES.dashboard.tasks.list },
 *     entityId: taskId,
 *     editRoute: ROUTES.dashboard.tasks.new, // Route with ?editId param
 *     detailCallbacks: {
 *         onComplete,
 *         onDelete,
 *     }
 * })
 *
 * // Create/Edit View
 * useKeyboardShortcuts({
 *     mode: 'create',
 *     links: { create: ROUTES.dashboard.tasks.new, viewAll: ROUTES.dashboard.tasks.list },
 *     createCallbacks: {
 *         onClear,
 *         onSave,
 *     }
 * })
 * ```
 */

// Shortcut definitions for documentation and UI rendering
export const KEYBOARD_SHORTCUTS = {
    list: {
        main: [
            { key: 'N', action: 'create', label: 'إنشاء', labelEn: 'Create', color: 'emerald' },
            { key: 'S', action: 'select', label: 'تحديد', labelEn: 'Select', color: 'slate' },
            { key: 'D', action: 'delete', label: 'حذف', labelEn: 'Delete', color: 'red' },
            { key: 'A', action: 'archive', label: 'أرشفة', labelEn: 'Archive', color: 'slate' },
        ],
        bulk: [
            { key: 'L', action: 'selectAll', label: 'تحديد الكل', labelEn: 'Select All', color: 'blue' },
            { key: 'C', action: 'complete', label: 'إكمال', labelEn: 'Complete', color: 'emerald' },
            { key: 'D', action: 'delete', label: 'حذف', labelEn: 'Delete', color: 'red' },
            { key: 'A', action: 'archive', label: 'أرشفة', labelEn: 'Archive', color: 'slate' },
        ],
        navigation: [
            { key: 'V', action: 'viewAll', label: 'عرض جميع', labelEn: 'View All', color: 'slate' },
        ],
    },
    detail: [
        { key: 'C', action: 'complete', label: 'إكمال', labelEn: 'Complete/Reopen', color: 'emerald' },
        { key: 'E', action: 'edit', label: 'تعديل', labelEn: 'Edit', color: 'blue' },
        { key: 'D', action: 'delete', label: 'حذف', labelEn: 'Delete', color: 'red' },
        { key: 'V', action: 'viewAll', label: 'عرض جميع', labelEn: 'View All', color: 'slate' },
    ],
    create: [
        { key: 'N', action: 'new', label: 'إنشاء', labelEn: 'New', color: 'emerald' },
        { key: 'C', action: 'clear', label: 'مسح', labelEn: 'Clear', color: 'amber' },
        { key: 'D', action: 'cancel', label: 'إلغاء', labelEn: 'Cancel', color: 'slate' },
        { key: 'S', action: 'save', label: 'حفظ', labelEn: 'Save', color: 'blue' },
    ],
} as const

// Kbd background color classes by action type
export const KBD_COLORS = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-500',
    slate: 'bg-slate-100 text-slate-500',
} as const

export type ViewMode = 'list' | 'detail' | 'create'

export interface ModuleLinks {
    create: string
    viewAll: string
}

export interface ListCallbacks {
    onToggleSelectionMode?: () => void
    onDeleteSelected?: () => void
    onBulkArchive?: () => void
    onBulkUnarchive?: () => void
    onBulkComplete?: () => void
    onSelectAll?: () => void
    isSelectionMode?: boolean
    selectedCount?: number
    totalCount?: number
    isViewingArchived?: boolean
}

export interface DetailCallbacks {
    onComplete?: () => void
    onDelete?: () => void
}

export interface CreateCallbacks {
    onClear?: () => void
    onSave?: () => void
}

export interface UseKeyboardShortcutsOptions {
    /** Current view mode */
    mode: ViewMode
    /** Navigation links for the module */
    links: ModuleLinks
    /** Entity ID for detail view (required for detail mode) */
    entityId?: string
    /** Edit route for detail view navigation */
    editRoute?: string
    /** Whether shortcuts are disabled (e.g., when dialog is open) */
    disabled?: boolean
    /** Callbacks for list view */
    listCallbacks?: ListCallbacks
    /** Callbacks for detail view */
    detailCallbacks?: DetailCallbacks
    /** Callbacks for create/edit view */
    createCallbacks?: CreateCallbacks
}

/**
 * Checks if the current focus is on an interactive element
 * where keyboard shortcuts should be disabled
 */
function isInteractiveElement(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) return false

    const tagName = target.tagName
    return (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        target.isContentEditable ||
        target.getAttribute('role') === 'textbox' ||
        target.getAttribute('role') === 'combobox' ||
        target.getAttribute('role') === 'searchbox' ||
        target.closest('[role="dialog"]') !== null ||
        target.closest('[data-radix-popper-content-wrapper]') !== null
    )
}

export function useKeyboardShortcuts({
    mode,
    links,
    entityId,
    editRoute,
    disabled = false,
    listCallbacks,
    detailCallbacks,
    createCallbacks,
}: UseKeyboardShortcutsOptions): void {
    const navigate = useNavigate()

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Skip if disabled or user is in an interactive element
        if (disabled || isInteractiveElement(e.target)) {
            return
        }

        // Skip if modifier keys are pressed (except Shift for capital letters)
        if (e.ctrlKey || e.metaKey || e.altKey) {
            return
        }

        const key = e.key.toLowerCase()

        // Handle shortcuts based on view mode
        switch (mode) {
            case 'create':
                handleCreateShortcuts(e, key)
                break
            case 'detail':
                handleDetailShortcuts(e, key)
                break
            case 'list':
            default:
                handleListShortcuts(e, key)
                break
        }
    }, [mode, disabled, links, entityId, editRoute, listCallbacks, detailCallbacks, createCallbacks, navigate])

    function handleCreateShortcuts(e: KeyboardEvent, key: string): void {
        switch (key) {
            case 'n':
                e.preventDefault()
                navigate({ to: links.create })
                break
            case 'c':
                e.preventDefault()
                createCallbacks?.onClear?.()
                break
            case 'd':
                e.preventDefault()
                navigate({ to: links.viewAll })
                break
            case 's':
                e.preventDefault()
                createCallbacks?.onSave?.()
                break
        }
    }

    function handleDetailShortcuts(e: KeyboardEvent, key: string): void {
        if (!entityId) return

        switch (key) {
            case 'c':
                e.preventDefault()
                detailCallbacks?.onComplete?.()
                break
            case 'e':
                e.preventDefault()
                if (editRoute) {
                    navigate({ to: editRoute, search: { editId: entityId } })
                }
                break
            case 'd':
                e.preventDefault()
                detailCallbacks?.onDelete?.()
                break
            case 'v':
                e.preventDefault()
                navigate({ to: links.viewAll })
                break
        }
    }

    function handleListShortcuts(e: KeyboardEvent, key: string): void {
        const {
            onToggleSelectionMode,
            onDeleteSelected,
            onBulkArchive,
            onBulkUnarchive,
            onBulkComplete,
            onSelectAll,
            isSelectionMode = false,
            selectedCount = 0,
            totalCount = 0,
            isViewingArchived = false,
        } = listCallbacks || {}

        switch (key) {
            case 'n':
                e.preventDefault()
                navigate({ to: links.create })
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
                if (isSelectionMode && totalCount > 0) {
                    onSelectAll?.()
                }
                break
            case 'v':
                e.preventDefault()
                navigate({ to: links.viewAll })
                break
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])
}

/**
 * Helper function to get shortcut info for rendering UI elements
 * @param mode - Current view mode
 * @param action - Action name
 * @returns Shortcut info object or undefined
 */
export function getShortcutInfo(mode: ViewMode, action: string) {
    if (mode === 'list') {
        const mainShortcut = KEYBOARD_SHORTCUTS.list.main.find(s => s.action === action)
        if (mainShortcut) return mainShortcut

        const bulkShortcut = KEYBOARD_SHORTCUTS.list.bulk.find(s => s.action === action)
        if (bulkShortcut) return bulkShortcut

        return KEYBOARD_SHORTCUTS.list.navigation.find(s => s.action === action)
    }

    if (mode === 'detail') {
        return KEYBOARD_SHORTCUTS.detail.find(s => s.action === action)
    }

    if (mode === 'create') {
        return KEYBOARD_SHORTCUTS.create.find(s => s.action === action)
    }

    return undefined
}

/**
 * Get all shortcuts for a given view mode
 * @param mode - Current view mode
 * @returns Array of shortcut definitions
 */
export function getShortcutsForMode(mode: ViewMode) {
    if (mode === 'list') {
        return {
            main: KEYBOARD_SHORTCUTS.list.main,
            bulk: KEYBOARD_SHORTCUTS.list.bulk,
            navigation: KEYBOARD_SHORTCUTS.list.navigation,
        }
    }

    if (mode === 'detail') {
        return KEYBOARD_SHORTCUTS.detail
    }

    return KEYBOARD_SHORTCUTS.create
}
