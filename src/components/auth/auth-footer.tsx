import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

// Service Icons
const ScaleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
)

const BriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

export function AuthFooter() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <footer className="w-full py-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Service Icons */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-emerald-600" title={isRTL ? 'القضايا' : 'Cases'}>
            <ScaleIcon />
          </span>
          <span className="text-purple-600" title={isRTL ? 'العقود' : 'Contracts'}>
            <DocumentIcon />
          </span>
          <span className="text-blue-600" title={isRTL ? 'المكاتب' : 'Firms'}>
            <BriefcaseIcon />
          </span>
          <span className="text-amber-600" title={isRTL ? 'العملاء' : 'Clients'}>
            <UsersIcon />
          </span>
          <span className="text-teal-600" title={isRTL ? 'الأمان' : 'Security'}>
            <ShieldIcon />
          </span>
        </div>

        {/* Tagline */}
        <p className="text-center text-sm text-slate-600 mb-3">
          {isRTL ? 'ترافعلي. العدالة بين يديك.' : 'Traf3li. Justice at your fingertips.'}
        </p>

        {/* Links */}
        <p className="text-center text-sm text-slate-500">
          <Link to="/terms" className="hover:text-slate-700 hover:underline">
            {isRTL ? 'شروط الخدمة' : 'Terms'}
          </Link>
          <span className="mx-2">|</span>
          <Link to="/privacy" className="hover:text-slate-700 hover:underline">
            {isRTL ? 'سياسة الخصوصية' : 'Privacy policy'}
          </Link>
          <span className="mx-2">|</span>
          <span>{isRTL ? 'إصدار' : 'Version'} 1.0.0</span>
        </p>
      </div>
    </footer>
  )
}
