import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import translationAR from './locales/ar/translation.json'
import translationEN from './locales/en/translation.json'

// IMPORTANT: Arabic (ar) is listed FIRST - this is the default language
const resources = {
  ar: {
    translation: translationAR,
  },
  en: {
    translation: translationEN,
  },
}

// Get stored language preference, default to Arabic
const getStoredLanguage = (): 'ar' | 'en' => {
  if (typeof window === 'undefined') return 'ar'

  const stored = localStorage.getItem('i18nextLng')

  // Only return English if explicitly set, otherwise always Arabic
  if (stored === 'en') return 'en'

  // For any other value (null, undefined, 'ar', or invalid), use Arabic
  return 'ar'
}

const initialLanguage = getStoredLanguage()

// Ensure localStorage has the language set (for new visitors)
if (typeof window !== 'undefined') {
  localStorage.setItem('i18nextLng', initialLanguage)
}

// Initialize i18next with explicit Arabic default
// initSync ensures synchronous initialization
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,           // Explicit language setting
    fallbackLng: 'ar',              // Fallback to Arabic
    supportedLngs: ['ar', 'en'],    // Only these languages supported
    nonExplicitSupportedLngs: false, // Don't support language variants like 'en-US'
    load: 'languageOnly',           // Don't load 'en-US', just 'en'
    debug: import.meta.env.DEV,     // Only debug in development
    interpolation: {
      escapeValue: false,
    },
    initImmediate: true,            // Initialize immediately (sync)
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

// FORCE the language after init (belt and suspenders approach)
// This ensures Arabic is set even if something else overrides it
if (i18n.language !== initialLanguage) {
  console.warn(`[i18n] Language mismatch! Expected ${initialLanguage}, got ${i18n.language}. Forcing...`)
  i18n.changeLanguage(initialLanguage)
}

// Set initial direction based on ACTUAL current language
const currentLang = i18n.language || initialLanguage
const initialDir = currentLang === 'ar' ? 'rtl' : 'ltr'
document.documentElement.dir = initialDir
document.documentElement.lang = currentLang

export default i18n
