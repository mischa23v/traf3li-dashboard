import { useTranslation } from 'react-i18next'

export function SkipToMain() {
  const { t } = useTranslation()

  return (
    <a
      className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring fixed start-4 top-4 z-50 -translate-y-20 px-4 py-2 text-sm font-medium whitespace-nowrap opacity-95 shadow-sm transition-transform focus:translate-y-0 focus-visible:ring-2 focus:outline-none rounded-md"
      href='#content'
    >
      {t('accessibility.skipToMain', 'Skip to main content')}
    </a>
  )
}
