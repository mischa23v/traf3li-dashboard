/**
 * OTP Input Component
 * A multi-digit input for OTP/verification codes
 */

'use client';

import React, { useRef, useState, useCallback, KeyboardEvent, ClipboardEvent, useEffect } from 'react';
import { cn } from '../utils/classNames';

export interface OTPInputProps {
  /** Number of digits */
  length?: number;
  /** Current value */
  value?: string;
  /** On change callback */
  onChange?: (value: string) => void;
  /** On complete callback (when all digits are filled) */
  onComplete?: (value: string) => void;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Auto focus first input */
  autoFocus?: boolean;
  /** Input type (number or text) */
  type?: 'number' | 'text';
  /** Additional class name */
  className?: string;
  /** Label */
  label?: string;
  /** Helper text */
  helperText?: string;
}

export function OTPInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  error = false,
  errorMessage,
  disabled = false,
  autoFocus = true,
  type = 'number',
  className,
  label,
  helperText,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [internalValue, setInternalValue] = useState<string[]>(
    value.split('').concat(Array(length - value.length).fill(''))
  );

  // Sync with external value
  useEffect(() => {
    const newValue = value.split('').concat(Array(length - value.length).fill(''));
    setInternalValue(newValue.slice(0, length));
  }, [value, length]);

  // Focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      // Only allow single digit/character
      const digit = type === 'number'
        ? inputValue.replace(/\D/g, '').slice(-1)
        : inputValue.slice(-1);

      const newValue = [...internalValue];
      newValue[index] = digit;
      setInternalValue(newValue);

      const combinedValue = newValue.join('');
      onChange?.(combinedValue);

      // Move to next input if digit entered
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Check if complete
      if (combinedValue.length === length && !combinedValue.includes('')) {
        onComplete?.(combinedValue);
      }
    },
    [internalValue, length, onChange, onComplete, type]
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      // Handle backspace
      if (e.key === 'Backspace') {
        if (!internalValue[index] && index > 0) {
          // Move to previous input if current is empty
          inputRefs.current[index - 1]?.focus();
        } else {
          // Clear current input
          handleChange(index, '');
        }
      }

      // Handle arrow keys
      if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === 'ArrowRight' && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    },
    [internalValue, length, handleChange]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text');
      const cleanedData = type === 'number'
        ? pastedData.replace(/\D/g, '')
        : pastedData;
      const digits = cleanedData.slice(0, length).split('');

      const newValue = [...internalValue];
      digits.forEach((digit, i) => {
        if (i < length) {
          newValue[i] = digit;
        }
      });

      setInternalValue(newValue);
      const combinedValue = newValue.join('');
      onChange?.(combinedValue);

      // Focus the next empty input or last input
      const nextEmptyIndex = newValue.findIndex((v) => !v);
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();

      // Check if complete
      if (combinedValue.length === length && !combinedValue.includes('')) {
        onComplete?.(combinedValue);
      }
    },
    [internalValue, length, onChange, onComplete, type]
  );

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  }, []);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label className="text-sm font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
          {label}
        </label>
      )}

      <div className="flex gap-2 justify-center" dir="ltr">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type={type === 'number' ? 'tel' : 'text'}
            inputMode={type === 'number' ? 'numeric' : 'text'}
            pattern={type === 'number' ? '[0-9]*' : undefined}
            maxLength={1}
            value={internalValue[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={handleFocus}
            disabled={disabled}
            className={cn(
              'w-12 h-14 text-center text-xl font-semibold rounded-lg border transition-all',
              'bg-[var(--traf-bg-primary,#ffffff)] dark:bg-gray-800',
              'text-[var(--traf-text-primary,#111827)] dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-opacity-50',
              error
                ? 'border-[var(--traf-error-500,#ef4444)] focus:ring-[var(--traf-error-500,#ef4444)]'
                : 'border-[var(--traf-border-primary,#e5e7eb)] focus:border-[var(--traf-primary-500,#3b82f6)] focus:ring-[var(--traf-primary-500,#3b82f6)]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {errorMessage && (
        <p className="text-sm text-center text-[var(--traf-error-500,#ef4444)]" role="alert">
          {errorMessage}
        </p>
      )}

      {helperText && !errorMessage && (
        <p className="text-sm text-center text-[var(--traf-text-secondary,#6b7280)]">
          {helperText}
        </p>
      )}
    </div>
  );
}

export default OTPInput;
