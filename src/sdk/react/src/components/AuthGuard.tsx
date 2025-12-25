/**
 * AuthGuard Component
 * Protects routes that require authentication
 */

import React, { ReactNode, useEffect } from 'react';
import { useTrafAuthContext } from '../provider';

export interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireMfa?: boolean;
  requireEmailVerified?: boolean;
  requiredRoles?: string[];
  redirectTo?: string;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
  onUnauthorized?: () => void;
}

/**
 * Auth Guard Component
 */
export function AuthGuard({
  children,
  requireAuth = true,
  requireMfa = false,
  requireEmailVerified = false,
  requiredRoles,
  redirectTo = '/sign-in',
  loadingComponent,
  unauthorizedComponent,
  onUnauthorized,
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, mfaPending } = useTrafAuthContext();

  // Handle redirect
  useEffect(() => {
    if (isLoading) return;

    let shouldRedirect = false;
    let redirectUrl = redirectTo;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      shouldRedirect = true;
    }

    // Check MFA
    if (requireMfa && mfaPending) {
      shouldRedirect = true;
      redirectUrl = '/mfa-challenge';
    }

    // Check email verification
    if (requireEmailVerified && user && !user.isEmailVerified) {
      shouldRedirect = true;
      redirectUrl = '/verify-email';
    }

    // Check roles
    if (requiredRoles && user && !requiredRoles.includes(user.role)) {
      shouldRedirect = true;
      redirectUrl = '/unauthorized';
    }

    if (shouldRedirect) {
      if (onUnauthorized) {
        onUnauthorized();
      } else if (typeof window !== 'undefined') {
        // Add current URL as redirect param
        const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `${redirectUrl}?redirect=${currentUrl}`;
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    mfaPending,
    user,
    requireAuth,
    requireMfa,
    requireEmailVerified,
    requiredRoles,
    redirectTo,
    onUnauthorized,
  ]);

  // Loading state
  if (isLoading) {
    return loadingComponent ? <>{loadingComponent}</> : null;
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return unauthorizedComponent ? <>{unauthorizedComponent}</> : null;
  }

  // Check MFA
  if (requireMfa && mfaPending) {
    return unauthorizedComponent ? <>{unauthorizedComponent}</> : null;
  }

  // Check email verification
  if (requireEmailVerified && user && !user.isEmailVerified) {
    return unauthorizedComponent ? <>{unauthorizedComponent}</> : null;
  }

  // Check roles
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return unauthorizedComponent ? <>{unauthorizedComponent}</> : null;
  }

  return <>{children}</>;
}
