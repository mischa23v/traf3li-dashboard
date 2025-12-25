/**
 * Traf3li Auth SDK
 * Complete authentication SDK for modern applications
 *
 * @packageDocumentation
 */

// Core SDK - Authentication client and types
export * from './core/src';

// React SDK - Hooks and components
export * from './react/src';

// Next.js SDK - Server utilities and middleware
export * from './nextjs/src';

// React UI - Pre-built components
export * from './react-ui/src';

// Integrations
export * from './integrations';

/**
 * SDK Version
 */
export const SDK_VERSION = '1.0.0';

/**
 * SDK Information
 */
export const SDK_INFO = {
  name: '@traf3li/auth',
  version: SDK_VERSION,
  packages: [
    '@traf3li/auth-core',
    '@traf3li/auth-react',
    '@traf3li/auth-nextjs',
    '@traf3li/auth-react-ui',
  ],
};
