/**
 * Backup Codes Display Component
 * MFA backup codes management and display
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { cn } from '../utils/classNames';
import { Button } from './Button';
import { Alert } from './Alert';
import { Card, CardHeader, CardBody, CardFooter } from './Card';

export interface BackupCodesDisplayProps {
  /** Backup codes to display (only shown after generation) */
  codes?: string[] | null;
  /** Number of remaining codes */
  remainingCodes?: number;
  /** Total codes generated */
  totalCodes?: number;
  /** Whether codes have been generated */
  hasBackupCodes?: boolean;
  /** When codes were generated */
  generatedAt?: Date;
  /** Generate new backup codes */
  onGenerate: () => Promise<string[]>;
  /** Regenerate backup codes (replaces existing) */
  onRegenerate?: () => Promise<string[]>;
  /** Clear displayed codes (security) */
  onClearCodes?: () => void;
  /** Download codes as text file */
  onDownload?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Success message */
  success?: string | null;
  /** Additional class name */
  className?: string;
  /** Labels customization */
  labels?: {
    title?: string;
    subtitle?: string;
    generate?: string;
    regenerate?: string;
    copy?: string;
    download?: string;
    hideWarning?: string;
  };
}

export function BackupCodesDisplay({
  codes,
  remainingCodes = 0,
  totalCodes = 10,
  hasBackupCodes = false,
  generatedAt,
  onGenerate,
  onRegenerate,
  onClearCodes,
  onDownload,
  loading = false,
  error,
  success,
  className,
  labels: customLabels,
}: BackupCodesDisplayProps) {
  const labels = {
    title: customLabels?.title || 'Backup Codes',
    subtitle: customLabels?.subtitle || 'Use these codes to sign in if you lose access to your authenticator',
    generate: customLabels?.generate || 'Generate backup codes',
    regenerate: customLabels?.regenerate || 'Generate new codes',
    copy: customLabels?.copy || 'Copy all codes',
    download: customLabels?.download || 'Download codes',
    hideWarning: customLabels?.hideWarning || 'Store these codes in a safe place. They will only be shown once!',
  };

  const [copied, setCopied] = useState(false);
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);
  const codesRef = useRef<HTMLDivElement>(null);

  const handleCopy = useCallback(async () => {
    if (!codes) return;

    const text = codes.join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [codes]);

  const handleDownload = useCallback(() => {
    if (!codes) return;

    const text = [
      'Traf3li Backup Codes',
      '====================',
      '',
      'Store these codes in a safe place.',
      'Each code can only be used once.',
      '',
      ...codes.map((code, i) => `${i + 1}. ${code}`),
      '',
      `Generated: ${new Date().toISOString()}`,
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'traf3li-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [codes]);

  const handleRegenerate = useCallback(async () => {
    if (!onRegenerate) return;
    await onRegenerate();
    setShowConfirmRegenerate(false);
  }, [onRegenerate]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                {labels.title}
              </h2>
              <p className="text-sm text-[var(--traf-text-secondary,#6b7280)]">
                {labels.subtitle}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Codes display */}
          {codes && codes.length > 0 ? (
            <>
              <Alert variant="warning" className="text-sm">
                {labels.hideWarning}
              </Alert>

              <div
                ref={codesRef}
                className="grid grid-cols-2 gap-2 p-4 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700/50 rounded-lg"
              >
                {codes.map((code, index) => (
                  <code
                    key={index}
                    className="px-3 py-2 bg-white dark:bg-gray-800 rounded font-mono text-sm text-center border border-[var(--traf-border-color,#e5e7eb)] dark:border-gray-600"
                  >
                    {code}
                  </code>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {labels.copy}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownload || handleDownload}
                  className="flex-1"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {labels.download}
                </Button>
              </div>

              {onClearCodes && (
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={onClearCodes}
                  className="text-[var(--traf-text-secondary,#6b7280)]"
                >
                  I've saved my codes, hide them
                </Button>
              )}
            </>
          ) : hasBackupCodes ? (
            <>
              {/* Status when codes exist but not displayed */}
              <div className="p-4 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                      Backup codes active
                    </p>
                    <p className="text-sm text-[var(--traf-text-secondary,#6b7280)]">
                      {remainingCodes} of {totalCodes} codes remaining
                    </p>
                    {generatedAt && (
                      <p className="text-xs text-[var(--traf-text-secondary,#6b7280)] mt-1">
                        Generated {formatDate(generatedAt)}
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold',
                      remainingCodes > totalCodes * 0.3
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : remainingCodes > 0
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    )}
                  >
                    {remainingCodes}
                  </div>
                </div>

                {remainingCodes <= 2 && remainingCodes > 0 && (
                  <Alert variant="warning" className="mt-4 text-sm">
                    You're running low on backup codes. Consider regenerating new ones.
                  </Alert>
                )}

                {remainingCodes === 0 && (
                  <Alert variant="error" className="mt-4 text-sm">
                    No backup codes remaining. Generate new codes now.
                  </Alert>
                )}
              </div>

              {/* Regenerate section */}
              {onRegenerate && (
                showConfirmRegenerate ? (
                  <div className="p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg space-y-3">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Are you sure? This will invalidate all existing backup codes.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleRegenerate}
                        loading={loading}
                        className="flex-1"
                      >
                        Yes, regenerate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmRegenerate(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setShowConfirmRegenerate(true)}
                  >
                    {labels.regenerate}
                  </Button>
                )
              )}
            </>
          ) : (
            <>
              {/* No backup codes yet */}
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <p className="text-[var(--traf-text-secondary,#6b7280)] mb-4">
                  Backup codes provide a way to access your account if you lose your phone or can't receive verification codes.
                </p>
              </div>

              <Button
                fullWidth
                onClick={onGenerate}
                loading={loading}
              >
                {labels.generate}
              </Button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default BackupCodesDisplay;
