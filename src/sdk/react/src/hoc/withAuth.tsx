/**
 * withAuth Higher-Order Component
 * Wraps a component with authentication requirements
 */

import React, { ComponentType, ReactNode } from 'react';
import { AuthGuard, AuthGuardProps } from '../components/AuthGuard';

export interface WithAuthOptions extends Omit<AuthGuardProps, 'children'> {}

/**
 * Higher-Order Component for authentication
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  function WithAuthComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  }

  WithAuthComponent.displayName = `withAuth(${displayName})`;

  return WithAuthComponent;
}
