import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import {
  checkLoginAllowed,
  recordFailedAttempt,
  recordSuccessfulLogin,
  formatLockoutTime,
} from '@/lib/login-throttle';
import { getLogoutReasonMessage } from '@/constants/errorCodes';
import { SSOLoginButtons } from '@/components/auth/sso-login-buttons';
import {
  InvisibleCaptcha,
  CaptchaChallengeRef,
} from '@/components/auth/captcha-challenge';
import {
  defaultCaptchaConfig,
  getCaptchaSiteKey,
} from '@/components/auth/captcha-config';
import { ROUTES } from '@/constants/routes';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthFooter } from '@/components/auth/auth-footer';
import { validateRedirectUrl } from '@/lib/security-headers';

// ============================================
// SVG ICONS
// ============================================
const Icons = {
  TrafliLogo: () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ),
  Google: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  Spinner: () => (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  XCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Info: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// ============================================
// MAIN COMPONENT
// ============================================
export function SignIn() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const search = useSearch({ from: '/(auth)/sign-in' });
  const isRTL = i18n.language === 'ar';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

  // Rate limiting state
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [waitTime, setWaitTime] = useState<number>(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  // CAPTCHA state
  const captchaRef = useRef<CaptchaChallengeRef>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaEnabled = defaultCaptchaConfig.enabled;
  const captchaProvider = defaultCaptchaConfig.provider;
  const captchaSiteKey = getCaptchaSiteKey(captchaProvider);

  // Login form data
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  // Keep me signed in
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  // Show logout reason message on mount
  useEffect(() => {
    const reason = (search as any).reason as string | undefined;
    if (reason) {
      const message = getLogoutReasonMessage(reason, isRTL ? 'ar' : 'en');
      if (message) {
        toast.info(message, { duration: 5000 });
      }
    }
  }, [search, isRTL]);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (waitTime <= 0) return;

    const timer = setInterval(() => {
      setWaitTime((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setRateLimitError(null);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [waitTime]);

  // Get login identifier
  const getLoginIdentifier = useCallback((username: string): string => {
    return username.toLowerCase().trim();
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  // Validation
  const validateLoginForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = t('auth.signIn.validation.usernameOrEmailRequired');
    }

    if (!formData.password) {
      newErrors.password = t('auth.signIn.validation.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.signIn.validation.passwordMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) return;

    const identifier = getLoginIdentifier(formData.usernameOrEmail);

    // Check client-side rate limiting BEFORE making API call
    const throttleCheck = checkLoginAllowed(identifier);
    if (!throttleCheck.allowed) {
      setRateLimitError(
        throttleCheck.lockedUntil
          ? t('auth.signIn.accountLocked', { time: formatLockoutTime(throttleCheck.waitTime || 0) })
          : t('auth.signIn.tooManyAttempts', { time: formatLockoutTime(throttleCheck.waitTime || 0) })
      );
      setWaitTime(throttleCheck.waitTime || 0);
      setAttemptsRemaining(throttleCheck.attemptsRemaining || 0);
      return;
    }

    setIsLoading(true);
    setApiError('');
    setRateLimitError(null);

    try {
      // Execute CAPTCHA if enabled
      let token = captchaToken;
      if (captchaEnabled && captchaRef.current && !token) {
        try {
          token = await captchaRef.current.execute();
          setCaptchaToken(token);
        } catch (captchaError) {
          setApiError(isRTL ? 'فشل التحقق الأمني. يرجى المحاولة مرة أخرى.' : 'Security verification failed. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      // Call backend auth service - returns discriminated union LoginResult
      const result = await login({
        username: formData.usernameOrEmail,
        password: formData.password,
        captchaToken: token || undefined,
        rememberMe: keepSignedIn,
      });

      // SECURITY: Validate redirect URL to prevent open redirect attacks
      const rawRedirect = (search as { redirect?: string }).redirect;
      const redirectTo = validateRedirectUrl(rawRedirect, { defaultUrl: '/' });

      // Handle each result type explicitly (Enterprise Pattern: Command-Query Separation)
      if (!result) {
        // Should never happen with proper implementation
        console.error('[SignIn] login() returned undefined');
        throw new Error(isRTL ? 'فشل تسجيل الدخول' : 'Login failed');
      }

      // Handle OTP required - password verified, now need email OTP
      if (result.type === 'otp_required') {
        const { otpData } = result;

        // Validate that we have the required loginSessionToken
        if (!otpData.loginSessionToken) {
          console.error('[SignIn] OTP required but loginSessionToken is missing!');
          throw new Error(isRTL ? 'خطأ في نظام التحقق' : 'Verification system error');
        }

        console.log('[SignIn] OTP required, navigating to OTP page');

        // Record successful password verification (not full login, but correct credentials)
        recordSuccessfulLogin(identifier);

        // Navigate to OTP page with necessary data
        navigate({
          to: ROUTES.auth.otp,
          search: {
            email: otpData.fullEmail,
            purpose: 'login' as const,
            token: otpData.loginSessionToken,
          },
        });
        return;
      }

      // Handle MFA required - user authenticated but MFA verification pending
      if (result.type === 'mfa_required') {
        console.log('[SignIn] MFA required, navigating to MFA verification');

        recordSuccessfulLogin(identifier);

        // Redirect to MFA challenge page with original redirect preserved
        navigate({ to: ROUTES.auth.mfaChallenge, search: { redirect: redirectTo } });
        return;
      }

      // Handle successful login - user is fully authenticated
      if (result.type === 'success') {
        console.log('[SignIn] Login successful, redirecting user');

        // Record successful login - clears throttle data
        recordSuccessfulLogin(identifier);

        navigate({ to: redirectTo });
        return;
      }

      // Exhaustive check - TypeScript will error if we miss a case
      const _exhaustiveCheck: never = result;
      console.error('[SignIn] Unhandled result type:', _exhaustiveCheck)
    } catch (err: any) {
      const status = err?.status || err?.response?.status;

      // CRITICAL: Before handling any error, check if OTP was already required from a previous successful request
      // This handles the race condition where a second request (e.g., double-click) gets 429
      // but the first request already set otpRequired=true
      const postErrorState = useAuthStore.getState();
      if (postErrorState.otpRequired && postErrorState.otpData?.loginSessionToken) {
        console.log('[SignIn] OTP already required from previous request, navigating despite error');
        recordSuccessfulLogin(identifier);
        navigate({
          to: ROUTES.auth.otp,
          search: {
            email: postErrorState.otpData.fullEmail,
            purpose: 'login' as const,
            token: postErrorState.otpData.loginSessionToken,
          },
        });
        return;
      }

      // Handle server-side 429 rate limit - DON'T count as failed attempt
      if (status === 429) {
        const serverWaitTime = err.retryAfter || err?.response?.data?.retryAfter || 60;
        setRateLimitError(t('auth.signIn.serverRateLimited', { time: formatLockoutTime(serverWaitTime) }));
        setWaitTime(serverWaitTime);
        if (err?.attemptsRemaining !== undefined) {
          setAttemptsRemaining(err.attemptsRemaining);
        }
        return;
      }

      // Handle 423 Account Locked
      if (status === 423) {
        const remainingTime = err?.remainingTime || err?.response?.data?.remainingTime || 15;
        setRateLimitError(t('auth.signIn.accountLocked', { time: `${remainingTime} ${isRTL ? 'دقيقة' : 'minutes'}` }));
        setWaitTime(remainingTime * 60); // Convert minutes to seconds
        return;
      }

      // Handle 403 EMAIL_NOT_VERIFIED - user needs to verify email before login
      // Backend returns this for users who registered after 2025-02-01 and haven't verified
      const errorCode = err?.response?.data?.code;
      if (status === 403 && errorCode === 'EMAIL_NOT_VERIFIED') {
        const responseData = err?.response?.data;
        navigate({
          to: ROUTES.auth.verifyEmailRequired,
          search: {
            email: responseData?.email || '', // Masked email from backend
            verificationSent: responseData?.verificationResent || false,
          },
        });
        return;
      }

      // Only record failed attempt for actual auth failures (401, 400)
      const isAuthFailure = status === 401 || status === 400;
      if (isAuthFailure) {
        const failedResult = recordFailedAttempt(identifier);
        setAttemptsRemaining(failedResult.attemptsRemaining);

        // Handle client-side lockout from failed attempts
        if (failedResult.locked) {
          setRateLimitError(
            t('auth.signIn.accountLocked', { time: formatLockoutTime(failedResult.waitTime || 0) })
          );
          setWaitTime(failedResult.waitTime || 0);
        }
      }

      setApiError(err.message || t('common.error'));
      // Reset CAPTCHA on error so user can try again
      if (captchaRef.current) {
        captchaRef.current.reset();
        setCaptchaToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <AuthHeader />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#F8F9FA] text-[#0f172a] mb-6">
              <Icons.TrafliLogo />
            </div>
            <h1 className="text-3xl font-bold text-[#0f172a] mb-2">{t('auth.signIn.title')}</h1>
            <p className="text-slate-500 text-lg">{t('auth.signIn.subtitle')}</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-5">

              {/* Rate Limit Warning */}
              {rateLimitError && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                  <div className="flex items-start gap-2">
                    <Icons.AlertTriangle />
                    <div className="flex-1">
                      <p>{rateLimitError}</p>
                      {waitTime > 0 && (
                        <p className="mt-1 flex items-center gap-1 text-xs">
                          <Icons.Clock />
                          {t('auth.signIn.waitingTime', { time: formatLockoutTime(waitTime) })}
                        </p>
                      )}
                      {attemptsRemaining !== null && attemptsRemaining > 0 && !waitTime && (
                        <p className="mt-1 text-xs">
                          {t('auth.signIn.attemptsRemaining', { count: attemptsRemaining })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* API Error */}
              {apiError && !rateLimitError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <div className="flex items-start gap-2">
                    <Icons.XCircle />
                    <div className="flex-1">
                      <p>{apiError}</p>
                      {attemptsRemaining !== null && attemptsRemaining > 0 && (
                        <p className="mt-1 text-xs opacity-80">
                          {t('auth.signIn.attemptsRemaining', { count: attemptsRemaining })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Username or Email Field */}
              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-2">
                  {t('auth.signIn.usernameOrEmail')} <span className="text-red-500">*</span>
                </label>
                <div className="relative" dir="ltr">
                  <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Icons.User />
                  </div>
                  <input
                    type="text"
                    value={formData.usernameOrEmail}
                    onChange={(e) => updateField('usernameOrEmail', e.target.value)}
                    className={`w-full h-12 ps-11 pe-4 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all text-start ${
                      errors.usernameOrEmail ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'
                    }`}
                    placeholder=""
                    dir="ltr"
                    autoComplete="username"
                    disabled={isLoading || waitTime > 0}
                  />
                </div>
                {errors.usernameOrEmail && (
                  <p className="text-red-500 text-xs mt-1">{errors.usernameOrEmail}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#0f172a]">
                    {t('auth.signIn.password')} <span className="text-red-500">*</span>
                  </label>
                  <a
                    href={ROUTES.auth.forgotPassword}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {t('auth.signIn.forgotPassword')}
                  </a>
                </div>
                <div className="relative" dir="ltr">
                  <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Icons.Lock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className={`w-full h-12 ps-11 pe-12 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all text-start ${
                      errors.password ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'
                    }`}
                    placeholder=""
                    dir="ltr"
                    autoComplete="current-password"
                    disabled={isLoading || waitTime > 0}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
                    disabled={isLoading || waitTime > 0}
                  >
                    {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Keep me signed in */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="keepSignedIn"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  disabled={isLoading || waitTime > 0}
                />
                <div>
                  <label htmlFor="keepSignedIn" className="text-sm font-medium text-[#0f172a] cursor-pointer">
                    {isRTL ? 'تذكرني' : 'Keep me signed in'}
                  </label>
                  <p className="text-xs text-slate-500">
                    {isRTL ? 'يوصى به على الأجهزة الموثوقة' : 'Recommended on trusted devices'}
                  </p>
                </div>
              </div>

              {/* Invisible CAPTCHA */}
              {captchaEnabled && captchaProvider !== 'none' && captchaSiteKey && (
                <InvisibleCaptcha
                  ref={captchaRef}
                  provider={captchaProvider}
                  siteKey={captchaSiteKey}
                  action="login"
                  onSuccess={(token) => setCaptchaToken(token)}
                  onError={(error) => {
                    console.error('CAPTCHA error:', error);
                    setApiError(isRTL ? 'فشل التحقق الأمني' : 'Security verification failed');
                  }}
                  onExpired={() => {
                    setCaptchaToken(null);
                  }}
                />
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || waitTime > 0}
                className="w-full h-12 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Icons.Spinner />
                    {t('auth.signIn.signingIn')}
                  </>
                ) : waitTime > 0 ? (
                  <>
                    <Icons.Clock />
                    {t('auth.signIn.waitToRetry')} ({formatLockoutTime(waitTime)})
                  </>
                ) : (
                  t('auth.signIn.signInButton')
                )}
              </button>

              {/* SSO Login Buttons */}
              <SSOLoginButtons disabled={isLoading || waitTime > 0} />
            </form>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-slate-500 mt-6">
            {t('auth.signIn.noAccount')}{' '}
            <Link to={ROUTES.auth.signUp} className="text-emerald-600 hover:text-emerald-700 font-bold">
              {t('auth.signIn.registerNow')}
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
}
