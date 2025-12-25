/**
 * @traf3li/auth-react-ui
 * Pre-built React UI components for Traf3li Auth
 *
 * Features:
 * - Full theming with dark mode support
 * - RTL (Right-to-Left) support
 * - Accessible components (WCAG compliant)
 * - Customizable labels for i18n
 * - Responsive design
 */

// Theme
export * from './theme';

// Components
export * from './components';

// Utilities
export * from './utils';

// Re-export commonly used types
export type { Theme, ThemeMode, ThemeDirection, ThemeContextValue } from './theme/types';
export type { SocialProvider } from './components/SocialLoginButtons';
export type { MFAMethod } from './components/MFAVerify';
export type { MFASetupMethod } from './components/MFASetup';
export type { Session as SessionType } from './components/SessionManager';
export type { UserProfileData } from './components/UserProfile';
export type { SignupFormData } from './components/SignupForm';
