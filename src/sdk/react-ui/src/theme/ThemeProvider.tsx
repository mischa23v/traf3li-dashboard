/**
 * Theme Provider Component
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  useCallback,
} from 'react';
import type { Theme, ThemeMode, ThemeDirection, ThemeContextValue } from './types';
import { lightTheme, darkTheme } from './defaultTheme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  /** Default theme mode */
  defaultMode?: ThemeMode;
  /** Default text direction */
  defaultDirection?: ThemeDirection;
  /** Custom light theme */
  lightTheme?: Theme;
  /** Custom dark theme */
  darkTheme?: Theme;
  /** Storage key for persisting theme */
  storageKey?: string;
  /** Disable persistence */
  disablePersistence?: boolean;
}

/**
 * Get system color scheme preference
 */
function getSystemMode(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Theme Provider Component
 */
export function ThemeProvider({
  children,
  defaultMode = 'system',
  defaultDirection = 'ltr',
  lightTheme: customLightTheme,
  darkTheme: customDarkTheme,
  storageKey = 'traf3li-theme',
  disablePersistence = false,
}: ThemeProviderProps) {
  // Initialize state from storage or defaults
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined' || disablePersistence) return defaultMode;
    const stored = localStorage.getItem(`${storageKey}-mode`);
    return (stored as ThemeMode) || defaultMode;
  });

  const [direction, setDirectionState] = useState<ThemeDirection>(() => {
    if (typeof window === 'undefined' || disablePersistence) return defaultDirection;
    const stored = localStorage.getItem(`${storageKey}-direction`);
    return (stored as ThemeDirection) || defaultDirection;
  });

  // Determine actual theme based on mode
  const resolvedMode = mode === 'system' ? getSystemMode() : mode;

  // Select theme
  const baseTheme = resolvedMode === 'dark'
    ? (customDarkTheme || darkTheme)
    : (customLightTheme || lightTheme);

  // Create theme with RTL setting
  const theme = useMemo<Theme>(() => ({
    ...baseTheme,
    isRTL: direction === 'rtl',
  }), [baseTheme, direction]);

  // Persist mode changes
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    if (!disablePersistence && typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}-mode`, newMode);
    }
  }, [disablePersistence, storageKey]);

  // Persist direction changes
  const setDirection = useCallback((newDirection: ThemeDirection) => {
    setDirectionState(newDirection);
    if (!disablePersistence && typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}-direction`, newDirection);
    }
  }, [disablePersistence, storageKey]);

  // Toggle mode
  const toggleMode = useCallback(() => {
    const currentResolved = mode === 'system' ? getSystemMode() : mode;
    setMode(currentResolved === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  // Toggle direction
  const toggleDirection = useCallback(() => {
    setDirection(direction === 'ltr' ? 'rtl' : 'ltr');
  }, [direction, setDirection]);

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Set color scheme
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedMode);
    root.style.colorScheme = resolvedMode;

    // Set direction
    root.dir = direction;
    root.setAttribute('dir', direction);

    // Set CSS custom properties
    root.style.setProperty('--traf-bg-primary', theme.colors.background.primary);
    root.style.setProperty('--traf-bg-secondary', theme.colors.background.secondary);
    root.style.setProperty('--traf-text-primary', theme.colors.text.primary);
    root.style.setProperty('--traf-text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--traf-border-primary', theme.colors.border.primary);
    root.style.setProperty('--traf-primary-500', theme.colors.primary[500]);
    root.style.setProperty('--traf-primary-600', theme.colors.primary[600]);
    root.style.setProperty('--traf-error-500', theme.colors.error[500]);
    root.style.setProperty('--traf-success-500', theme.colors.success[500]);
  }, [resolvedMode, direction, theme]);

  // Listen for system preference changes
  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Force re-render when system preference changes
      setModeState('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    mode,
    direction,
    setMode,
    setDirection,
    toggleMode,
    toggleDirection,
  }), [theme, mode, direction, setMode, setDirection, toggleMode, toggleDirection]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook to check if dark mode is active
 */
export function useIsDarkMode(): boolean {
  const { theme } = useTheme();
  return theme.isDark;
}

/**
 * Hook to check if RTL is active
 */
export function useIsRTL(): boolean {
  const { direction } = useTheme();
  return direction === 'rtl';
}
