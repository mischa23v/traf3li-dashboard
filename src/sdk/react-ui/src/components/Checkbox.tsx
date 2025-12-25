/**
 * Checkbox Component
 */

'use client';

import React, { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/classNames';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Checkbox label */
  label?: ReactNode;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Checkbox size */
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    checkbox: 'h-4 w-4',
    label: 'text-sm',
  },
  md: {
    checkbox: 'h-5 w-5',
    label: 'text-base',
  },
  lg: {
    checkbox: 'h-6 w-6',
    label: 'text-lg',
  },
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || props.name || `checkbox-${Math.random().toString(36).slice(2)}`;
    const styles = sizeStyles[size];

    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <div className="flex items-start gap-3">
          <div className="flex items-center h-6">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              disabled={disabled}
              className={cn(
                'rounded border transition-colors cursor-pointer',
                'bg-[var(--traf-bg-primary,#ffffff)] dark:bg-gray-800',
                error
                  ? 'border-[var(--traf-error-500,#ef4444)]'
                  : 'border-[var(--traf-border-secondary,#d1d5db)]',
                'text-[var(--traf-primary-600,#2563eb)]',
                'focus:ring-2 focus:ring-[var(--traf-primary-500,#3b82f6)] focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                styles.checkbox
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined}
              {...props}
            />
          </div>

          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'cursor-pointer select-none',
                'text-[var(--traf-text-primary,#111827)] dark:text-gray-100',
                disabled && 'opacity-50 cursor-not-allowed',
                styles.label
              )}
            >
              {label}
            </label>
          )}
        </div>

        {error && (
          <p id={`${checkboxId}-error`} className="text-sm text-[var(--traf-error-500,#ef4444)] ms-8" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${checkboxId}-helper`} className="text-sm text-[var(--traf-text-secondary,#6b7280)] ms-8">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
