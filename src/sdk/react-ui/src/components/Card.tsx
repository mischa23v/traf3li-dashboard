/**
 * Card Component
 */

'use client';

import React, { ReactNode, HTMLAttributes } from 'react';
import { cn } from '../utils/classNames';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Card shadow */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Card children */
  children: ReactNode;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const shadowStyles = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

const roundedStyles = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
};

export function Card({
  padding = 'md',
  shadow = 'sm',
  rounded = 'lg',
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--traf-bg-primary,#ffffff)] dark:bg-gray-800',
        'border border-[var(--traf-border-primary,#e5e7eb)] dark:border-gray-700',
        paddingStyles[padding],
        shadowStyles[shadow],
        roundedStyles[rounded],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'pb-4 border-b border-[var(--traf-border-primary,#e5e7eb)] dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }: CardBodyProps) {
  return (
    <div className={cn('py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        'pt-4 border-t border-[var(--traf-border-primary,#e5e7eb)] dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
