/**
 * Passkey Setup Component
 * WebAuthn/FIDO2 credential management
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '../utils/classNames';
import { Button } from './Button';
import { Alert } from './Alert';
import { Input } from './Input';
import { Card, CardHeader, CardBody, CardFooter } from './Card';

export interface PasskeyCredential {
  id: string;
  name: string;
  deviceType: 'platform' | 'cross-platform';
  lastUsed?: Date;
  createdAt: Date;
}

export interface PasskeySetupProps {
  /** List of registered passkeys */
  credentials?: PasskeyCredential[];
  /** Whether WebAuthn is supported */
  isSupported?: boolean;
  /** Whether platform authenticator is available */
  isPlatformAvailable?: boolean;
  /** On register new passkey */
  onRegister: (name: string, type: 'platform' | 'cross-platform') => Promise<void>;
  /** On delete passkey */
  onDelete?: (id: string) => Promise<void>;
  /** On update passkey name */
  onUpdateName?: (id: string, name: string) => Promise<void>;
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
    registerPlatform?: string;
    registerCrossPlatform?: string;
    noPasskeys?: string;
    unsupported?: string;
  };
}

export function PasskeySetup({
  credentials = [],
  isSupported = true,
  isPlatformAvailable = false,
  onRegister,
  onDelete,
  onUpdateName,
  loading = false,
  error,
  success,
  className,
  labels: customLabels,
}: PasskeySetupProps) {
  const labels = {
    title: customLabels?.title || 'Passkeys',
    subtitle: customLabels?.subtitle || 'Use your fingerprint, face, or device PIN to sign in securely',
    registerPlatform: customLabels?.registerPlatform || 'Add this device',
    registerCrossPlatform: customLabels?.registerCrossPlatform || 'Add security key',
    noPasskeys: customLabels?.noPasskeys || 'No passkeys registered yet',
    unsupported: customLabels?.unsupported || 'Passkeys are not supported in this browser',
  };

  const [showRegister, setShowRegister] = useState(false);
  const [passkeyName, setPasskeyName] = useState('');
  const [registerType, setRegisterType] = useState<'platform' | 'cross-platform'>('platform');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleRegister = useCallback(async () => {
    if (!passkeyName.trim()) return;
    await onRegister(passkeyName, registerType);
    setShowRegister(false);
    setPasskeyName('');
  }, [passkeyName, registerType, onRegister]);

  const handleUpdateName = useCallback(async () => {
    if (!editingId || !editName.trim() || !onUpdateName) return;
    await onUpdateName(editingId, editName);
    setEditingId(null);
    setEditName('');
  }, [editingId, editName, onUpdateName]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (!isSupported) {
    return (
      <div className={cn('w-full max-w-md mx-auto', className)}>
        <Card>
          <CardBody className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-[var(--traf-text-secondary,#6b7280)]">{labels.unsupported}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--traf-primary-100,#dbeafe)] dark:bg-[var(--traf-primary-900,#1e3a5f)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--traf-primary-600,#2563eb)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
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

          {/* Registered passkeys list */}
          {credentials.length > 0 ? (
            <div className="space-y-3">
              {credentials.map((credential) => (
                <div
                  key={credential.id}
                  className="flex items-center justify-between p-3 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--traf-primary-100,#dbeafe)] dark:bg-[var(--traf-primary-900,#1e3a5f)] flex items-center justify-center">
                      {credential.deviceType === 'platform' ? (
                        <svg className="w-4 h-4 text-[var(--traf-primary-600,#2563eb)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-[var(--traf-primary-600,#2563eb)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      {editingId === credential.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="!py-1 !text-sm"
                            autoFocus
                          />
                          <Button size="sm" onClick={handleUpdateName} loading={loading}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                            {credential.name}
                          </p>
                          <p className="text-xs text-[var(--traf-text-secondary,#6b7280)]">
                            Added {formatDate(credential.createdAt)}
                            {credential.lastUsed && ` • Last used ${formatDate(credential.lastUsed)}`}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  {editingId !== credential.id && (
                    <div className="flex items-center gap-2">
                      {onUpdateName && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(credential.id);
                            setEditName(credential.name);
                          }}
                          className="p-1 text-[var(--traf-text-secondary,#6b7280)] hover:text-[var(--traf-text-primary,#111827)] focus:outline-none"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(credential.id)}
                          className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-[var(--traf-text-secondary,#6b7280)]">
              {labels.noPasskeys}
            </div>
          )}

          {/* Register new passkey */}
          {showRegister ? (
            <div className="space-y-4 p-4 border border-[var(--traf-border-color,#e5e7eb)] dark:border-gray-600 rounded-lg">
              <Input
                label="Passkey name"
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                placeholder="e.g., My MacBook Pro"
              />

              <div className="flex gap-2">
                {isPlatformAvailable && (
                  <Button
                    variant={registerType === 'platform' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setRegisterType('platform')}
                    className="flex-1"
                  >
                    This device
                  </Button>
                )}
                <Button
                  variant={registerType === 'cross-platform' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setRegisterType('cross-platform')}
                  className="flex-1"
                >
                  Security key
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  fullWidth
                  onClick={handleRegister}
                  loading={loading}
                  disabled={!passkeyName.trim()}
                >
                  Register passkey
                </Button>
                <Button variant="ghost" onClick={() => setShowRegister(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              {isPlatformAvailable && (
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => {
                    setRegisterType('platform');
                    setShowRegister(true);
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                  {labels.registerPlatform}
                </Button>
              )}
              <Button
                fullWidth
                variant="outline"
                onClick={() => {
                  setRegisterType('cross-platform');
                  setShowRegister(true);
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {labels.registerCrossPlatform}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default PasskeySetup;
