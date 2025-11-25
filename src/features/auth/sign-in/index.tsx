import { useState } from 'react';
import { useNavigate, Link, useSearch } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';

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
};

// ============================================
// MAIN COMPONENT
// ============================================
export function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const search = useSearch({ from: '/(auth)/sign-in' });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

  // Login form data
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

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
      newErrors.usernameOrEmail = 'الحقل مطلوب';
    }

    if (!formData.password) {
      newErrors.password = 'الحقل مطلوب';
    } else if (formData.password.length < 6) {
      newErrors.password = 'يجب أن تكون مكونة من 6 خانات على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) return;

    setIsLoading(true);
    setApiError('');

    try {
      // Call backend auth service
      await login({
        username: formData.usernameOrEmail,
        password: formData.password,
      });

      // Navigate to redirect URL or dashboard
      const redirectTo = search.redirect || '/';
      navigate({ to: redirectTo });
    } catch (err: any) {
      setApiError(err.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]" dir="rtl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#F8F9FA] text-[#0f172a] mb-6">
              <Icons.TrafliLogo />
            </div>
            <h1 className="text-3xl font-bold text-[#0f172a] mb-2">تسجيل الدخول</h1>
            <p className="text-slate-500 text-lg">أدخل بياناتك للدخول إلى حسابك</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-5">

              {/* API Error */}
              {apiError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                  <Icons.XCircle />
                  {apiError}
                </div>
              )}

              {/* Username or Email Field */}
              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-2">
                  اسم المستخدم أو البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <div className="relative" dir="ltr">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icons.User />
                  </div>
                  <input
                    type="text"
                    value={formData.usernameOrEmail}
                    onChange={(e) => updateField('usernameOrEmail', e.target.value)}
                    className={`w-full h-12 pl-11 pr-4 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all text-left ${
                      errors.usernameOrEmail ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'
                    }`}
                    placeholder=""
                    dir="ltr"
                    autoComplete="username"
                    disabled={isLoading}
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
                    كلمة المرور <span className="text-red-500">*</span>
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    نسيت كلمة المرور؟
                  </a>
                </div>
                <div className="relative" dir="ltr">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icons.Lock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className={`w-full h-12 pl-11 pr-12 rounded-xl border bg-slate-50 text-[#0f172a] outline-none transition-all text-left ${
                      errors.password ? 'border-red-400' : 'border-slate-200 focus:border-[#0f172a]'
                    }`}
                    placeholder=""
                    dir="ltr"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Icons.Spinner />
                    جارٍ تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400">أو</span>
                </div>
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white text-[#0f172a] font-medium hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Icons.Google />
                المتابعة باستخدام Google
              </button>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <p className="text-center text-sm text-slate-500">
                بتسجيل الدخول، أنت توافق على{' '}
                <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  الشروط والأحكام
                </Link>{' '}
                و{' '}
                <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  سياسة الخصوصية
                </Link>
              </p>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-slate-500 mt-6">
            ليس لديك حساب؟{' '}
            <Link to="/sign-up" className="text-emerald-600 hover:text-emerald-700 font-bold">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
