import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

// --- Containers ---

export function GosiCard({ className, children, ...props }: React.ComponentProps<typeof Card>) {
    return (
        <Card
            className={cn(
                // Base: Extremely rounded, no border, white bg with blur
                "rounded-[2rem] border-0 bg-white/90 backdrop-blur-xl",
                // Shadows: Multi-layered sophisticated shadow
                "shadow-[0_20px_40px_-5px_rgba(0,0,0,0.05),0_8px_20px_-6px_rgba(0,0,0,0.01)]",
                // Hover: Lift effect
                "transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-10px_rgba(0,0,0,0.08)]",
                // Glass border effect using box-shadow instead of border to avoid pixel edges
                "ring-1 ring-black/[0.03]",
                className
            )}
            {...props}
        >
            {children}
        </Card>
    )
}

export function GosiCardHeader({ className, children, ...props }: React.ComponentProps<typeof CardHeader>) {
    return (
        <CardHeader
            className={cn("pb-6 border-b border-dashed border-slate-100 mx-6 px-0 pt-8", className)}
            {...props}
        >
            {children}
        </CardHeader>
    )
}

export function GosiCardTitle({ className, children, ...props }: React.ComponentProps<typeof CardTitle>) {
    return (
        <CardTitle
            className={cn("text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3", className)}
            {...props}
        >
            {children}
        </CardTitle>
    )
}

export function GosiCardContent({ className, children, ...props }: React.ComponentProps<typeof CardContent>) {
    return (
        <CardContent
            className={cn("p-8 space-y-8", className)}
            {...props}
        >
            {children}
        </CardContent>
    )
}

// --- Form Elements ---

export function GosiLabel({ className, children, ...props }: React.ComponentProps<typeof Label>) {
    return (
        <Label
            className={cn("text-[0.95rem] font-bold text-slate-600 ms-1 mb-2.5 block tracking-wide", className)}
            {...props}
        >
            {children}
        </Label>
    )
}

export function GosiInput({ className, ...props }: React.ComponentProps<typeof Input>) {
    return (
        <Input
            className={cn(
                // Size: Taller and friendlier (h-14 is approx 56px)
                "h-14 px-6 rounded-2xl",
                // Colors: Slight grey background to pop against white card
                "bg-slate-50 border-2 border-transparent",
                // Typography: Larger text
                "text-base text-slate-900 placeholder:text-slate-400 font-medium",
                // Interactions:
                "transition-all duration-300",
                "hover:bg-slate-100 hover:border-slate-200",
                // Focus: Strong Emerald Ring
                "focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:shadow-emerald-500/5",
                className
            )}
            {...props}
        />
    )
}

export function GosiTextarea({ className, ...props }: React.ComponentProps<typeof Textarea>) {
    return (
        <Textarea
            className={cn(
                "min-h-[140px] px-6 py-5 rounded-2xl",
                "bg-slate-50 border-2 border-transparent",
                "text-base text-slate-900 placeholder:text-slate-400 font-medium resize-none",
                "transition-all duration-300",
                "hover:bg-slate-100 hover:border-slate-200",
                "focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:shadow-emerald-500/5",
                className
            )}
            {...props}
        />
    )
}

// --- Select Wrapper to inject styles into standard Shadcn Select ---

export const GosiSelect = Select
export const GosiSelectValue = SelectValue
export const GosiSelectItem = SelectItem

export function GosiSelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectTrigger>) {
    return (
        <SelectTrigger
            className={cn(
                "h-14 px-6 rounded-2xl",
                "bg-slate-50 border-2 border-transparent",
                "text-base text-slate-900 data-[placeholder]:text-slate-400 font-medium",
                "transition-all duration-300",
                "hover:bg-slate-100 hover:border-slate-200",
                "focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:shadow-emerald-500/5",
                "[&_svg]:size-5 [&_svg]:opacity-50",
                className
            )}
            {...props}
        >
            {children}
        </SelectTrigger>
    )
}

export function GosiSelectContent({ className, children, ...props }: React.ComponentProps<typeof SelectContent>) {
    return (
        <SelectContent
            className={cn(
                "rounded-2xl border-0 shadow-2xl shadow-emerald-900/10 p-2",
                "min-w-[var(--radix-select-trigger-width)]",
                className
            )}
            {...props}
        >
            {children}
        </SelectContent>
    )
}

// --- Buttons ---

export function GosiButton({ className, variant = "default", size = "default", ...props }: React.ComponentProps<typeof Button>) {
    const isPrimary = variant === "default" || variant === "sketch";

    return (
        <Button
            variant={variant}
            size={size}
            className={cn(
                "rounded-[18px] font-bold tracking-wide transition-all duration-300 active:scale-95",
                // Sizes
                size === "lg" && "h-14 px-10 text-lg",
                size === "default" && "h-12 px-6 text-base",
                // Variants
                isPrimary && "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)] hover:to-emerald-400 border-0",
                variant === "outline" && "border-2 border-slate-200 bg-transparent text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 shadow-none",
                className
            )}
            {...props}
        />
    )
}

// --- Icon Box ---

interface GosiIconBoxProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'soft' | 'emerald' | 'navy'
    size?: 'sm' | 'md' | 'lg'
}

export function GosiIconBox({ className, variant = 'soft', size = 'md', children, ...props }: GosiIconBoxProps) {
    const variants = {
        soft: 'bg-slate-50 text-slate-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        navy: 'bg-slate-900 text-white',
    }

    const sizes = {
        sm: 'w-12 h-12 rounded-xl',
        md: 'w-14 h-14 rounded-[1.2rem]',
        lg: 'w-16 h-16 rounded-[1.2rem]',
    }

    return (
        <div
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
