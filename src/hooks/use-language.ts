/**
 * useLanguage hook
 *
 * A wrapper around react-i18next's useTranslation hook that provides
 * a simplified interface for accessing the current language and translation function.
 */

import { useTranslation } from 'react-i18next'

export function useLanguage() {
  const { t, i18n } = useTranslation()

  return {
    language: i18n.language,
    t,
    i18n,
    isRTL: i18n.language === 'ar',
    changeLanguage: i18n.changeLanguage.bind(i18n),
  }
}
