/**
 * Button Component
 */

'use client';

import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/classNames';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading text */
  loadingText?: string;
  /** Icon to show before text */
  leftIcon?: ReactNode;
  /** Icon to show after text */
  rightIcon?: ReactNode;
}

const variantStyles = {
  primary: `
    bg-[var(--traf-primary-600,#2563eb)] hover:bg-[var(--traf-primary-700,#1d4ed8)]
    text-white border-transparent
    focus:ring-[var(--traf-primary-500,#3b82f6)]
  `,
  secondary: `
    bg-[var(--traf-bg-tertiary,#f3f4f6)] hover:bg-[var(--traf-border-primary,#e5e7eb)]
    text-[var(--traf-text-primary,#111827)] border-transparent
    focus:ring-[var(--traf-primary-500,#3b82f6)]
    dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100
  `,
  outline: `
    bg-transparent hover:bg-[var(--traf-bg-secondary,#f9fafb)]
    text-[var(--traf-primary-600,#2563eb)] border-[var(--traf-primary-600,#2563eb)]
    focus:ring-[var(--traf-primary-500,#3b82f6)]
    dark:hover:bg-gray-800
  `,
  ghost: `
    bg-transparent hover:bg-[var(--traf-bg-secondary,#f9fafb)]
    text-[var(--traf-text-primary,#111827)] border-transparent
    focus:ring-[var(--traf-primary-500,#3b82f6)]
    dark:hover:bg-gray-800 dark:text-gray-100
  `,
  danger: `
    bg-[var(--traf-error-600,#dc2626)] hover:bg-[var(--traf-error-700,#b91c1c)]
    text-white border-transparent
    focus:ring-[var(--traf-error-500,#ef4444)]
  `,
  success: `
    bg-[var(--traf-success-600,#16a34a)] hover:bg-[var(--traf-success-700,#15803d)]
    text-white border-transparent
    focus:ring-[var(--traf-success-500,#22c55e)]
  `,
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium rounded-lg border',
          'transition-all duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          // Custom classes
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
