/**
 * Linked Accounts Manager Component
 * OAuth/Social account linking management
 */

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '../utils/classNames';
import { Button } from './Button';
import { Alert } from './Alert';
import { Card, CardHeader, CardBody } from './Card';

export interface LinkedAccount {
  id: string;
  provider: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  linkedAt: Date;
}

export interface AvailableProvider {
  id: string;
  name: string;
  icon?: React.ReactNode;
  color?: string;
}

export interface LinkedAccountsManagerProps {
  /** List of linked accounts */
  linkedAccounts?: LinkedAccount[];
  /** Available providers to link */
  availableProviders?: AvailableProvider[];
  /** Link a new provider */
  onLink: (provider: string) => Promise<void>;
  /** Unlink a provider */
  onUnlink: (provider: string) => Promise<void>;
  /** Minimum linked accounts required (can't unlink if at limit) */
  minLinkedAccounts?: number;
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
    noAccounts?: string;
    link?: string;
    unlink?: string;
    cantUnlink?: string;
  };
}

const defaultProviders: AvailableProvider[] = [
  {
    id: 'google',
    name: 'Google',
    color: '#EA4335',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
        <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
        <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
        <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7## C1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    color: '#333',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    color: '#00A4EF',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 21 21">
        <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
        <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
        <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
      </svg>
    ),
  },
  {
    id: 'apple',
    name: 'Apple',
    color: '#000',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
      </svg>
    ),
  },
  {
    id: 'twitter',
    name: 'Twitter',
    color: '#1DA1F2',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
];

export function LinkedAccountsManager({
  linkedAccounts = [],
  availableProviders = defaultProviders,
  onLink,
  onUnlink,
  minLinkedAccounts = 1,
  loading = false,
  error,
  success,
  className,
  labels: customLabels,
}: LinkedAccountsManagerProps) {
  const labels = {
    title: customLabels?.title || 'Linked Accounts',
    subtitle: customLabels?.subtitle || 'Connect your accounts to sign in faster',
    noAccounts: customLabels?.noAccounts || 'No accounts linked yet',
    link: customLabels?.link || 'Link',
    unlink: customLabels?.unlink || 'Unlink',
    cantUnlink: customLabels?.cantUnlink || 'You need at least one linked account',
  };

  const [confirmUnlink, setConfirmUnlink] = useState<string | null>(null);

  const getProviderInfo = (providerId: string): AvailableProvider => {
    return (
      availableProviders.find((p) => p.id === providerId) || {
        id: providerId,
        name: providerId.charAt(0).toUpperCase() + providerId.slice(1),
      }
    );
  };

  const isProviderLinked = (providerId: string) => {
    return linkedAccounts.some((a) => a.provider === providerId);
  };

  const canUnlink = linkedAccounts.length > minLinkedAccounts;

  const handleUnlink = useCallback(
    async (provider: string) => {
      await onUnlink(provider);
      setConfirmUnlink(null);
    },
    [onUnlink]
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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

          {/* Linked accounts */}
          {linkedAccounts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--traf-text-secondary,#6b7280)]">
                Connected accounts
              </h3>
              {linkedAccounts.map((account) => {
                const provider = getProviderInfo(account.provider);
                return (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: provider.color ? `${provider.color}20` : '#f3f4f6' }}
                      >
                        {provider.icon || (
                          <span className="text-lg font-bold" style={{ color: provider.color }}>
                            {provider.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                          {provider.name}
                        </p>
                        <p className="text-sm text-[var(--traf-text-secondary,#6b7280)]">
                          {account.email || account.name || `Linked ${formatDate(account.linkedAt)}`}
                        </p>
                      </div>
                    </div>
                    {confirmUnlink === account.provider ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmUnlink(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleUnlink(account.provider)}
                          loading={loading}
                          className="!bg-red-600 hover:!bg-red-700"
                        >
                          Confirm
                        </Button>
                      </div>
                    ) : canUnlink ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmUnlink(account.provider)}
                        className="text-red-500 hover:text-red-700"
                      >
                        {labels.unlink}
                      </Button>
                    ) : (
                      <span className="text-xs text-[var(--traf-text-secondary,#6b7280)]">
                        Primary
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Available providers to link */}
          {availableProviders.filter((p) => !isProviderLinked(p.id)).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--traf-text-secondary,#6b7280)]">
                Available to connect
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {availableProviders
                  .filter((p) => !isProviderLinked(p.id))
                  .map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => onLink(provider.id)}
                      disabled={loading}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border border-[var(--traf-border-color,#e5e7eb)] dark:border-gray-600',
                        'hover:bg-[var(--traf-bg-secondary,#f9fafb)] dark:hover:bg-gray-700/50',
                        'focus:outline-none focus:ring-2 focus:ring-[var(--traf-primary-500,#3b82f6)]',
                        'transition-colors disabled:opacity-50'
                      )}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: provider.color ? `${provider.color}20` : '#f3f4f6' }}
                      >
                        {provider.icon || (
                          <span className="text-sm font-bold" style={{ color: provider.color }}>
                            {provider.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                        {provider.name}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {linkedAccounts.length === 0 && (
            <div className="text-center py-6 text-[var(--traf-text-secondary,#6b7280)]">
              {labels.noAccounts}
            </div>
          )}

          {!canUnlink && linkedAccounts.length > 0 && (
            <p className="text-xs text-center text-[var(--traf-text-secondary,#6b7280)]">
              {labels.cantUnlink}
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default LinkedAccountsManager;
