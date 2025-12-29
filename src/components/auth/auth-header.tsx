import { useTranslation } from 'react-i18next'

// Trafli Logo SVG Component
const TrafliLogo = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="text-emerald-600">
              <TrafliLogo />
            </div>
            <span className="text-xl font-bold text-slate-800">
              {isRTL ? 'ترافعلي' : 'Traf3li'}
            </span>
          </div>

          {/* Tagline - Hidden on mobile */}
          <div className="hidden md:block">
            <span className="text-sm text-slate-500">
              {isRTL
                ? 'المنصة القانونية الأولى في المملكة'
                : 'The Leading Legal Platform in Saudi Arabia'
              }
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
