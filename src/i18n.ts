import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import translationAR from './locales/ar/translation.json'
import translationEN from './locales/en/translation.json'

// IMPORTANT: Arabic (ar) is listed FIRST - this is the default language for Saudi Arabia
const resources = {
  ar: {
    translation: translationAR,
  },
  en: {
    translation: translationEN,
  },
}

// DEFAULT_LANGUAGE - Arabic is the primary language for this Saudi law firm app
const DEFAULT_LANGUAGE = 'ar' as const

// Get stored language preference
// ONLY returns 'en' if user EXPLICITLY chose English
// Everything else defaults to Arabic
const getStoredLanguage = (): 'ar' | 'en' => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  try {
    const stored = localStorage.getItem('i18nextLng')
    // ONLY English if explicitly set to 'en'
    return stored === 'en' ? 'en' : DEFAULT_LANGUAGE
  } catch {
    // localStorage might be blocked in some browsers
    return DEFAULT_LANGUAGE
  }
}

const initialLanguage = getStoredLanguage()

// Set direction IMMEDIATELY before i18n even initializes
// This prevents flash of wrong direction
if (typeof document !== 'undefined') {
  const dir = initialLanguage === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = initialLanguage
}

// Save the language choice to localStorage
if (typeof window !== 'undefined') {
  try {
    localStorage.setItem('i18nextLng', initialLanguage)
  } catch {
    // Ignore localStorage errors
  }
}

// Initialize i18next SYNCHRONOUSLY with Arabic as absolute default
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: ['ar', 'en'],
    nonExplicitSupportedLngs: false,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    // These ensure synchronous initialization
    initImmediate: false,
    react: {
      useSuspense: false,
    },
  })

// After init, FORCE the language if it doesn't match
// This is the nuclear option to ensure Arabic is set
if (i18n.language !== initialLanguage) {
  i18n.changeLanguage(initialLanguage)
}

// Listen for language changes and update DOM + localStorage
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lng
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('i18nextLng', lng)
    } catch {
      // Ignore
    }
  }
})

export default i18n
