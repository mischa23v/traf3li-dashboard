/**
 * GOSI Design System Components
 *
 * "World Class" Premium Aesthetic for Traf3li Dashboard
 * Goal: 10/10 Visual Quality
 *
 * Core Philosophy:
 * - Highly Rounded: rounded-[2rem] for containers, rounded-2xl for inputs
 * - Deep Depth: Multi-layer shadows for "floating" effect
 * - Tactile Inputs: Thick, clickable inputs with subtle backgrounds
 * - Vibrant Accents: Emerald gradients for primary actions
 * - Clean & Spacious: No clutter, no unnecessary headers
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

// ============================================================================
// GOSI CARD
// ============================================================================
interface GosiCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'dark'
}

export const GosiCard = React.forwardRef<HTMLDivElement, GosiCardProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {
        const variants = {
            default: 'bg-white/95 backdrop-blur-xl',
            glass: 'bg-white/80 backdrop-blur-2xl',
            dark: 'bg-slate-900 text-white',
        }

        return (
            <div
                ref={ref}
                className={cn(
                    // Shape & Background
                    'rounded-[2rem]',
                    variants[variant],
                    // Shadow - Deep multi-layer
                    'shadow-[0_20px_40px_-5px_rgba(0,0,0,0.05),0_8px_20px_-6px_rgba(0,0,0,0.01)]',
                    // Border - Subtle ring
                    'border-0 ring-1 ring-black/[0.03]',
                    // Overflow
                    'overflow-hidden',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
GosiCard.displayName = 'GosiCard'

// ============================================================================
// GOSI INPUT
// ============================================================================
interface GosiInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: 'standard' | 'compact'
}

export const GosiInput = React.forwardRef<HTMLInputElement, GosiInputProps>(
    ({ className, variant = 'standard', ...props }, ref) => {
        const heights = {
            standard: 'h-14', // 56px
            compact: 'h-12',  // 48px
        }

        return (
            <Input
                ref={ref}
                className={cn(
                    // Height
                    heights[variant],
                    // Shape
                    'rounded-2xl',
                    // Background - Filled style
                    'bg-slate-50 hover:bg-slate-100',
                    // Border
                    'border-slate-200/50',
                    // Focus State - Strong ring
                    'focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50',
                    'focus-visible:ring-4 focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500/50',
                    // Typography
                    'font-medium text-slate-900 placeholder:text-slate-400',
                    // Transition
                    'transition-all duration-200',
                    className
                )}
                {...props}
            />
        )
    }
)
GosiInput.displayName = 'GosiInput'

// ============================================================================
// GOSI TEXTAREA
// ============================================================================
interface GosiTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const GosiTextarea = React.forwardRef<HTMLTextAreaElement, GosiTextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <Textarea
                ref={ref}
                className={cn(
                    // Shape
                    'rounded-2xl',
                    // Background - Filled style
                    'bg-slate-50 hover:bg-slate-100',
                    // Border
                    'border-slate-200/50',
                    // Focus State
                    'focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50',
                    'focus-visible:ring-4 focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500/50',
                    // Typography
                    'font-medium text-slate-900 placeholder:text-slate-400',
                    // Size
                    'min-h-[120px]',
                    // Transition
                    'transition-all duration-200',
                    className
                )}
                {...props}
            />
        )
    }
)
GosiTextarea.displayName = 'GosiTextarea'

// ============================================================================
// GOSI LABEL
// ============================================================================
interface GosiLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    icon?: React.ReactNode
}

export const GosiLabel = React.forwardRef<HTMLLabelElement, GosiLabelProps>(
    ({ className, icon, children, ...props }, ref) => {
        return (
            <Label
                ref={ref}
                className={cn(
                    'text-sm font-semibold text-slate-700 flex items-center gap-2',
                    className
                )}
                {...props}
            >
                {icon && <span className="text-emerald-500">{icon}</span>}
                {children}
            </Label>
        )
    }
)
GosiLabel.displayName = 'GosiLabel'

// ============================================================================
// GOSI SELECT
// ============================================================================
interface GosiSelectProps {
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    children: React.ReactNode
    className?: string
    variant?: 'standard' | 'compact'
}

export const GosiSelect = ({
    value,
    onValueChange,
    placeholder,
    children,
    className,
    variant = 'standard',
}: GosiSelectProps) => {
    const heights = {
        standard: 'h-14',
        compact: 'h-12',
    }

    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger
                className={cn(
                    // Height
                    heights[variant],
                    // Shape
                    'rounded-2xl',
                    // Background
                    'bg-slate-50 hover:bg-slate-100',
                    // Border
                    'border-slate-200/50',
                    // Focus
                    'focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50',
                    // Typography
                    'font-medium text-slate-900',
                    // Transition
                    'transition-all duration-200',
                    className
                )}
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                {children}
            </SelectContent>
        </Select>
    )
}

// Re-export SelectItem for convenience
export { SelectItem as GosiSelectItem } from '@/components/ui/select'

// ============================================================================
// GOSI BUTTON
// ============================================================================
interface GosiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
}

export const GosiButton = React.forwardRef<HTMLButtonElement, GosiButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: cn(
                'bg-gradient-to-r from-emerald-600 to-emerald-500',
                'text-white font-semibold',
                'shadow-lg shadow-emerald-500/20',
                'hover:shadow-xl hover:shadow-emerald-500/30',
                'hover:scale-[1.02]',
                'active:scale-[0.98]'
            ),
            secondary: cn(
                'bg-white border-2 border-slate-200',
                'text-slate-700 font-semibold',
                'hover:border-emerald-300 hover:text-emerald-700',
                'hover:bg-emerald-50'
            ),
            ghost: cn(
                'bg-transparent',
                'text-slate-600 font-medium',
                'hover:bg-slate-100 hover:text-slate-900'
            ),
            soft: cn(
                'bg-emerald-50',
                'text-emerald-700 font-semibold',
                'hover:bg-emerald-500 hover:text-white',
                'border border-emerald-100 hover:border-emerald-500'
            ),
            danger: cn(
                'bg-red-50',
                'text-red-600 font-semibold',
                'hover:bg-red-500 hover:text-white',
                'border border-red-100 hover:border-red-500'
            ),
        }

        const sizes = {
            sm: 'h-9 px-4 text-sm rounded-xl',
            md: 'h-11 px-6 text-base rounded-[18px]',
            lg: 'h-14 px-8 text-lg rounded-[20px]',
        }

        return (
            <Button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center gap-2',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : null}
                {children}
            </Button>
        )
    }
)
GosiButton.displayName = 'GosiButton'

// ============================================================================
// GOSI TASK CARD (Clean Slate Pattern)
// ============================================================================
interface GosiTaskCardProps extends React.HTMLAttributes<HTMLDivElement> {
    priority?: 'urgent' | 'high' | 'medium' | 'low'
    isSelected?: boolean
    animationDelay?: number
}

export const GosiTaskCard = React.forwardRef<HTMLDivElement, GosiTaskCardProps>(
    ({ className, priority = 'medium', isSelected, animationDelay = 0, children, ...props }, ref) => {
        const priorityColors = {
            urgent: 'bg-red-500',
            high: 'bg-orange-500',
            medium: 'bg-amber-500',
            low: 'bg-green-500',
        }

        return (
            <div
                ref={ref}
                style={{ animationDelay: `${animationDelay}ms` }}
                className={cn(
                    // Base - Floating Card
                    'relative bg-white rounded-[2rem]',
                    // Gemini Spec: Resting shadow
                    'shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]',
                    // Gemini Spec: Hover shadow + lift
                    'hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1),0_8px_24px_-8px_rgba(0,0,0,0.04)]',
                    'hover:-translate-y-1.5',
                    // Animation - Staggered fade-in
                    'animate-in fade-in slide-in-from-bottom-4 duration-300',
                    // Selection
                    isSelected && 'ring-2 ring-emerald-500 bg-emerald-50/30',
                    // Transition
                    'transition-all duration-300',
                    // Overflow for status strip
                    'overflow-hidden',
                    className
                )}
                {...props}
            >
                {/* Gemini Spec: Status Strip - absolute, w-1.5, left edge */}
                <div className={cn('absolute top-0 bottom-0 start-0 w-1.5', priorityColors[priority])} />

                {/* Content with padding for strip */}
                <div className="ps-4">
                    {children}
                </div>
            </div>
        )
    }
)
GosiTaskCard.displayName = 'GosiTaskCard'

// ============================================================================
// GOSI FILTER BAR (Flexbox Wrap Pattern)
// ============================================================================
interface GosiFilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
    collapsible?: boolean
    collapsed?: boolean
    onToggleCollapse?: () => void
}

export const GosiFilterBar = React.forwardRef<HTMLDivElement, GosiFilterBarProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'flex flex-wrap items-center gap-3',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
GosiFilterBar.displayName = 'GosiFilterBar'

// ============================================================================
// GOSI FILTER SELECT (Smart Width)
// ============================================================================
interface GosiFilterSelectProps {
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    icon?: React.ReactNode
    children: React.ReactNode
    className?: string
    minWidth?: string
}

export const GosiFilterSelect = ({
    value,
    onValueChange,
    placeholder,
    icon,
    children,
    className,
    minWidth = '220px',
}: GosiFilterSelectProps) => {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger
                className={cn(
                    // Gemini Spec: h-14 (56px) height, rounded-2xl
                    'h-14 rounded-2xl',
                    'bg-slate-50 border-slate-200/50',
                    'hover:bg-slate-100 hover:border-emerald-300',
                    'focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50',
                    'font-medium text-slate-900',
                    'transition-all duration-200',
                    className
                )}
                style={{ minWidth }}
            >
                {icon && <span className="text-slate-500 me-2">{icon}</span>}
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                {children}
            </SelectContent>
        </Select>
    )
}

// ============================================================================
// GOSI ICON BOX
// ============================================================================
interface GosiIconBoxProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'soft' | 'emerald' | 'navy'
    size?: 'sm' | 'md' | 'lg'
}

export const GosiIconBox = React.forwardRef<HTMLDivElement, GosiIconBoxProps>(
    ({ className, variant = 'soft', size = 'md', children, ...props }, ref) => {
        const variants = {
            soft: 'bg-slate-50 text-slate-600',
            emerald: 'bg-emerald-50 text-emerald-600',
            navy: 'bg-slate-900 text-white',
        }

        // Gemini Spec: w-14 h-14 (Mobile) / w-16 h-16 (Desktop), rounded-[1.2rem]
        const sizes = {
            sm: 'w-12 h-12 rounded-xl',
            md: 'w-14 h-14 rounded-[1.2rem]',
            lg: 'w-16 h-16 rounded-[1.2rem]',
        }

        return (
            <div
                ref={ref}
                className={cn(
                    'flex items-center justify-center',
                    'shadow-sm',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
GosiIconBox.displayName = 'GosiIconBox'

// ============================================================================
// GOSI PRIORITY BADGE
// ============================================================================
interface GosiPriorityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    priority: 'urgent' | 'high' | 'medium' | 'low'
}

export const GosiPriorityBadge = React.forwardRef<HTMLSpanElement, GosiPriorityBadgeProps>(
    ({ className, priority, ...props }, ref) => {
        const colors = {
            urgent: 'bg-red-100 text-red-700 border-red-200',
            high: 'bg-orange-100 text-orange-700 border-orange-200',
            medium: 'bg-amber-100 text-amber-700 border-amber-200',
            low: 'bg-green-100 text-green-700 border-green-200',
        }

        const labels = {
            urgent: 'عاجل',
            high: 'مرتفع',
            medium: 'متوسط',
            low: 'منخفض',
        }

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center px-3 py-1',
                    'text-xs font-bold rounded-full',
                    'border',
                    colors[priority],
                    className
                )}
                {...props}
            >
                {labels[priority]}
            </span>
        )
    }
)
GosiPriorityBadge.displayName = 'GosiPriorityBadge'
