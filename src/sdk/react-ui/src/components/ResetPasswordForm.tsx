/**
 * Reset Password Form Component
 */

'use client';

import React, { useState, FormEvent, useCallback } from 'react';
import { cn } from '../utils/classNames';
import { Input } from './Input';
import { Button } from './Button';
import { Alert } from './Alert';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

export interface ResetPasswordFormProps {
  /** On submit handler */
  onSubmit: (password: string, confirmPassword: string) => Promise<void>;
  /** On back to login click */
  onBackToLogin?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Success message */
  success?: string | null;
  /** Token from URL (for validation display) */
  token?: string;
  /** Custom title */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
  /** Minimum password length */
  minPasswordLength?: number;
  /** Additional class name */
  className?: string;
  /** Labels customization */
  labels?: {
    password?: string;
    confirmPassword?: string;
    submit?: string;
    backToLogin?: string;
  };
}

const defaultLabels = {
  password: 'New password',
  confirmPassword: 'Confirm new password',
  submit: 'Reset password',
  backToLogin: 'Back to login',
};

export function ResetPasswordForm({
  onSubmit,
  onBackToLogin,
  loading = false,
  error,
  success,
  title = 'Reset your password',
  subtitle = 'Enter your new password below',
  minPasswordLength = 8,
  className,
  labels: customLabels,
}: ResetPasswordFormProps) {
  const labels = { ...defaultLabels, ...customLabels };

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [resetComplete, setResetComplete] = useState(false);

  const validateForm = useCallback(() => {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < minPasswordLength) {
      errors.password = `Password must be at least ${minPasswordLength} characters`;
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [password, confirmPassword, minPasswordLength]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      await onSubmit(password, confirmPassword);
      if (!error) {
        setResetComplete(true);
      }
    },
    [password, confirmPassword, onSubmit, validateForm, error]
  );

  // Success state
  if (resetComplete && success) {
    return (
      <div className={cn('w-full max-w-md mx-auto text-center', className)}>
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[var(--traf-text-primary,#111827)] dark:text-gray-100 mb-2">
          Password reset successful
        </h1>
        <p className="text-[var(--traf-text-secondary,#6b7280)] mb-6">
          Your password has been reset. You can now sign in with your new password.
        </p>

        {onBackToLogin && (
          <Button fullWidth onClick={onBackToLogin}>
            {labels.backToLogin}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[var(--traf-text-secondary,#6b7280)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
          {title}
        </h1>
        <p className="mt-2 text-[var(--traf-text-secondary,#6b7280)]">
          {subtitle}
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Input
            label={labels.password}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            disabled={loading}
            autoComplete="new-password"
            showPasswordToggle
            required
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <Input
          label={labels.confirmPassword}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
          disabled={loading}
          autoComplete="new-password"
          showPasswordToggle
          required
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          loadingText="Resetting..."
        >
          {labels.submit}
        </Button>
      </form>

      {/* Back to login */}
      {onBackToLogin && (
        <p className="mt-6 text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-sm font-medium text-[var(--traf-primary-600,#2563eb)] hover:text-[var(--traf-primary-500,#3b82f6)] focus:outline-none inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {labels.backToLogin}
          </button>
        </p>
      )}
    </div>
  );
}

export default ResetPasswordForm;
