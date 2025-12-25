/**
 * Enterprise SSO Login Component
 * LDAP, SAML, and OIDC enterprise login UI
 */

'use client';

import React, { useState, useCallback, useEffect, FormEvent } from 'react';
import { cn } from '../utils/classNames';
import { Button } from './Button';
import { Alert } from './Alert';
import { Input } from './Input';
import { Card, CardHeader, CardBody, CardFooter } from './Card';
import { Divider } from './Divider';

export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc' | 'ldap';
  enabled: boolean;
  logoUrl?: string;
  domains?: string[];
}

export interface EnterpriseSSOLoginProps {
  /** Available SSO providers */
  providers?: SSOProvider[];
  /** Fetch providers for domain */
  onFetchProviders?: (domain: string) => Promise<SSOProvider[]>;
  /** Initiate SSO login */
  onSSOLogin: (providerId: string) => Promise<void>;
  /** LDAP login */
  onLDAPLogin?: (username: string, password: string, domain?: string) => Promise<void>;
  /** On back to regular login */
  onBack?: () => void;
  /** Default domain */
  defaultDomain?: string;
  /** Show domain detection */
  showDomainDetection?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Success message */
  success?: string | null;
  /** Additional class name */
  className?: string;
  /** Labels customization */
  labels?: {
    title?: string;
    subtitle?: string;
    email?: string;
    username?: string;
    password?: string;
    domain?: string;
    detectSSO?: string;
    loginWithSSO?: string;
    loginWithLDAP?: string;
    back?: string;
    noProviders?: string;
  };
}

export function EnterpriseSSOLogin({
  providers: initialProviders = [],
  onFetchProviders,
  onSSOLogin,
  onLDAPLogin,
  onBack,
  defaultDomain = '',
  showDomainDetection = true,
  loading = false,
  error,
  success,
  className,
  labels: customLabels,
}: EnterpriseSSOLoginProps) {
  const labels = {
    title: customLabels?.title || 'Enterprise Login',
    subtitle: customLabels?.subtitle || 'Sign in with your organization credentials',
    email: customLabels?.email || 'Work email',
    username: customLabels?.username || 'Username',
    password: customLabels?.password || 'Password',
    domain: customLabels?.domain || 'Domain',
    detectSSO: customLabels?.detectSSO || 'Continue',
    loginWithSSO: customLabels?.loginWithSSO || 'Sign in with SSO',
    loginWithLDAP: customLabels?.loginWithLDAP || 'Sign in with LDAP',
    back: customLabels?.back || 'Back to login',
    noProviders: customLabels?.noProviders || 'No SSO providers found for this domain',
  };

  const [step, setStep] = useState<'domain' | 'providers' | 'ldap'>('domain');
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState(defaultDomain);
  const [providers, setProviders] = useState<SSOProvider[]>(initialProviders);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    if (initialProviders.length > 0) {
      setProviders(initialProviders);
      if (!showDomainDetection) {
        setStep('providers');
      }
    }
  }, [initialProviders, showDomainDetection]);

  const extractDomain = (email: string): string => {
    const match = email.match(/@(.+)$/);
    return match ? match[1] : '';
  };

  const handleDetectSSO = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!onFetchProviders) return;

    const emailDomain = extractDomain(email);
    if (!emailDomain) return;

    setDetecting(true);
    setDomain(emailDomain);

    try {
      const fetchedProviders = await onFetchProviders(emailDomain);
      setProviders(fetchedProviders);
      setStep(fetchedProviders.length > 0 ? 'providers' : 'ldap');
    } finally {
      setDetecting(false);
    }
  }, [email, onFetchProviders]);

  const handleSSOLogin = useCallback(
    async (providerId: string) => {
      await onSSOLogin(providerId);
    },
    [onSSOLogin]
  );

  const handleLDAPLogin = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onLDAPLogin) return;
      await onLDAPLogin(username, password, domain);
    },
    [username, password, domain, onLDAPLogin]
  );

  const getProviderIcon = (provider: SSOProvider) => {
    if (provider.logoUrl) {
      return <img src={provider.logoUrl} alt={provider.name} className="w-6 h-6" />;
    }

    switch (provider.type) {
      case 'saml':
        return (
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'oidc':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        );
      case 'ldap':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
    }
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--traf-primary-100,#dbeafe)] dark:bg-[var(--traf-primary-900,#1e3a5f)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--traf-primary-600,#2563eb)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--traf-text-primary,#111827)] dark:text-gray-100">
                {labels.title}
              </h2>
              <p className="text-sm text-[var(--traf-text-secondary,#6b7280)]">
                {labels.subtitle}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Domain Detection Step */}
          {step === 'domain' && showDomainDetection && (
            <form onSubmit={handleDetectSSO} className="space-y-4">
              <Input
                label={labels.email}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
              <Button
                type="submit"
                fullWidth
                loading={detecting}
                disabled={!email.includes('@')}
                loadingText="Detecting SSO..."
              >
                {labels.detectSSO}
              </Button>
            </form>
          )}

          {/* SSO Providers Step */}
          {step === 'providers' && (
            <div className="space-y-4">
              {domain && (
                <div className="text-center text-sm text-[var(--traf-text-secondary,#6b7280)]">
                  Signing in as <span className="font-medium">{email || domain}</span>
                </div>
              )}

              {providers.length > 0 ? (
                <div className="space-y-2">
                  {providers.filter((p) => p.type !== 'ldap').map((provider) => (
                    <Button
                      key={provider.id}
                      variant="outline"
                      fullWidth
                      onClick={() => handleSSOLogin(provider.id)}
                      loading={loading}
                      className="justify-start"
                    >
                      <span className="mr-3">{getProviderIcon(provider)}</span>
                      {labels.loginWithSSO} ({provider.name})
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-[var(--traf-text-secondary,#6b7280)]">
                  {labels.noProviders}
                </div>
              )}

              {/* LDAP option if available */}
              {(providers.some((p) => p.type === 'ldap') || onLDAPLogin) && (
                <>
                  <Divider>or</Divider>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setStep('ldap')}
                    className="justify-start"
                  >
                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    {labels.loginWithLDAP}
                  </Button>
                </>
              )}

              <button
                type="button"
                onClick={() => setStep('domain')}
                className="w-full text-sm font-medium text-[var(--traf-primary-600,#2563eb)] hover:text-[var(--traf-primary-500,#3b82f6)] focus:outline-none"
              >
                Use a different email
              </button>
            </div>
          )}

          {/* LDAP Login Step */}
          {step === 'ldap' && onLDAPLogin && (
            <form onSubmit={handleLDAPLogin} className="space-y-4">
              <Input
                label={labels.domain}
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="company.com"
              />
              <Input
                label={labels.username}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username or email"
                required
                autoComplete="username"
              />
              <Input
                label={labels.password}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={!username || !password}
                loadingText="Signing in..."
              >
                {labels.loginWithLDAP}
              </Button>

              {providers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setStep('providers')}
                  className="w-full text-sm font-medium text-[var(--traf-primary-600,#2563eb)] hover:text-[var(--traf-primary-500,#3b82f6)] focus:outline-none"
                >
                  Use SSO instead
                </button>
              )}
            </form>
          )}
        </CardBody>

        {onBack && (
          <CardFooter>
            <button
              type="button"
              onClick={onBack}
              className="w-full text-sm font-medium text-[var(--traf-text-secondary,#6b7280)] hover:text-[var(--traf-text-primary,#111827)] focus:outline-none"
            >
              {labels.back}
            </button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default EnterpriseSSOLogin;
