/**
 * useWebhooks Hook
 * Webhook management for auth events
 */

import { useState, useCallback } from 'react';
import { useTrafAuthContext } from '../provider';

export type WebhookEvent =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.login'
  | 'user.logout'
  | 'user.password_changed'
  | 'user.email_verified'
  | 'user.mfa_enabled'
  | 'user.mfa_disabled'
  | 'session.created'
  | 'session.revoked'
  | 'token.refreshed'
  | 'organization.created'
  | 'organization.updated'
  | 'organization.member_added'
  | 'organization.member_removed'
  | 'security.suspicious_activity'
  | 'security.account_locked'
  | 'security.password_reset_requested';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  enabled: boolean;
  headers?: Record<string, string>;
  retryPolicy?: {
    maxRetries: number;
    retryDelayMs: number;
  };
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  successCount: number;
  failureCount: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  statusCode?: number;
  requestBody: Record<string, unknown>;
  responseBody?: string;
  error?: string;
  duration?: number;
  attempts: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface CreateWebhookData {
  name: string;
  url: string;
  events: WebhookEvent[];
  headers?: Record<string, string>;
  retryPolicy?: {
    maxRetries: number;
    retryDelayMs: number;
  };
}

export interface UseWebhooksReturn {
  /** List of webhooks */
  webhooks: Webhook[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Get all webhooks */
  getWebhooks: () => Promise<Webhook[]>;
  /** Create a new webhook */
  createWebhook: (data: CreateWebhookData) => Promise<Webhook>;
  /** Update a webhook */
  updateWebhook: (id: string, data: Partial<CreateWebhookData>) => Promise<Webhook>;
  /** Delete a webhook */
  deleteWebhook: (id: string) => Promise<void>;
  /** Enable/disable a webhook */
  toggleWebhook: (id: string, enabled: boolean) => Promise<void>;
  /** Rotate webhook secret */
  rotateSecret: (id: string) => Promise<string>;
  /** Test webhook delivery */
  testWebhook: (id: string) => Promise<{ success: boolean; response?: string }>;
  /** Get webhook deliveries */
  getDeliveries: (webhookId: string, options?: { limit?: number }) => Promise<WebhookDelivery[]>;
  /** Retry failed delivery */
  retryDelivery: (webhookId: string, deliveryId: string) => Promise<void>;
  /** Get available events */
  getAvailableEvents: () => WebhookEvent[];
}

const AVAILABLE_EVENTS: WebhookEvent[] = [
  'user.created',
  'user.updated',
  'user.deleted',
  'user.login',
  'user.logout',
  'user.password_changed',
  'user.email_verified',
  'user.mfa_enabled',
  'user.mfa_disabled',
  'session.created',
  'session.revoked',
  'token.refreshed',
  'organization.created',
  'organization.updated',
  'organization.member_added',
  'organization.member_removed',
  'security.suspicious_activity',
  'security.account_locked',
  'security.password_reset_requested',
];

export function useWebhooks(): UseWebhooksReturn {
  const { client, isAuthenticated } = useTrafAuthContext();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all webhooks
  const getWebhooks = useCallback(async (): Promise<Webhook[]> => {
    if (!isAuthenticated) return [];

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${client['config'].apiUrl}/api/webhooks`, {
        headers: {
          Authorization: `Bearer ${await client.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch webhooks');
      }

      const data = await response.json();
      const hooks = (data.webhooks || []).map((w: any) => ({
        ...w,
        createdAt: new Date(w.createdAt),
        updatedAt: new Date(w.updatedAt),
        lastTriggered: w.lastTriggered ? new Date(w.lastTriggered) : undefined,
      }));

      setWebhooks(hooks);
      return hooks;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch webhooks';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, isAuthenticated]);

  // Create webhook
  const createWebhook = useCallback(
    async (data: CreateWebhookData): Promise<Webhook> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/webhooks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create webhook');
        }

        const result = await response.json();
        const newWebhook = {
          ...result.webhook,
          createdAt: new Date(result.webhook.createdAt),
          updatedAt: new Date(result.webhook.updatedAt),
        };

        setWebhooks((prev) => [...prev, newWebhook]);
        return newWebhook;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create webhook';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Update webhook
  const updateWebhook = useCallback(
    async (id: string, data: Partial<CreateWebhookData>): Promise<Webhook> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/webhooks/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update webhook');
        }

        const result = await response.json();
        const updatedWebhook = {
          ...result.webhook,
          createdAt: new Date(result.webhook.createdAt),
          updatedAt: new Date(result.webhook.updatedAt),
        };

        setWebhooks((prev) => prev.map((w) => (w.id === id ? updatedWebhook : w)));
        return updatedWebhook;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update webhook';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Delete webhook
  const deleteWebhook = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/webhooks/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete webhook');
        }

        setWebhooks((prev) => prev.filter((w) => w.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete webhook';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Toggle webhook enabled/disabled
  const toggleWebhook = useCallback(
    async (id: string, enabled: boolean): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/webhooks/${id}/toggle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
          body: JSON.stringify({ enabled }),
        });

        if (!response.ok) {
          throw new Error('Failed to toggle webhook');
        }

        setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, enabled } : w)));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to toggle webhook';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Rotate webhook secret
  const rotateSecret = useCallback(
    async (id: string): Promise<string> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/webhooks/${id}/rotate-secret`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to rotate secret');
        }

        const result = await response.json();
        return result.secret;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to rotate secret';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Test webhook
  const testWebhook = useCallback(
    async (id: string): Promise<{ success: boolean; response?: string }> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${client['config'].apiUrl}/api/webhooks/${id}/test`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${await client.getAccessToken()}`,
          },
        });

        const result = await response.json();
        return {
          success: response.ok,
          response: result.response || result.message,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Test failed';
        setError(message);
        return { success: false, response: message };
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Get webhook deliveries
  const getDeliveries = useCallback(
    async (webhookId: string, options?: { limit?: number }): Promise<WebhookDelivery[]> => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (options?.limit) params.set('limit', options.limit.toString());

        const response = await fetch(
          `${client['config'].apiUrl}/api/webhooks/${webhookId}/deliveries?${params}`,
          {
            headers: {
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch deliveries');
        }

        const data = await response.json();
        return (data.deliveries || []).map((d: any) => ({
          ...d,
          createdAt: new Date(d.createdAt),
          completedAt: d.completedAt ? new Date(d.completedAt) : undefined,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch deliveries';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Retry failed delivery
  const retryDelivery = useCallback(
    async (webhookId: string, deliveryId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${client['config'].apiUrl}/api/webhooks/${webhookId}/deliveries/${deliveryId}/retry`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${await client.getAccessToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to retry delivery');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Retry failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // Get available events
  const getAvailableEvents = useCallback(() => AVAILABLE_EVENTS, []);

  return {
    webhooks,
    loading,
    error,
    getWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    toggleWebhook,
    rotateSecret,
    testWebhook,
    getDeliveries,
    retryDelivery,
    getAvailableEvents,
  };
}

export default useWebhooks;
