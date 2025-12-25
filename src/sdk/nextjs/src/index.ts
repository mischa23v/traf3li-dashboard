/**
 * @traf3li/auth-nextjs
 * Next.js SDK for Traf3li Authentication
 */

// Re-export everything from React SDK
export * from '@traf3li/auth-react';

// Middleware
export { createAuthMiddleware } from './middleware';
export type { AuthMiddlewareConfig } from './middleware';

// Server utilities
export { getServerUser, requireAuth, getServerSession } from './server';

// API route handlers
export { createAuthRouteHandler } from './api';
export type { AuthRouteHandlerConfig } from './api';

// Google One Tap
export { GoogleOneTap } from './components/GoogleOneTap';
export type { GoogleOneTapProps } from './components/GoogleOneTap';
