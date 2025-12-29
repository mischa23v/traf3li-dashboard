import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

export function AuthFooter() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <footer className="w-full py-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-slate-500">
          {isRTL ? (
            <>
              بالنقر على تسجيل الدخول، فإنك توافق على{' '}
              <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                شروط الخدمة
              </Link>
              {' '}و{' '}
              <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                سياسة الخصوصية
              </Link>
            </>
          ) : (
            <>
              By clicking Sign in, you agree to our{' '}
              <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                Privacy Policy
              </Link>
            </>
          )}
        </p>
      </div>
    </footer>
  )
}
