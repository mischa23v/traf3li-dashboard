import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/language-switcher'

// Trafli Logo SVG Component
const TrafliLogo = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
    />
  </svg>
)

export function AuthHeader() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <header className="w-full bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-emerald-600">
              <TrafliLogo />
            </div>
            <span className="text-lg font-bold">
              <span className="text-emerald-600">{isRTL ? 'ترافعلي' : 'Traf3li'}</span>
            </span>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
