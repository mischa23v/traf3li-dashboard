/**
 * Security Dashboard Component
 * Login history, security events, and account security overview
 */

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '../utils/classNames';
import { Button } from './Button';
import { Alert } from './Alert';
import { Card, CardHeader, CardBody } from './Card';

export interface LoginHistoryEntry {
  id: string;
  timestamp: Date;
  ip: string;
  location?: string;
  device: string;
  browser?: string;
  os?: string;
  success: boolean;
  mfaUsed: boolean;
  method: 'password' | 'otp' | 'magic_link' | 'oauth' | 'webauthn' | 'saml';
  provider?: string;
  isSuspicious: boolean;
}

export interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  ip?: string;
  location?: string;
  resolved?: boolean;
}

export interface SecurityStats {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  suspiciousActivities: number;
  lastLogin?: Date;
  lastFailedLogin?: Date;
  uniqueDevices: number;
  uniqueLocations: number;
}

export interface SecurityDashboardProps {
  /** Login history entries */
  loginHistory?: LoginHistoryEntry[];
  /** Security events */
  securityEvents?: SecurityEvent[];
  /** Security statistics */
  stats?: SecurityStats | null;
  /** Report suspicious activity */
  onReportSuspicious?: (loginId: string) => Promise<void>;
  /** Resolve security event */
  onResolveEvent?: (eventId: string) => Promise<void>;
  /** Refresh data */
  onRefresh?: () => Promise<void>;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Additional class name */
  className?: string;
  /** Active tab */
  defaultTab?: 'overview' | 'history' | 'events';
  /** Labels customization */
  labels?: {
    title?: string;
    overview?: string;
    loginHistory?: string;
    securityEvents?: string;
    noHistory?: string;
    noEvents?: string;
  };
}

const severityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const methodLabels: Record<string, string> = {
  password: 'Password',
  otp: 'One-Time Password',
  magic_link: 'Magic Link',
  oauth: 'Social Login',
  webauthn: 'Passkey',
  saml: 'SSO',
};

export function SecurityDashboard({
  loginHistory = [],
  securityEvents = [],
  stats,
  onReportSuspicious,
  onResolveEvent,
  onRefresh,
  loading = false,
  error,
  className,
  defaultTab = 'overview',
  labels: customLabels,
}: SecurityDashboardProps) {
  const labels = {
    title: customLabels?.title || 'Security',
    overview: customLabels?.overview || 'Overview',
    loginHistory: customLabels?.loginHistory || 'Login History',
    securityEvents: customLabels?.securityEvents || 'Security Events',
    noHistory: customLabels?.noHistory || 'No login history available',
    noEvents: customLabels?.noEvents || 'No security events',
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'events'>(defaultTab);
  const [reportingId, setReportingId] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
  };

  const handleReportSuspicious = useCallback(
    async (loginId: string) => {
      if (!onReportSuspicious) return;
      setReportingId(loginId);
      try {
        await onReportSuspicious(loginId);
      } finally {
        setReportingId(null);
      }
    },
    [onReportSuspicious]
  );

  const unresolvedEvents = securityEvents.filter((e) => !e.resolved);
  const criticalEvents = securityEvents.filter((e) => e.severity === 'critical' && !e.resolved);

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--traf-primary-100,#dbeafe)] dark:bg-[var(--traf-primary-900,#1e3a5f)] flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--traf-primary-600,#2563eb)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                {labels.title}
              </h2>
            </div>
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh} loading={loading}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 p-1 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700/50 rounded-lg">
            {(['overview', 'history', 'events'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors',
                  activeTab === tab
                    ? 'bg-white dark:bg-gray-800 text-[var(--traf-text-primary,#111827)] dark:text-gray-100 shadow-sm'
                    : 'text-[var(--traf-text-secondary,#6b7280)] hover:text-[var(--traf-text-primary,#111827)]'
                )}
              >
                {tab === 'overview' && labels.overview}
                {tab === 'history' && labels.loginHistory}
                {tab === 'events' && (
                  <span className="flex items-center justify-center gap-2">
                    {labels.securityEvents}
                    {unresolvedEvents.length > 0 && (
                      <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                        {unresolvedEvents.length}
                      </span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardBody className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          {/* Critical alerts */}
          {criticalEvents.length > 0 && (
            <Alert variant="error">
              <strong>Security Alert:</strong> You have {criticalEvents.length} critical security{' '}
              {criticalEvents.length === 1 ? 'event' : 'events'} requiring attention.
            </Alert>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                      {stats.totalLogins}
                    </p>
                    <p className="text-xs text-[var(--traf-text-secondary,#6b7280)]">Total Logins</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.successfulLogins}
                    </p>
                    <p className="text-xs text-[var(--traf-text-secondary,#6b7280)]">Successful</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {stats.failedLogins}
                    </p>
                    <p className="text-xs text-[var(--traf-text-secondary,#6b7280)]">Failed</p>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {stats.suspiciousActivities}
                    </p>
                    <p className="text-xs text-[var(--traf-text-secondary,#6b7280)]">Suspicious</p>
                  </div>
                </div>
              )}

              {/* Quick Info */}
              <div className="space-y-3">
                {stats?.lastLogin && (
                  <div className="flex items-center justify-between p-3 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-[var(--traf-text-secondary,#6b7280)]">Last successful login</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                      {formatRelativeTime(stats.lastLogin)}
                    </span>
                  </div>
                )}
                {stats?.lastFailedLogin && (
                  <div className="flex items-center justify-between p-3 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-[var(--traf-text-secondary,#6b7280)]">Last failed login</span>
                    </div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {formatRelativeTime(stats.lastFailedLogin)}
                    </span>
                  </div>
                )}
                {stats && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-[var(--traf-primary-500,#3b82f6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-[var(--traf-text-secondary,#6b7280)]">Unique devices</span>
                      </div>
                      <span className="text-sm font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                        {stats.uniqueDevices}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-[var(--traf-primary-500,#3b82f6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm text-[var(--traf-text-secondary,#6b7280)]">Unique locations</span>
                      </div>
                      <span className="text-sm font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                        {stats.uniqueLocations}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Login History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {loginHistory.length > 0 ? (
                loginHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      entry.isSuspicious
                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                        : entry.success
                        ? 'border-[var(--traf-border-color,#e5e7eb)] dark:border-gray-600 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700/50'
                        : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            entry.success
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : 'bg-red-100 dark:bg-red-900/30'
                          )}
                        >
                          {entry.success ? (
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                            {entry.success ? 'Successful login' : 'Failed login'}
                            {entry.mfaUsed && ' (with MFA)'}
                          </p>
                          <p className="text-sm text-[var(--traf-text-secondary,#6b7280)]">
                            {entry.device} {entry.browser && `• ${entry.browser}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--traf-text-secondary,#6b7280)]">
                            <span>{entry.ip}</span>
                            {entry.location && (
                              <>
                                <span>•</span>
                                <span>{entry.location}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{methodLabels[entry.method] || entry.method}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--traf-text-secondary,#6b7280)]">
                          {formatRelativeTime(entry.timestamp)}
                        </p>
                        {entry.isSuspicious && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded">
                            Suspicious
                          </span>
                        )}
                      </div>
                    </div>
                    {!entry.isSuspicious && onReportSuspicious && entry.success && (
                      <div className="mt-3 pt-3 border-t border-[var(--traf-border-color,#e5e7eb)] dark:border-gray-600">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReportSuspicious(entry.id)}
                          loading={reportingId === entry.id}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          Not you? Report as suspicious
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[var(--traf-text-secondary,#6b7280)]">
                  {labels.noHistory}
                </div>
              )}
            </div>
          )}

          {/* Security Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              {securityEvents.length > 0 ? (
                securityEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      event.resolved
                        ? 'border-[var(--traf-border-color,#e5e7eb)] dark:border-gray-600 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700/50 opacity-60'
                        : 'border-[var(--traf-border-color,#e5e7eb)] dark:border-gray-600 bg-[var(--traf-bg-secondary,#f9fafb)] dark:bg-gray-700/50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className={cn('px-2 py-0.5 text-xs font-medium rounded', severityColors[event.severity])}>
                          {event.severity.toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                            {event.type}
                          </p>
                          <p className="text-sm text-[var(--traf-text-secondary,#6b7280)]">
                            {event.description}
                          </p>
                          {(event.ip || event.location) && (
                            <p className="text-xs text-[var(--traf-text-secondary,#6b7280)] mt-1">
                              {event.ip}
                              {event.location && ` • ${event.location}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--traf-text-secondary,#6b7280)]">
                          {formatRelativeTime(event.timestamp)}
                        </p>
                        {event.resolved && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded">
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>
                    {!event.resolved && onResolveEvent && (
                      <div className="mt-3 pt-3 border-t border-[var(--traf-border-color,#e5e7eb)] dark:border-gray-600">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onResolveEvent(event.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Mark as resolved
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[var(--traf-text-secondary,#6b7280)]">
                  <svg className="w-12 h-12 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {labels.noEvents}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default SecurityDashboard;
