import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'file:text-slate-700 placeholder:text-slate-400 selection:bg-emerald-100 selection:text-emerald-900 border-slate-200 flex h-11 w-full min-w-0 rounded-xl border bg-white px-4 py-2 text-base transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
        'aria-invalid:ring-2 aria-invalid:ring-red-500 aria-invalid:border-red-500',
        className
      )}
      {...props}
    />
  )
}

export { Input }
