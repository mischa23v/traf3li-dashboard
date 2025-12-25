/**
 * Next.js Server Utilities
 * Server-side authentication helpers
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { User, Session } from '@traf3li/auth-core';

const DEFAULT_API_URL = process.env.TRAF3LI_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
const TOKEN_COOKIE_NAME = 'traf3li_access_token';

interface ServerAuthConfig {
  apiUrl?: string;
  tokenCookieName?: string;
}

/**
 * Get the current user from server context
 * Returns null if not authenticated
 */
export async function getServerUser(config?: ServerAuthConfig): Promise<User | null> {
  const apiUrl = config?.apiUrl || DEFAULT_API_URL;
  const cookieName = config?.tokenCookieName || TOKEN_COOKIE_NAME;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName)?.value;

    if (!token) {
      return null;
    }

    const response = await fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || data.data || null;
  } catch {
    return null;
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 * For use in Server Components
 */
export async function requireAuth(
  config?: ServerAuthConfig & { redirectTo?: string }
): Promise<User> {
  const user = await getServerUser(config);

  if (!user) {
    redirect(config?.redirectTo || '/sign-in');
  }

  return user;
}

/**
 * Get current session from server context
 */
export async function getServerSession(config?: ServerAuthConfig): Promise<Session | null> {
  const apiUrl = config?.apiUrl || DEFAULT_API_URL;
  const cookieName = config?.tokenCookieName || TOKEN_COOKIE_NAME;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName)?.value;

    if (!token) {
      return null;
    }

    const response = await fetch(`${apiUrl}/api/auth/sessions/current`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.session || data.data || null;
  } catch {
    return null;
  }
}

/**
 * Server action to logout
 */
export async function serverLogout(config?: ServerAuthConfig): Promise<void> {
  const apiUrl = config?.apiUrl || DEFAULT_API_URL;
  const cookieName = config?.tokenCookieName || TOKEN_COOKIE_NAME;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName)?.value;

    if (token) {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Clear cookies
    cookieStore.delete(cookieName);
    cookieStore.delete('traf3li_refresh_token');
  } catch {
    // Ignore errors
  }

  redirect('/sign-in');
}
