import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import translationAR from './locales/ar/translation.json'
import translationEN from './locales/en/translation.json'

const resources = {
  ar: {
    translation: translationAR,
  },
  en: {
    translation: translationEN,
  },
}

// Check if language is stored in localStorage
// Default to Arabic if not set (most Saudi lawyers prefer Arabic)
const getInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'ar'

  const storedLang = localStorage.getItem('i18nextLng')

  // If no language stored, set Arabic as default
  if (!storedLang) {
    localStorage.setItem('i18nextLng', 'ar')
    return 'ar'
  }

  // Only accept valid languages (ar or en), default to ar otherwise
  if (storedLang === 'en' || storedLang === 'ar') {
    return storedLang
  }

  // Invalid stored value, reset to Arabic
  localStorage.setItem('i18nextLng', 'ar')
  return 'ar'
}

const initialLanguage = getInitialLanguage()

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    lng: initialLanguage,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    // No language detector plugin - we manually handle language persistence
    // This ensures Arabic is ALWAYS the default on first load
  })

// Set document direction based on language
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = lng
  // Persist language choice to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18nextLng', lng)
  }
})

// Set initial direction
const initialDir = initialLanguage === 'ar' ? 'rtl' : 'ltr'
document.documentElement.dir = initialDir
document.documentElement.lang = initialLanguage

export default i18n
