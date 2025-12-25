/**
 * Auth Layout Component
 * A centered layout wrapper for auth pages
 */

'use client';

import React, { ReactNode } from 'react';
import { cn } from '../utils/classNames';

export interface AuthLayoutProps {
  /** Content to render */
  children: ReactNode;
  /** Logo component or element */
  logo?: ReactNode;
  /** Footer content */
  footer?: ReactNode;
  /** Background style */
  background?: 'plain' | 'gradient' | 'pattern';
  /** Additional class name */
  className?: string;
  /** Max width of content */
  maxWidth?: 'sm' | 'md' | 'lg';
}

const maxWidthStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

const backgroundStyles = {
  plain: 'bg-[var(--traf-bg-primary,#ffffff)] dark:bg-gray-900',
  gradient: 'bg-gradient-to-br from-[var(--traf-primary-50,#eff6ff)] via-white to-[var(--traf-secondary-50,#f5f3ff)] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
  pattern: 'bg-[var(--traf-bg-primary,#ffffff)] dark:bg-gray-900',
};

export function AuthLayout({
  children,
  logo,
  footer,
  background = 'gradient',
  className,
  maxWidth = 'md',
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        backgroundStyles[background],
        className
      )}
    >
      {/* Background pattern */}
      {background === 'pattern' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[var(--traf-primary-100,#dbeafe)] dark:bg-[var(--traf-primary-900,#1e3a8a)]/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[var(--traf-secondary-100,#ede9fe)] dark:bg-[var(--traf-secondary-900,#4c1d95)]/20 blur-3xl" />
        </div>
      )}

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {/* Logo */}
        {logo && (
          <div className="mb-8">
            {logo}
          </div>
        )}

        {/* Main content */}
        <div className={cn('w-full', maxWidthStyles[maxWidth])}>
          {children}
        </div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="relative py-6 text-center text-sm text-[var(--traf-text-secondary,#6b7280)]">
          {footer}
        </div>
      )}
    </div>
  );
}

export default AuthLayout;
