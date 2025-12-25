/**
 * Login Form Component
 */

'use client';

import React, { useState, FormEvent, useCallback } from 'react';
import { cn } from '../utils/classNames';
import { Input } from './Input';
import { Button } from './Button';
import { Alert } from './Alert';
import { Divider } from './Divider';
import { Checkbox } from './Checkbox';
import { SocialLoginButtons, SocialProvider } from './SocialLoginButtons';

export interface LoginFormProps {
  /** On submit handler */
  onSubmit: (data: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  /** On forgot password click */
  onForgotPassword?: () => void;
  /** On sign up click */
  onSignUp?: () => void;
  /** Social login handler */
  onSocialLogin?: (provider: SocialProvider) => Promise<void>;
  /** Available social providers */
  socialProviders?: SocialProvider[];
  /** Show remember me checkbox */
  showRememberMe?: boolean;
  /** Show forgot password link */
  showForgotPassword?: boolean;
  /** Show sign up link */
  showSignUp?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Success message */
  success?: string | null;
  /** Custom title */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
  /** Additional class name */
  className?: string;
  /** Labels customization */
  labels?: {
    email?: string;
    password?: string;
    rememberMe?: string;
    forgotPassword?: string;
    signIn?: string;
    signUp?: string;
    noAccount?: string;
    orContinueWith?: string;
  };
}

const defaultLabels = {
  email: 'Email address',
  password: 'Password',
  rememberMe: 'Remember me',
  forgotPassword: 'Forgot password?',
  signIn: 'Sign in',
  signUp: 'Sign up',
  noAccount: "Don't have an account?",
  orContinueWith: 'Or continue with',
};

export function LoginForm({
  onSubmit,
  onForgotPassword,
  onSignUp,
  onSocialLogin,
  socialProviders = [],
  showRememberMe = true,
  showForgotPassword = true,
  showSignUp = true,
  loading = false,
  error,
  success,
  title = 'Welcome back',
  subtitle = 'Sign in to your account',
  className,
  labels: customLabels,
}: LoginFormProps) {
  const labels = { ...defaultLabels, ...customLabels };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = useCallback(() => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      await onSubmit({ email, password, rememberMe });
    },
    [email, password, rememberMe, onSubmit, validateForm]
  );

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
          {title}
        </h1>
        <p className="mt-2 text-[var(--traf-text-secondary,#6b7280)]">
          {subtitle}
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-6">
          {success}
        </Alert>
      )}

      {/* Social Login */}
      {socialProviders.length > 0 && onSocialLogin && (
        <>
          <SocialLoginButtons
            providers={socialProviders}
            onLogin={onSocialLogin}
            disabled={loading}
          />
          <Divider className="my-6">{labels.orContinueWith}</Divider>
        </>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label={labels.email}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          disabled={loading}
          autoComplete="email"
          required
        />

        <Input
          label={labels.password}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          disabled={loading}
          autoComplete="current-password"
          showPasswordToggle
          required
        />

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          {showRememberMe && (
            <Checkbox
              label={labels.rememberMe}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              size="sm"
            />
          )}

          {showForgotPassword && onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm font-medium text-[var(--traf-primary-600,#2563eb)] hover:text-[var(--traf-primary-500,#3b82f6)] focus:outline-none"
              disabled={loading}
            >
              {labels.forgotPassword}
            </button>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          fullWidth
          loading={loading}
          loadingText="Signing in..."
        >
          {labels.signIn}
        </Button>
      </form>

      {/* Sign up link */}
      {showSignUp && onSignUp && (
        <p className="mt-6 text-center text-sm text-[var(--traf-text-secondary,#6b7280)]">
          {labels.noAccount}{' '}
          <button
            type="button"
            onClick={onSignUp}
            className="font-medium text-[var(--traf-primary-600,#2563eb)] hover:text-[var(--traf-primary-500,#3b82f6)] focus:outline-none"
          >
            {labels.signUp}
          </button>
        </p>
      )}
    </div>
  );
}

export default LoginForm;
