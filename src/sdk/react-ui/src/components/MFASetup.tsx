/**
 * MFA Setup Component
 */

'use client';

import React, { useState, FormEvent, useCallback, useEffect } from 'react';
import { cn } from '../utils/classNames';
import { OTPInput } from './OTPInput';
import { Button } from './Button';
import { Alert } from './Alert';
import { Input } from './Input';
import { Card, CardHeader, CardBody, CardFooter } from './Card';

export type MFASetupMethod = 'totp' | 'sms' | 'email';

export interface MFASetupProps {
  /** MFA method to set up */
  method: MFASetupMethod;
  /** On complete setup */
  onComplete: (code: string, secret?: string) => Promise<void>;
  /** On skip setup */
  onSkip?: () => void;
  /** TOTP secret (for authenticator setup) */
  secret?: string;
  /** TOTP QR code URL */
  qrCodeUrl?: string;
  /** Send verification code (for SMS/email) */
  onSendCode?: (destination: string) => Promise<void>;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Success message */
  success?: string | null;
  /** Code length */
  codeLength?: number;
  /** Additional class name */
  className?: string;
  /** Labels customization */
  labels?: {
    title?: string;
    subtitle?: string;
    verify?: string;
    skip?: string;
    sendCode?: string;
  };
}

const defaultLabels: Record<MFASetupMethod, { title: string; subtitle: string }> = {
  totp: {
    title: 'Set up authenticator app',
    subtitle: 'Scan the QR code with your authenticator app',
  },
  sms: {
    title: 'Set up SMS verification',
    subtitle: 'Enter your phone number to receive verification codes',
  },
  email: {
    title: 'Set up email verification',
    subtitle: 'Verify your email to use it for two-factor authentication',
  },
};

export function MFASetup({
  method,
  onComplete,
  onSkip,
  secret,
  qrCodeUrl,
  onSendCode,
  loading = false,
  error,
  success,
  codeLength = 6,
  className,
  labels: customLabels,
}: MFASetupProps) {
  const methodLabels = defaultLabels[method];
  const labels = {
    title: customLabels?.title || methodLabels.title,
    subtitle: customLabels?.subtitle || methodLabels.subtitle,
    verify: customLabels?.verify || 'Verify and enable',
    skip: customLabels?.skip || 'Skip for now',
    sendCode: customLabels?.sendCode || 'Send verification code',
  };

  const [step, setStep] = useState<'input' | 'verify'>(method === 'totp' ? 'verify' : 'input');
  const [destination, setDestination] = useState('');
  const [code, setCode] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const handleSendCode = useCallback(async () => {
    if (!onSendCode || !destination.trim()) return;

    setSendingCode(true);
    try {
      await onSendCode(destination);
      setStep('verify');
    } finally {
      setSendingCode(false);
    }
  }, [onSendCode, destination]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (code.length !== codeLength) return;
      await onComplete(code, secret);
    },
    [code, codeLength, onComplete, secret]
  );

  // TOTP Setup
  if (method === 'totp') {
    return (
      <div className={cn('w-full max-w-md mx-auto', className)}>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
              {labels.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--traf-text-secondary,#6b7280)]">
              {labels.subtitle}
            </p>
          </CardHeader>

          <CardBody className="space-y-6">
            {error && <Alert variant="error">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {/* QR Code */}
            <div className="flex justify-center">
              {qrCodeUrl ? (
                <div className="p-4 bg-white rounded-lg border">
                  <img
                    src={qrCodeUrl}
                    alt="Scan this QR code with your authenticator app"
                    className="w-48 h-48"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-[var(--traf-text-secondary,#6b7280)] animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Manual entry */}
            {secret && (
              <div className="space-y-2">
                <p className="text-sm text-[var(--traf-text-secondary,#6b7280)] text-center">
                  Can't scan? Enter this key manually:
                </p>
                <div className="relative">
                  <code
                    className={cn(
                      'block p-3 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700 rounded-lg text-center font-mono text-sm break-all',
                      !showSecret && 'blur-sm select-none'
                    )}
                  >
                    {secret}
                  </code>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute inset-0 flex items-center justify-center bg-transparent hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {!showSecret && (
                      <span className="text-sm font-medium text-[var(--traf-primary-600,#2563eb)]">
                        Click to reveal
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Verification code */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <OTPInput
                label="Enter the 6-digit code from your app"
                length={codeLength}
                value={code}
                onChange={setCode}
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
          </CardBody>

          {onSkip && (
            <CardFooter>
              <button
                type="button"
                onClick={onSkip}
                className="w-full text-sm font-medium text-[var(--traf-text-secondary,#6b7280)] hover:text-[var(--traf-text-primary,#111827)] focus:outline-none"
              >
                {labels.skip}
              </button>
            </CardFooter>
          )}
        </Card>
      </div>
    );
  }

  // SMS/Email Setup
  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
            {labels.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--traf-text-secondary,#6b7280)]">
            {labels.subtitle}
          </p>
        </CardHeader>

        <CardBody className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {step === 'input' ? (
            <div className="space-y-4">
              <Input
                label={method === 'sms' ? 'Phone number' : 'Email address'}
                type={method === 'sms' ? 'tel' : 'email'}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={method === 'sms' ? '+1 (555) 123-4567' : 'you@example.com'}
                disabled={sendingCode}
              />

              <Button
                fullWidth
                loading={sendingCode}
                disabled={!destination.trim()}
                onClick={handleSendCode}
                loadingText="Sending..."
              >
                {labels.sendCode}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Alert variant="info">
                We sent a verification code to{' '}
                <span className="font-medium">{destination}</span>
              </Alert>

              <OTPInput
                label="Enter verification code"
                length={codeLength}
                value={code}
                onChange={setCode}
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

              <button
                type="button"
                onClick={() => setStep('input')}
                className="w-full text-sm font-medium text-[var(--traf-primary-600,#2563eb)] hover:text-[var(--traf-primary-500,#3b82f6)] focus:outline-none"
              >
                Change {method === 'sms' ? 'phone number' : 'email'}
              </button>
            </form>
          )}
        </CardBody>

        {onSkip && (
          <CardFooter>
            <button
              type="button"
              onClick={onSkip}
              className="w-full text-sm font-medium text-[var(--traf-text-secondary,#6b7280)] hover:text-[var(--traf-text-primary,#111827)] focus:outline-none"
            >
              {labels.skip}
            </button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default MFASetup;
