/**
 * Input Component
 */

'use client';

import React, { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { cn } from '../utils/classNames';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Left addon/icon */
  leftAddon?: ReactNode;
  /** Right addon/icon */
  rightAddon?: ReactNode;
  /** Show password toggle (for password inputs) */
  showPasswordToggle?: boolean;
  /** Required field indicator */
  required?: boolean;
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      fullWidth = true,
      leftAddon,
      rightAddon,
      showPasswordToggle,
      required,
      className,
      type,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const hasRightContent = rightAddon || (isPassword && showPasswordToggle);

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100"
          >
            {label}
            {required && <span className="text-[var(--traf-error-500,#ef4444)] ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {leftAddon && (
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-[var(--traf-text-secondary,#6b7280)]">
              {leftAddon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            className={cn(
              // Base styles
              'block w-full rounded-lg border transition-all duration-200',
              'bg-[var(--traf-bg-primary,#ffffff)] dark:bg-gray-800',
              'text-[var(--traf-text-primary,#111827)] dark:text-gray-100',
              'placeholder:text-[var(--traf-text-secondary,#6b7280)]',
              // Border
              error
                ? 'border-[var(--traf-error-500,#ef4444)] focus:ring-[var(--traf-error-500,#ef4444)]'
                : 'border-[var(--traf-border-primary,#e5e7eb)] focus:border-[var(--traf-primary-500,#3b82f6)] focus:ring-[var(--traf-primary-500,#3b82f6)]',
              // Focus
              'focus:outline-none focus:ring-2 focus:ring-opacity-50',
              // Disabled
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--traf-bg-secondary,#f9fafb)]',
              // Size
              sizeStyles[size],
              // Padding adjustments for addons
              leftAddon && 'ps-10',
              hasRightContent && 'pe-10',
              // Custom classes
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />

          {hasRightContent && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3">
              {isPassword && showPasswordToggle ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[var(--traf-text-secondary,#6b7280)] hover:text-[var(--traf-text-primary,#111827)] focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              ) : (
                <span className="text-[var(--traf-text-secondary,#6b7280)]">{rightAddon}</span>
              )}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-sm text-[var(--traf-error-500,#ef4444)]" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-[var(--traf-text-secondary,#6b7280)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
