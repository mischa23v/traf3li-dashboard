/**
 * Next.js API Route Handlers
 * Pre-built API route handlers for authentication
 */

import { NextRequest, NextResponse } from 'next/server';

export interface AuthRouteHandlerConfig {
  apiUrl: string;
  cookieOptions?: {
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    domain?: string;
    maxAge?: number;
  };
}

const DEFAULT_COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

/**
 * Create auth API route handlers for Next.js App Router
 */
export function createAuthRouteHandler(config: AuthRouteHandlerConfig) {
  const { apiUrl, cookieOptions = {} } = config;
  const finalCookieOptions = { ...DEFAULT_COOKIE_OPTIONS, ...cookieOptions };

  /**
   * Forward request to backend API
   */
  async function forwardRequest(
    request: NextRequest,
    endpoint: string,
    method: string = 'POST'
  ): Promise<NextResponse> {
    try {
      const body = method !== 'GET' ? await request.json().catch(() => ({})) : undefined;
      const token = request.cookies.get('traf3li_access_token')?.value;

      const response = await fetch(`${apiUrl}/api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      // Create response
      const nextResponse = NextResponse.json(data, { status: response.status });

      // Set cookies if tokens are returned
      if (data.accessToken) {
        nextResponse.cookies.set('traf3li_access_token', data.accessToken, {
          httpOnly: true,
          ...finalCookieOptions,
        });
      }

      if (data.refreshToken) {
        nextResponse.cookies.set('traf3li_refresh_token', data.refreshToken, {
          httpOnly: true,
          ...finalCookieOptions,
        });
      }

      return nextResponse;
    } catch (error) {
      return NextResponse.json(
        { error: true, message: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  return {
    /**
     * GET handler for routes that need it
     */
    GET: async (request: NextRequest, { params }: { params: { slug?: string[] } }) => {
      const slug = params.slug?.join('/') || '';

      switch (slug) {
        case 'me':
          return forwardRequest(request, '/auth/me', 'GET');
        case 'sessions':
          return forwardRequest(request, '/auth/sessions', 'GET');
        default:
          return NextResponse.json({ error: true, message: 'Not found' }, { status: 404 });
      }
    },

    /**
     * POST handler for auth routes
     */
    POST: async (request: NextRequest, { params }: { params: { slug?: string[] } }) => {
      const slug = params.slug?.join('/') || '';

      switch (slug) {
        case 'login':
          return forwardRequest(request, '/auth/login');
        case 'register':
          return forwardRequest(request, '/auth/register');
        case 'logout': {
          const response = await forwardRequest(request, '/auth/logout');
          response.cookies.delete('traf3li_access_token');
          response.cookies.delete('traf3li_refresh_token');
          return response;
        }
        case 'refresh':
          return forwardRequest(request, '/auth/refresh');
        case 'forgot-password':
          return forwardRequest(request, '/auth/forgot-password');
        case 'reset-password':
          return forwardRequest(request, '/auth/reset-password');
        case 'send-otp':
          return forwardRequest(request, '/auth/send-otp');
        case 'verify-otp':
          return forwardRequest(request, '/auth/verify-otp');
        case 'magic-link/send':
          return forwardRequest(request, '/auth/magic-link/send');
        case 'magic-link/verify':
          return forwardRequest(request, '/auth/magic-link/verify');
        case 'google/one-tap':
          return forwardRequest(request, '/auth/google/one-tap');
        case 'sso/detect':
          return forwardRequest(request, '/auth/sso/detect');
        case 'mfa/setup':
          return forwardRequest(request, '/auth/mfa/setup');
        case 'mfa/verify':
          return forwardRequest(request, '/auth/mfa/verify');
        case 'mfa/verify-setup':
          return forwardRequest(request, '/auth/mfa/verify-setup');
        case 'mfa/disable':
          return forwardRequest(request, '/auth/mfa/disable');
        default:
          return NextResponse.json({ error: true, message: 'Not found' }, { status: 404 });
      }
    },

    /**
     * DELETE handler for sessions
     */
    DELETE: async (request: NextRequest, { params }: { params: { slug?: string[] } }) => {
      const slug = params.slug?.join('/') || '';

      if (slug.startsWith('sessions/')) {
        const sessionId = slug.replace('sessions/', '');
        return forwardRequest(request, `/auth/sessions/revoke/${sessionId}`, 'DELETE');
      }

      return NextResponse.json({ error: true, message: 'Not found' }, { status: 404 });
    },
  };
}

export default createAuthRouteHandler;
