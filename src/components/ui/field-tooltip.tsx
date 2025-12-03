'use client'

import * as React from 'react'
import { Info, HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface FieldTooltipProps {
  content: string
  children?: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  className?: string
  iconClassName?: string
  variant?: 'info' | 'help'
  asChild?: boolean
}

/**
 * FieldTooltip - A reusable tooltip component for form fields
 *
 * @example
 * // Basic usage with info icon
 * <FieldTooltip content="Enter a clear title for the task" />
 *
 * @example
 * // With custom trigger
 * <FieldTooltip content="Select the priority level">
 *   <span className="text-blue-500 cursor-help">?</span>
 * </FieldTooltip>
 *
 * @example
 * // With help circle icon
 * <FieldTooltip content="This field is required" variant="help" />
 */
export function FieldTooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  className,
  iconClassName,
  variant = 'info',
  asChild = false,
}: FieldTooltipProps) {
  const Icon = variant === 'help' ? HelpCircle : Info

  return (
    <Tooltip>
      <TooltipTrigger asChild={asChild || !!children} type="button">
        {children || (
          <span
            className={cn(
              'inline-flex items-center justify-center cursor-help',
              'text-muted-foreground hover:text-foreground transition-colors',
              iconClassName
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        className={cn(
          'max-w-xs text-sm leading-relaxed',
          'bg-slate-900 text-white',
          className
        )}
      >
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * FormLabel with integrated tooltip
 * A convenience wrapper that combines a label with a tooltip
 */
interface FormLabelWithTooltipProps {
  label: string
  tooltip: string
  required?: boolean
  icon?: React.ReactNode
  className?: string
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left'
}

export function FormLabelWithTooltip({
  label,
  tooltip,
  required = false,
  icon,
  className,
  tooltipSide = 'top',
}: FormLabelWithTooltipProps) {
  return (
    <label className={cn(
      'text-sm font-medium text-slate-700 flex items-center gap-2',
      className
    )}>
      {icon}
      {label}
      {required && <span className="text-red-500">*</span>}
      <FieldTooltip content={tooltip} side={tooltipSide} />
    </label>
  )
}

/**
 * SelectItemWithTooltip - A wrapper for select items that need tooltips
 * Note: Due to Radix UI limitations, this shows tooltip on hover of the entire item
 */
interface SelectItemTooltipProps {
  value: string
  label: string
  tooltip: string
  color?: string
  bgColor?: string
  dotColor?: string
  showDot?: boolean
}

export function getSelectItemWithTooltip({
  value,
  label,
  tooltip,
  color,
  bgColor,
  dotColor,
  showDot = false,
}: SelectItemTooltipProps) {
  return {
    value,
    label,
    tooltip,
    color,
    bgColor,
    dotColor,
    showDot,
  }
}

export { FieldTooltip as default }
