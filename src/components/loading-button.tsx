import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type VariantProps } from 'class-variance-authority'

interface LoadingButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  asChild?: boolean
  children: React.ReactNode
}

function LoadingButton({
  loading = false,
  disabled,
  children,
  className,
  variant,
  size,
  asChild,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn('relative', className)}
      variant={variant}
      size={size}
      asChild={asChild}
      {...props}
    >
      <span className="flex items-center gap-2">
        {loading && (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        )}
        <span className={cn(loading && 'opacity-70')}>{children}</span>
      </span>
    </Button>
  )
}

export { LoadingButton }
export type { LoadingButtonProps }
