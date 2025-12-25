/**
 * Session Manager Component
 */

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '../utils/classNames';
import { Button } from './Button';
import { Alert } from './Alert';
import { Card, CardHeader, CardBody } from './Card';

export interface Session {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser?: string;
  os?: string;
  ip?: string;
  location?: string;
  lastActive: Date | string;
  isCurrent: boolean;
  createdAt: Date | string;
}

export interface SessionManagerProps {
  /** List of sessions */
  sessions: Session[];
  /** On revoke session */
  onRevokeSession: (sessionId: string) => Promise<void>;
  /** On revoke all other sessions */
  onRevokeAllOther?: () => Promise<void>;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Additional class name */
  className?: string;
  /** Labels customization */
  labels?: {
    title?: string;
    subtitle?: string;
    current?: string;
    revoke?: string;
    revokeAll?: string;
    lastActive?: string;
    noSessions?: string;
  };
}

const defaultLabels = {
  title: 'Active Sessions',
  subtitle: 'Manage your active sessions across devices',
  current: 'Current session',
  revoke: 'Revoke',
  revokeAll: 'Revoke all other sessions',
  lastActive: 'Last active',
  noSessions: 'No active sessions found',
};

const deviceIcons: Record<Session['deviceType'], React.ReactNode> = {
  desktop: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  mobile: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  tablet: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  unknown: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
};

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  // Less than a minute
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  // Less than a week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  return d.toLocaleDateString();
}

export function SessionManager({
  sessions,
  onRevokeSession,
  onRevokeAllOther,
  loading = false,
  error,
  className,
  labels: customLabels,
}: SessionManagerProps) {
  const labels = { ...defaultLabels, ...customLabels };
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const handleRevoke = useCallback(
    async (sessionId: string) => {
      setRevokingId(sessionId);
      try {
        await onRevokeSession(sessionId);
      } finally {
        setRevokingId(null);
      }
    },
    [onRevokeSession]
  );

  const handleRevokeAll = useCallback(async () => {
    if (!onRevokeAllOther) return;
    setRevokingAll(true);
    try {
      await onRevokeAllOther();
    } finally {
      setRevokingAll(false);
    }
  }, [onRevokeAllOther]);

  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-xl font-bold text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
          {labels.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--traf-text-secondary,#6b7280)]">
          {labels.subtitle}
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {sessions.length === 0 ? (
        <Card padding="lg">
          <p className="text-center text-[var(--traf-text-secondary,#6b7280)]">
            {labels.noSessions}
          </p>
        </Card>
      ) : (
        <>
          {/* Current Session */}
          {currentSession && (
            <Card>
              <CardBody className="!py-0">
                <div className="flex items-center gap-4 py-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--traf-primary-100,#dbeafe)] dark:bg-[var(--traf-primary-900,#1e3a8a)]/30 flex items-center justify-center text-[var(--traf-primary-600,#2563eb)]">
                    {deviceIcons[currentSession.deviceType]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                        {currentSession.deviceName}
                      </p>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {labels.current}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--traf-text-secondary,#6b7280)]">
                      {[currentSession.browser, currentSession.os].filter(Boolean).join(' • ')}
                      {currentSession.location && ` • ${currentSession.location}`}
                    </p>
                    <p className="text-xs text-[var(--traf-text-secondary,#6b7280)] mt-1">
                      {labels.lastActive}: {formatDate(currentSession.lastActive)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Other Sessions */}
          {otherSessions.length > 0 && (
            <Card>
              <CardBody className="!py-0 divide-y divide-[var(--traf-border-primary,#e5e7eb)] dark:divide-gray-700">
                {otherSessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-4 py-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700 flex items-center justify-center text-[var(--traf-text-secondary,#6b7280)]">
                      {deviceIcons[session.deviceType]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                        {session.deviceName}
                      </p>
                      <p className="text-sm text-[var(--traf-text-secondary,#6b7280)]">
                        {[session.browser, session.os].filter(Boolean).join(' • ')}
                        {session.location && ` • ${session.location}`}
                      </p>
                      <p className="text-xs text-[var(--traf-text-secondary,#6b7280)] mt-1">
                        {labels.lastActive}: {formatDate(session.lastActive)}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={revokingId === session.id}
                      disabled={loading || revokingId !== null}
                      onClick={() => handleRevoke(session.id)}
                    >
                      {labels.revoke}
                    </Button>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {/* Revoke All */}
          {onRevokeAllOther && otherSessions.length > 0 && (
            <div className="text-center">
              <Button
                variant="outline"
                loading={revokingAll}
                disabled={loading}
                onClick={handleRevokeAll}
              >
                {labels.revokeAll}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SessionManager;
