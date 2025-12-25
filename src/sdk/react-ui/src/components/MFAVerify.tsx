/**
 * MFA Verify Component
 */

'use client';

import React, { useState, FormEvent, useCallback } from 'react';
import { cn } from '../utils/classNames';
import { OTPInput } from './OTPInput';
import { Button } from './Button';
import { Alert } from './Alert';

export type MFAMethod = 'totp' | 'sms' | 'email';

export interface MFAVerifyProps {
  /** MFA method */
  method: MFAMethod;
  /** On verify handler */
  onVerify: (code: string) => Promise<void>;
  /** On resend code (for SMS/email) */
  onResend?: () => Promise<void>;
  /** On use different method */
  onUseAnotherMethod?: () => void;
  /** On cancel */
  onCancel?: () => void;
  /** Phone number hint (for SMS) */
  phoneHint?: string;
  /** Email hint (for email) */
  emailHint?: string;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Code length */
  codeLength?: number;
  /** Resend cooldown in seconds */
  resendCooldown?: number;
  /** Additional class name */
  className?: string;
  /** Labels customization */
  labels?: {
    title?: string;
    subtitle?: string;
    verify?: string;
    resend?: string;
    useAnother?: string;
    cancel?: string;
  };
}

const defaultLabels: Record<MFAMethod, { title: string; subtitle: string }> = {
  totp: {
    title: 'Two-factor authentication',
    subtitle: 'Enter the 6-digit code from your authenticator app',
  },
  sms: {
    title: 'Verify your phone',
    subtitle: 'Enter the verification code sent to your phone',
  },
  email: {
    title: 'Verify your email',
    subtitle: 'Enter the verification code sent to your email',
  },
};

const methodIcons: Record<MFAMethod, React.ReactNode> = {
  totp: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  sms: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  email: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

export function MFAVerify({
  method,
  onVerify,
  onResend,
  onUseAnotherMethod,
  onCancel,
  phoneHint,
  emailHint,
  loading = false,
  error,
  codeLength = 6,
  resendCooldown = 60,
  className,
  labels: customLabels,
}: MFAVerifyProps) {
  const methodLabels = defaultLabels[method];
  const labels = {
    title: customLabels?.title || methodLabels.title,
    subtitle: customLabels?.subtitle || methodLabels.subtitle,
    verify: customLabels?.verify || 'Verify',
    resend: customLabels?.resend || 'Resend code',
    useAnother: customLabels?.useAnother || 'Use a different method',
    cancel: customLabels?.cancel || 'Cancel',
  };

  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (code.length !== codeLength) return;
      await onVerify(code);
    },
    [code, codeLength, onVerify]
  );

  const handleResend = useCallback(async () => {
    if (!onResend || resendTimer > 0) return;

    setResending(true);
    try {
      await onResend();
      setResendTimer(resendCooldown);

      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } finally {
      setResending(false);
    }
  }, [onResend, resendTimer, resendCooldown]);

  const hint = method === 'sms' ? phoneHint : method === 'email' ? emailHint : null;

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[var(--traf-primary-100,#dbeafe)] dark:bg-[var(--traf-primary-900,#1e3a8a)]/30 flex items-center justify-center text-[var(--traf-primary-600,#2563eb)]">
            {methodIcons[method]}
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
          {labels.title}
        </h1>
        <p className="mt-2 text-[var(--traf-text-secondary,#6b7280)]">
          {labels.subtitle}
          {hint && (
            <span className="block mt-1 font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
              {hint}
            </span>
          )}
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <OTPInput
          length={codeLength}
          value={code}
          onChange={setCode}
          onComplete={(value) => {
            setCode(value);
            if (value.length === codeLength) {
              onVerify(value);
            }
          }}
          error={!!error}
          disabled={loading}
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={code.length !== codeLength}
          loadingText="Verifying..."
        >
          {labels.verify}
        </Button>
      </form>

      {/* Actions */}
      <div className="mt-6 space-y-3">
        {/* Resend (for SMS/email) */}
        {onResend && method !== 'totp' && (
          <p className="text-center text-sm text-[var(--traf-text-secondary,#6b7280)]">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0 || resending}
              className={cn(
                'font-medium focus:outline-none',
                resendTimer > 0 || resending
                  ? 'text-[var(--traf-text-disabled,#9ca3af)] cursor-not-allowed'
                  : 'text-[var(--traf-primary-600,#2563eb)] hover:text-[var(--traf-primary-500,#3b82f6)]'
              )}
            >
              {resending
                ? 'Sending...'
                : resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : labels.resend}
            </button>
          </p>
        )}

        {/* Use another method */}
        {onUseAnotherMethod && (
          <button
            type="button"
            onClick={onUseAnotherMethod}
            className="w-full text-sm font-medium text-[var(--traf-primary-600,#2563eb)] hover:text-[var(--traf-primary-500,#3b82f6)] focus:outline-none"
          >
            {labels.useAnother}
          </button>
        )}

        {/* Cancel */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full text-sm font-medium text-[var(--traf-text-secondary,#6b7280)] hover:text-[var(--traf-text-primary,#111827)] focus:outline-none"
          >
            {labels.cancel}
          </button>
        )}
      </div>
    </div>
  );
}

export default MFAVerify;
