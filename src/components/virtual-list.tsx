/**
 * Virtual List Components
 * Uses react-window for efficient rendering of large lists
 */

import { List } from 'react-window'
import type { ReactNode } from 'react'

// react-window v2 child component props
interface ListChildComponentProps {
  index: number
  style: CSSProperties
}
import { forwardRef, memo, useCallback, useRef, CSSProperties, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// ==================== TYPES ====================

interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[]
  /** Height of each item in pixels (for FixedSizeList) */
  itemHeight: number
  /** Total height of the list container */
  height: number
  /** Width of the list container (default: 100%) */
  width?: number | string
  /** Render function for each item */
  renderItem: (item: T, index: number, style: CSSProperties) => React.ReactNode
  /** Additional class name for the list container */
  className?: string
  /** Number of items to render outside visible area */
  overscanCount?: number
  /** RTL layout support */
  direction?: 'ltr' | 'rtl'
  /** Key extractor for items */
  getItemKey?: (index: number, data: T[]) => string | number
}

interface VariableListProps<T> extends Omit<VirtualListProps<T>, 'itemHeight'> {
  /** Function to get height of each item */
  getItemHeight: (index: number) => number
  /** Estimated item height for initial render */
  estimatedItemHeight?: number
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
  getItemKey,
}: VirtualListProps<T>) {
  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const item = items[index]
      return renderItem(item, index, style)
    },
    [items, renderItem]
  )

  return (
    <List
      height={height}
      width={width}
      itemCount={items.length}
      itemSize={itemHeight}
      overscanCount={overscanCount}
      direction={direction}
      className={cn('scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent', className)}
      itemKey={getItemKey ? (index) => getItemKey(index, items) : undefined}
    >
      {Row}
    </List>
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
  estimatedItemHeight = 50,
  getItemKey,
}: VariableListProps<T>) {
  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const item = items[index]
      return renderItem(item, index, style)
    },
    [items, renderItem]
  )

  return (
    <List
      height={height}
      width={width}
      itemCount={items.length}
      itemSize={getItemHeight}
      overscanCount={overscanCount}
      direction={direction}
      className={cn('scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent', className)}
      itemKey={getItemKey ? (index) => getItemKey(index, items) : undefined}
    >
      {Row}
    </List>
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
