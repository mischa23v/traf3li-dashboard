/**
 * Divider Component
 */

'use client';

import React, { ReactNode } from 'react';
import { cn } from '../utils/classNames';

export interface DividerProps {
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Text to display in the middle */
  children?: ReactNode;
  /** Additional class name */
  className?: string;
}

export function Divider({
  orientation = 'horizontal',
  children,
  className,
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          'w-px bg-[var(--traf-border-primary,#e5e7eb)] dark:bg-gray-700 self-stretch',
          className
        )}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (children) {
    return (
      <div
        className={cn('flex items-center gap-4', className)}
        role="separator"
      >
        <div className="flex-1 h-px bg-[var(--traf-border-primary,#e5e7eb)] dark:bg-gray-700" />
        <span className="text-sm text-[var(--traf-text-secondary,#6b7280)] whitespace-nowrap">
          {children}
        </span>
        <div className="flex-1 h-px bg-[var(--traf-border-primary,#e5e7eb)] dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <hr
      className={cn(
        'border-0 h-px bg-[var(--traf-border-primary,#e5e7eb)] dark:bg-gray-700',
        className
      )}
    />
  );
}

export default Divider;
