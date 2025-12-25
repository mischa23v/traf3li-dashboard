/**
 * Next.js Auth Middleware
 * Protects routes based on authentication status
 */

import { NextRequest, NextResponse } from 'next/server';

export interface AuthMiddlewareConfig {
  /** Routes that don't require authentication */
  publicRoutes?: string[];
  /** Routes that require authentication */
  protectedRoutes?: string[];
  /** Login page path */
  loginPage?: string;
  /** Redirect after login */
  afterLoginUrl?: string;
  /** Role-based route access */
  roleBasedRoutes?: Record<string, string[]>;
  /** Cookie name for access token */
  tokenCookieName?: string;
  /** API URL for token verification */
  apiUrl?: string;
}

const DEFAULT_CONFIG: AuthMiddlewareConfig = {
  publicRoutes: ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'],
  protectedRoutes: ['/dashboard/:path*', '/settings/:path*'],
  loginPage: '/sign-in',
  afterLoginUrl: '/dashboard',
  tokenCookieName: 'traf3li_access_token',
};

/**
 * Match route against pattern
 */
function matchRoute(path: string, pattern: string): boolean {
  // Convert Next.js route pattern to regex
  const regexPattern = pattern
    .replace(/\//g, '\\/')
    .replace(/:path\*/g, '.*')
    .replace(/:(\w+)/g, '[^/]+');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

/**
 * Check if route is in list
 */
function isRouteInList(path: string, routes: string[]): boolean {
  return routes.some((pattern) => matchRoute(path, pattern));
}

/**
 * Create auth middleware for Next.js
 */
export function createAuthMiddleware(config: AuthMiddlewareConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async function authMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip API routes and static files
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/static/') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // Check if route is public
    if (finalConfig.publicRoutes && isRouteInList(pathname, finalConfig.publicRoutes)) {
      return NextResponse.next();
    }

    // Check if route is protected
    const isProtected =
      finalConfig.protectedRoutes && isRouteInList(pathname, finalConfig.protectedRoutes);

    if (!isProtected) {
      return NextResponse.next();
    }

    // Get access token from cookie
    const token = request.cookies.get(finalConfig.tokenCookieName!)?.value;

    if (!token) {
      // Redirect to login
      const url = request.nextUrl.clone();
      url.pathname = finalConfig.loginPage!;
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Verify token with API (optional - can be done server-side)
    if (finalConfig.apiUrl) {
      try {
        const response = await fetch(`${finalConfig.apiUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Token invalid, redirect to login
          const url = request.nextUrl.clone();
          url.pathname = finalConfig.loginPage!;
          url.searchParams.set('redirect', pathname);
          return NextResponse.redirect(url);
        }

        const data = await response.json();
        const user = data.user || data.data;

        // Check role-based access
        if (finalConfig.roleBasedRoutes) {
          for (const [pattern, roles] of Object.entries(finalConfig.roleBasedRoutes)) {
            if (matchRoute(pathname, pattern)) {
              if (!roles.includes(user.role)) {
                // User doesn't have required role
                const url = request.nextUrl.clone();
                url.pathname = '/unauthorized';
                return NextResponse.redirect(url);
              }
            }
          }
        }
      } catch {
        // API error, allow through (will be caught by page)
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  };
}

export default createAuthMiddleware;
