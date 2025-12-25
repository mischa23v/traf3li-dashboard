/**
 * Signup Form Component
 */

'use client';

import React, { useState, FormEvent, useCallback } from 'react';
import { cn } from '../utils/classNames';
import { Input } from './Input';
import { Button } from './Button';
import { Alert } from './Alert';
import { Divider } from './Divider';
import { Checkbox } from './Checkbox';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { SocialLoginButtons, SocialProvider } from './SocialLoginButtons';

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface SignupFormProps {
  /** On submit handler */
  onSubmit: (data: SignupFormData) => Promise<void>;
  /** On sign in click */
  onSignIn?: () => void;
  /** Social login handler */
  onSocialLogin?: (provider: SocialProvider) => Promise<void>;
  /** Available social providers */
  socialProviders?: SocialProvider[];
  /** Show first/last name fields */
  showNameFields?: boolean;
  /** Show password confirmation */
  showConfirmPassword?: boolean;
  /** Show terms acceptance checkbox */
  showTerms?: boolean;
  /** Terms URL */
  termsUrl?: string;
  /** Privacy URL */
  privacyUrl?: string;
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
  /** Minimum password length */
  minPasswordLength?: number;
  /** Labels customization */
  labels?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
    signUp?: string;
    signIn?: string;
    haveAccount?: string;
    orContinueWith?: string;
  };
}

const defaultLabels = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email address',
  password: 'Password',
  confirmPassword: 'Confirm password',
  acceptTerms: 'I agree to the Terms of Service and Privacy Policy',
  signUp: 'Create account',
  signIn: 'Sign in',
  haveAccount: 'Already have an account?',
  orContinueWith: 'Or continue with',
};

export function SignupForm({
  onSubmit,
  onSignIn,
  onSocialLogin,
  socialProviders = [],
  showNameFields = true,
  showConfirmPassword = true,
  showTerms = true,
  termsUrl = '/terms',
  privacyUrl = '/privacy',
  loading = false,
  error,
  success,
  title = 'Create an account',
  subtitle = 'Get started with your free account',
  className,
  minPasswordLength = 8,
  labels: customLabels,
}: SignupFormProps) {
  const labels = { ...defaultLabels, ...customLabels };

  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});

  const updateField = useCallback(<K extends keyof SignupFormData>(field: K, value: SignupFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [fieldErrors]);

  const validateForm = useCallback(() => {
    const errors: Partial<Record<keyof SignupFormData, string>> = {};

    if (showNameFields) {
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
      }
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < minPasswordLength) {
      errors.password = `Password must be at least ${minPasswordLength} characters`;
    }

    if (showConfirmPassword) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    if (showTerms && !formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, showNameFields, showConfirmPassword, showTerms, minPasswordLength]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      await onSubmit(formData);
    },
    [formData, onSubmit, validateForm]
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

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name fields */}
        {showNameFields && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={labels.firstName}
              value={formData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              error={fieldErrors.firstName}
              disabled={loading}
              autoComplete="given-name"
              required
            />
            <Input
              label={labels.lastName}
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              error={fieldErrors.lastName}
              disabled={loading}
              autoComplete="family-name"
              required
            />
          </div>
        )}

        <Input
          label={labels.email}
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={fieldErrors.email}
          disabled={loading}
          autoComplete="email"
          required
        />

        <div className="space-y-2">
          <Input
            label={labels.password}
            type="password"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            error={fieldErrors.password}
            disabled={loading}
            autoComplete="new-password"
            showPasswordToggle
            required
          />
          <PasswordStrengthMeter password={formData.password} />
        </div>

        {showConfirmPassword && (
          <Input
            label={labels.confirmPassword}
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            error={fieldErrors.confirmPassword}
            disabled={loading}
            autoComplete="new-password"
            showPasswordToggle
            required
          />
        )}

        {/* Terms */}
        {showTerms && (
          <Checkbox
            label={
              <span>
                I agree to the{' '}
                <a
                  href={termsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--traf-primary-600,#2563eb)] hover:underline"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href={privacyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--traf-primary-600,#2563eb)] hover:underline"
                >
                  Privacy Policy
                </a>
              </span>
            }
            checked={formData.acceptTerms}
            onChange={(e) => updateField('acceptTerms', e.target.checked)}
            error={fieldErrors.acceptTerms}
            disabled={loading}
            size="sm"
          />
        )}

        {/* Submit */}
        <Button
          type="submit"
          fullWidth
          loading={loading}
          loadingText="Creating account..."
        >
          {labels.signUp}
        </Button>
      </form>

      {/* Sign in link */}
      {onSignIn && (
        <p className="mt-6 text-center text-sm text-[var(--traf-text-secondary,#6b7280)]">
          {labels.haveAccount}{' '}
          <button
            type="button"
            onClick={onSignIn}
            className="font-medium text-[var(--traf-primary-600,#2563eb)] hover:text-[var(--traf-primary-500,#3b82f6)] focus:outline-none"
          >
            {labels.signIn}
          </button>
        </p>
      )}
    </div>
  );
}

export default SignupForm;
