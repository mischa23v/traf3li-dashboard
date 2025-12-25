/**
 * useSecurityLogs Hook
 * Security events and login history
 */

import { useState, useCallback } from 'react';
import { useTrafAuthContext } from '../provider';

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
  riskScore?: number;
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
  metadata?: Record<string, unknown>;
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

export interface UseSecurityLogsReturn {
  /** Login history */
  loginHistory: LoginHistoryEntry[];
  /** Security events */
  securityEvents: SecurityEvent[];
  /** Security statistics */
  stats: SecurityStats | null;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Fetch login history */
  getLoginHistory: (options?: { limit?: number; offset?: number }) => Promise<LoginHistoryEntry[]>;
  /** Fetch security events */
  getSecurityEvents: (options?: { severity?: string; limit?: number }) => Promise<SecurityEvent[]>;
  /** Get security statistics */
  getStats: () => Promise<SecurityStats>;
  /** Report suspicious activity */
  reportSuspicious: (loginId: string) => Promise<void>;
  /** Mark event as resolved */
  resolveEvent: (eventId: string) => Promise<void>;
}

export function useSecurityLogs(): UseSecurityLogsReturn {
  const { client, isAuthenticated } = useTrafAuthContext();
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch login history
  const getLoginHistory = useCallback(
    async (options?: { limit?: number; offset?: number }): Promise<LoginHistoryEntry[]> => {
      if (!isAuthenticated) return [];

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (options?.limit) params.set('limit', options.limit.toString());
        if (options?.offset) params.set('offset', options.offset.toString());

        const response = await fetch(
          `${client['config'].apiUrl}/api/audit-logs/user/${(await client.getUser())?.id}?${params}`,
          {
            headers: {
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch login history');
        }

        const data = await response.json();
        const history = (data.logs || data.history || []).map((entry: any) => ({
          id: entry.id || entry._id,
          timestamp: new Date(entry.timestamp || entry.createdAt),
          ip: entry.ip || entry.ipAddress,
          location: entry.location,
          device: entry.device || entry.deviceName || 'Unknown device',
          browser: entry.browser,
          os: entry.os,
          success: entry.success !== false,
          mfaUsed: entry.mfaUsed || entry.mfa || false,
          method: entry.method || entry.authMethod || 'password',
          provider: entry.provider,
          riskScore: entry.riskScore,
          isSuspicious: entry.isSuspicious || entry.suspicious || false,
        }));

        setLoginHistory(history);
        return history;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch history';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, isAuthenticated]
  );

  // Fetch security events
  const getSecurityEvents = useCallback(
    async (options?: { severity?: string; limit?: number }): Promise<SecurityEvent[]> => {
      if (!isAuthenticated) return [];

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (options?.severity) params.set('severity', options.severity);
        if (options?.limit) params.set('limit', options.limit.toString());

        const response = await fetch(
          `${client['config'].apiUrl}/api/audit-logs/security?${params}`,
          {
            headers: {
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch security events');
        }

        const data = await response.json();
        const events = (data.events || data.logs || []).map((event: any) => ({
          id: event.id || event._id,
          type: event.type || event.action,
          severity: event.severity || 'medium',
          timestamp: new Date(event.timestamp || event.createdAt),
          description: event.description || event.message,
          ip: event.ip || event.ipAddress,
          location: event.location,
          metadata: event.metadata || event.details,
          resolved: event.resolved || false,
        }));

        setSecurityEvents(events);
        return events;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch events';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, isAuthenticated]
  );

  // Get security statistics
  const getStats = useCallback(async (): Promise<SecurityStats> => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${client['config'].apiUrl}/api/auth/sessions/stats`, {
        headers: {
          Authorization: `Bearer ${await client.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      const statsData: SecurityStats = {
        totalLogins: data.totalLogins || 0,
        successfulLogins: data.successfulLogins || 0,
        failedLogins: data.failedLogins || 0,
        suspiciousActivities: data.suspiciousActivities || 0,
        lastLogin: data.lastLogin ? new Date(data.lastLogin) : undefined,
        lastFailedLogin: data.lastFailedLogin ? new Date(data.lastFailedLogin) : undefined,
        uniqueDevices: data.uniqueDevices || 0,
        uniqueLocations: data.uniqueLocations || 0,
      };

      setStats(statsData);
      return statsData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, isAuthenticated]);

  // Report suspicious activity
  const reportSuspicious = useCallback(
    async (loginId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${client['config'].apiUrl}/api/audit-logs/${loginId}/report-suspicious`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to report');
        }

        // Update local state
        setLoginHistory((prev) =>
          prev.map((entry) =>
            entry.id === loginId ? { ...entry, isSuspicious: true } : entry
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to report';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Mark event as resolved
  const resolveEvent = useCallback(
    async (eventId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${client['config'].apiUrl}/api/security/incidents/${eventId}/acknowledge`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to resolve event');
        }

        setSecurityEvents((prev) =>
          prev.map((event) =>
            event.id === eventId ? { ...event, resolved: true } : event
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to resolve';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return {
    loginHistory,
    securityEvents,
    stats,
    loading,
    error,
    getLoginHistory,
    getSecurityEvents,
    getStats,
    reportSuspicious,
    resolveEvent,
  };
}

export default useSecurityLogs;
