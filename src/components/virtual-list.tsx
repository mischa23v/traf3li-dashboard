/**
 * Virtual List Components
 * Uses react-window v2 for efficient rendering of large lists
 */

import { List } from 'react-window'
import type { ReactElement, CSSProperties, ReactNode } from 'react'
import { forwardRef, memo, useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

// ==================== TYPES ====================

interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[]
  /** Height of each item in pixels */
  itemHeight: number
  /** Total height of the list container */
  height?: number
  /** Width of the list container (default: 100%) */
  width?: number | string
  /** Render function for each item */
  renderItem: (item: T, index: number, style: CSSProperties) => ReactNode
  /** Additional class name for the list container */
  className?: string
  /** Number of items to render outside visible area */
  overscanCount?: number
  /** RTL layout support */
  direction?: 'ltr' | 'rtl'
  /** Key extractor for items (optional, for compatibility - not used in v2) */
  getItemKey?: (index: number, data: T[]) => string | number
}

interface VariableListProps<T> extends Omit<VirtualListProps<T>, 'itemHeight'> {
  /** Function to get height of each item */
  getItemHeight: (index: number) => number
  /** Estimated item height for initial render */
  estimatedItemHeight?: number
}

// ==================== ROW PROPS TYPE FOR V2 API ====================
// rowProps must NOT contain ariaAttributes, index, or style - those are auto-passed

interface RowPropsData<T> {
  items: T[]
  renderItem: (item: T, index: number, style: CSSProperties) => ReactNode
}

// ==================== FIXED SIZE LIST ====================

function VirtualListInner<T>({
  items,
  itemHeight,
  height,
  width = '100%',
  renderItem,
  className,
  overscanCount = 5,
  direction = 'rtl',
}: VirtualListProps<T>) {
  // Memoize rowProps to prevent unnecessary re-renders
  const rowProps = useMemo<RowPropsData<T>>(() => ({ items, renderItem }), [items, renderItem])

  // Row component for v2 API - defined outside of render to be stable
  // ariaAttributes, index, style are auto-passed by List
  // items, renderItem come from rowProps
  const Row = useMemo(() => {
    const RowComponent = (props: {
      ariaAttributes: { 'aria-posinset': number; 'aria-setsize': number; role: 'listitem' }
      index: number
      style: CSSProperties
      items: T[]
      renderItem: (item: T, index: number, style: CSSProperties) => ReactNode
    }): ReactElement => {
      const { index, style, items: rowItems, renderItem: rowRenderItem } = props
      const item = rowItems[index]
      return <>{rowRenderItem(item, index, style)}</>
    }
    return RowComponent
  }, [])

  return (
    <List<RowPropsData<T>>
      rowComponent={Row}
      rowCount={items.length}
      rowHeight={itemHeight}
      rowProps={rowProps}
      overscanCount={overscanCount}
      dir={direction}
      defaultHeight={height}
      className={cn('scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent', className)}
      style={{ width }}
    />
  )
}

export const VirtualList = memo(VirtualListInner) as typeof VirtualListInner

// ==================== VARIABLE SIZE LIST ====================

function VariableVirtualListInner<T>({
  items,
  getItemHeight,
  height,
  width = '100%',
  renderItem,
  className,
  overscanCount = 5,
  direction = 'rtl',
}: VariableListProps<T>) {
  // Memoize rowProps to prevent unnecessary re-renders
  const rowProps = useMemo<RowPropsData<T>>(() => ({ items, renderItem }), [items, renderItem])

  // Row component for v2 API
  const Row = useMemo(() => {
    const RowComponent = (props: {
      ariaAttributes: { 'aria-posinset': number; 'aria-setsize': number; role: 'listitem' }
      index: number
      style: CSSProperties
      items: T[]
      renderItem: (item: T, index: number, style: CSSProperties) => ReactNode
    }): ReactElement => {
      const { index, style, items: rowItems, renderItem: rowRenderItem } = props
      const item = rowItems[index]
      return <>{rowRenderItem(item, index, style)}</>
    }
    return RowComponent
  }, [])

  return (
    <List<RowPropsData<T>>
      rowComponent={Row}
      rowCount={items.length}
      rowHeight={getItemHeight}
      rowProps={rowProps}
      overscanCount={overscanCount}
      dir={direction}
      defaultHeight={height}
      className={cn('scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent', className)}
      style={{ width }}
    />
  )
}

export const VariableVirtualList = memo(VariableVirtualListInner) as typeof VariableVirtualListInner

// ==================== VIRTUAL TABLE ROW ====================

interface VirtualTableRowProps {
  style: CSSProperties
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const VirtualTableRow = memo(forwardRef<HTMLDivElement, VirtualTableRowProps>(
  function VirtualTableRow({ style, children, className, onClick }, ref) {
    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          'flex items-center border-b border-slate-100 hover:bg-slate-50/50 transition-colors',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        } : undefined}
      >
        {children}
      </div>
    )
  }
))

// ==================== UTILITY HOOKS ====================

/**
 * Hook to calculate visible range for virtual list
 */
export function useVirtualListHeight(
  containerRef: React.RefObject<HTMLElement>,
  defaultHeight: number = 400
): number {
  const [height, setHeight] = useState(defaultHeight)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateHeight = () => {
      const rect = container.getBoundingClientRect()
      const availableHeight = window.innerHeight - rect.top - 100 // 100px buffer
      setHeight(Math.max(availableHeight, 200))
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(container)

    window.addEventListener('resize', updateHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateHeight)
    }
  }, [containerRef])

  return height
}

// ==================== EXPORTS ====================

export type { VirtualListProps, VariableListProps, VirtualTableRowProps }
