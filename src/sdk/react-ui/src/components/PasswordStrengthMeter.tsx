/**
 * Password Strength Meter Component
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '../utils/classNames';
import { checkPasswordStrength, PasswordStrength } from '../utils/validation';

export interface PasswordStrengthMeterProps {
  /** Password to check */
  password: string;
  /** Show feedback text */
  showFeedback?: boolean;
  /** Show strength label */
  showLabel?: boolean;
  /** Additional class name */
  className?: string;
  /** Custom labels */
  labels?: Record<PasswordStrength['label'], string>;
}

const defaultLabels: Record<PasswordStrength['label'], string> = {
  'very-weak': 'Very Weak',
  'weak': 'Weak',
  'fair': 'Fair',
  'strong': 'Strong',
  'very-strong': 'Very Strong',
};

const strengthColors: Record<number, string> = {
  0: 'bg-red-500',
  1: 'bg-orange-500',
  2: 'bg-yellow-500',
  3: 'bg-lime-500',
  4: 'bg-green-500',
};

export function PasswordStrengthMeter({
  password,
  showFeedback = true,
  showLabel = true,
  className,
  labels = defaultLabels,
}: PasswordStrengthMeterProps) {
  const strength = useMemo(() => checkPasswordStrength(password), [password]);

  if (!password) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength bars */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              level <= strength.score
                ? strengthColors[strength.score]
                : 'bg-gray-200 dark:bg-gray-700'
            )}
          />
        ))}
      </div>

      {/* Strength label */}
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--traf-text-secondary,#6b7280)]">Password strength:</span>
          <span
            className={cn(
              'font-medium',
              strength.score <= 1 && 'text-red-500',
              strength.score === 2 && 'text-yellow-500',
              strength.score >= 3 && 'text-green-500'
            )}
          >
            {labels[strength.label]}
          </span>
        </div>
      )}

      {/* Feedback */}
      {showFeedback && strength.feedback.length > 0 && (
        <ul className="text-sm text-[var(--traf-text-secondary,#6b7280)] space-y-1">
          {strength.feedback.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-[var(--traf-warning-500,#f59e0b)]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PasswordStrengthMeter;
