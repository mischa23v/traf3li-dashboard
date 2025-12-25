/**
 * API Key Manager Component
 * Create, view, and manage API keys
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { cn } from '../utils/classNames';
import { Button } from './Button';
import { Alert } from './Alert';
import { Input } from './Input';
import { Card, CardHeader, CardBody } from './Card';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsed?: Date;
  expiresAt?: Date;
  createdAt: Date;
  isActive: boolean;
}

export interface CreateApiKeyData {
  name: string;
  scopes?: string[];
  expiresIn?: number; // days
}

export interface ApiKeyManagerProps {
  /** List of API keys */
  apiKeys?: ApiKey[];
  /** Available scopes */
  availableScopes?: { id: string; name: string; description?: string }[];
  /** Create new API key */
  onCreate: (data: CreateApiKeyData) => Promise<{ key: string } & ApiKey>;
  /** Revoke API key */
  onRevoke: (id: string) => Promise<void>;
  /** Regenerate API key */
  onRegenerate?: (id: string) => Promise<{ key: string } & ApiKey>;
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
    create?: string;
    noKeys?: string;
  };
}

export function ApiKeyManager({
  apiKeys = [],
  availableScopes = [
    { id: 'read', name: 'Read', description: 'Read access to resources' },
    { id: 'write', name: 'Write', description: 'Write access to resources' },
    { id: 'delete', name: 'Delete', description: 'Delete resources' },
    { id: 'admin', name: 'Admin', description: 'Full administrative access' },
  ],
  onCreate,
  onRevoke,
  onRegenerate,
  loading = false,
  error,
  success,
  className,
  labels: customLabels,
}: ApiKeyManagerProps) {
  const labels = {
    title: customLabels?.title || 'API Keys',
    subtitle: customLabels?.subtitle || 'Manage your API keys for programmatic access',
    create: customLabels?.create || 'Create API Key',
    noKeys: customLabels?.noKeys || 'No API keys created yet',
  };

  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read']);
  const [expiresIn, setExpiresIn] = useState<string>('90');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const keyInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = useCallback(async () => {
    if (!newKeyName.trim()) return;

    const result = await onCreate({
      name: newKeyName,
      scopes: selectedScopes,
      expiresIn: expiresIn ? parseInt(expiresIn) : undefined,
    });

    setCreatedKey(result.key);
    setNewKeyName('');
    setSelectedScopes(['read']);
  }, [newKeyName, selectedScopes, expiresIn, onCreate]);

  const handleCopyKey = useCallback(async () => {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [createdKey]);

  const handleRevoke = useCallback(
    async (id: string) => {
      await onRevoke(id);
      setConfirmRevoke(null);
    },
    [onRevoke]
  );

  const handleRegenerate = useCallback(
    async (id: string) => {
      if (!onRegenerate) return;
      const result = await onRegenerate(id);
      setCreatedKey(result.key);
    },
    [onRegenerate]
  );

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return formatDate(date);
  };

  const isExpired = (expiresAt?: Date) => {
    if (!expiresAt) return false;
    return new Date() > expiresAt;
  };

  const getExpiryStatus = (expiresAt?: Date) => {
    if (!expiresAt) return { text: 'Never expires', color: 'text-green-600 dark:text-green-400' };
    if (isExpired(expiresAt)) return { text: 'Expired', color: 'text-red-600 dark:text-red-400' };
    const days = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 7) return { text: `Expires in ${days} days`, color: 'text-amber-600 dark:text-amber-400' };
    return { text: `Expires ${formatDate(expiresAt)}`, color: 'text-[var(--traf-text-secondary,#6b7280)]' };
  };

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--traf-primary-100,#dbeafe)] dark:bg-[var(--traf-primary-900,#1e3a5f)] flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--traf-primary-600,#2563eb)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {!showCreate && !createdKey && (
              <Button onClick={() => setShowCreate(true)} size="sm">
                {labels.create}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardBody className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* New Key Display */}
          {createdKey && (
            <div className="p-4 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-3">
              <Alert variant="warning" className="text-sm">
                Make sure to copy your API key now. You won't be able to see it again!
              </Alert>
              <div className="flex items-center gap-2">
                <Input
                  ref={keyInputRef}
                  value={createdKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopyKey} variant="outline">
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => {
                  setCreatedKey(null);
                  setShowCreate(false);
                }}
              >
                I've copied the key, close this
              </Button>
            </div>
          )}

          {/* Create Form */}
          {showCreate && !createdKey && (
            <div className="p-4 border border-[var(--traf-border-color,#e5e7eb)] dark:border-gray-600 rounded-lg space-y-4">
              <Input
                label="API Key Name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production Server"
              />

              <div>
                <label className="block text-sm font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100 mb-2">
                  Scopes
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableScopes.map((scope) => (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => toggleScope(scope.id)}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-full border transition-colors',
                        selectedScopes.includes(scope.id)
                          ? 'bg-[var(--traf-primary-500,#3b82f6)] text-white border-[var(--traf-primary-500,#3b82f6)]'
                          : 'border-[var(--traf-border-color,#e5e7eb)] dark:border-gray-600 text-[var(--traf-text-secondary,#6b7280)] hover:border-[var(--traf-primary-500,#3b82f6)]'
                      )}
                      title={scope.description}
                    >
                      {scope.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100 mb-2">
                  Expiration
                </label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--traf-border-color,#e5e7eb)] dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[var(--traf-text-primary,#111827)] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--traf-primary-500,#3b82f6)]"
                >
                  <option value="">Never expires</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  fullWidth
                  onClick={handleCreate}
                  loading={loading}
                  disabled={!newKeyName.trim() || selectedScopes.length === 0}
                >
                  Create API Key
                </Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* API Keys List */}
          {apiKeys.length > 0 ? (
            <div className="space-y-3">
              {apiKeys.map((apiKey) => {
                const expiry = getExpiryStatus(apiKey.expiresAt);
                const expired = isExpired(apiKey.expiresAt);
                return (
                  <div
                    key={apiKey.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      !apiKey.isActive || expired
                        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
                        : 'border-[var(--traf-border-color,#e5e7eb)] dark:border-gray-600 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700/50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                            {apiKey.name}
                          </p>
                          {(!apiKey.isActive || expired) && (
                            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded">
                              {!apiKey.isActive ? 'Revoked' : 'Expired'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-mono text-[var(--traf-text-secondary,#6b7280)]">
                          {apiKey.prefix}...
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--traf-text-secondary,#6b7280)]">
                          <span>Created {formatDate(apiKey.createdAt)}</span>
                          <span>•</span>
                          <span className={expiry.color}>{expiry.text}</span>
                          {apiKey.lastUsed && (
                            <>
                              <span>•</span>
                              <span>Last used {formatRelativeTime(apiKey.lastUsed)}</span>
                            </>
                          )}
                        </div>
                        {apiKey.scopes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {apiKey.scopes.map((scope) => (
                              <span
                                key={scope}
                                className="px-2 py-0.5 text-xs bg-[var(--traf-primary-100,#dbeafe)] text-[var(--traf-primary-700,#1d4ed8)] dark:bg-[var(--traf-primary-900,#1e3a5f)] dark:text-[var(--traf-primary-300,#93c5fd)] rounded"
                              >
                                {scope}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {apiKey.isActive && !expired && (
                        <div className="flex items-center gap-2">
                          {onRegenerate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRegenerate(apiKey.id)}
                              title="Regenerate key"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </Button>
                          )}
                          {confirmRevoke === apiKey.id ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setConfirmRevoke(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleRevoke(apiKey.id)}
                                loading={loading}
                                className="!bg-red-600 hover:!bg-red-700"
                              >
                                Confirm
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmRevoke(apiKey.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !showCreate && !createdKey ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <p className="text-[var(--traf-text-secondary,#6b7280)] mb-4">{labels.noKeys}</p>
              <Button onClick={() => setShowCreate(true)}>{labels.create}</Button>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}

export default ApiKeyManager;
