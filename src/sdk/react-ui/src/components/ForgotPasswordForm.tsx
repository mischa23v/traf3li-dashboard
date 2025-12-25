/**
 * Forgot Password Form Component
 */

'use client';

import React, { useState, FormEvent, useCallback } from 'react';
import { cn } from '../utils/classNames';
import { Input } from './Input';
import { Button } from './Button';
import { Alert } from './Alert';

export interface ForgotPasswordFormProps {
  /** On submit handler */
  onSubmit: (email: string) => Promise<void>;
  /** On back to login click */
  onBackToLogin?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Success message */
  success?: string | null;
  /** Custom title */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
  /** Additional class name */
  className?: string;
  /** Labels customization */
  labels?: {
    email?: string;
    submit?: string;
    backToLogin?: string;
  };
}

const defaultLabels = {
  email: 'Email address',
  submit: 'Send reset link',
  backToLogin: 'Back to login',
};

export function ForgotPasswordForm({
  onSubmit,
  onBackToLogin,
  loading = false,
  error,
  success,
  title = 'Forgot your password?',
  subtitle = "Enter your email and we'll send you a reset link",
  className,
  labels: customLabels,
}: ForgotPasswordFormProps) {
  const labels = { ...defaultLabels, ...customLabels };

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);

  const validateForm = useCallback(() => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError(undefined);
    return true;
  }, [email]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      await onSubmit(email);
      setSubmitted(true);
    },
    [email, onSubmit, validateForm]
  );

  // Success state
  if (submitted && success) {
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[var(--traf-text-primary,#111827)] dark:text-gray-100 mb-2">
          Check your email
        </h1>
        <p className="text-[var(--traf-text-secondary,#6b7280)] mb-6">
          We've sent a password reset link to{' '}
          <span className="font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
            {email}
          </span>
        </p>

        <Alert variant="info" className="mb-6 text-start">
          Didn't receive the email? Check your spam folder or{' '}
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="font-medium text-[var(--traf-primary-600,#2563eb)] hover:underline"
          >
            try again
          </button>
        </Alert>

        {onBackToLogin && (
          <Button variant="outline" fullWidth onClick={onBackToLogin}>
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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
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
        <Input
          label={labels.email}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          disabled={loading}
          autoComplete="email"
          placeholder="you@example.com"
          required
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          loadingText="Sending..."
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

export default ForgotPasswordForm;
