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

// First visit detection - ensures new visitors ALWAYS get Arabic
const ensureFirstVisitArabic = (): void => {
  if (typeof window === 'undefined') return

  try {
    const isFirstVisit = !localStorage.getItem('traf3li_visited')
    if (isFirstVisit) {
      localStorage.setItem('i18nextLng', 'ar')
      localStorage.setItem('traf3li_visited', 'true')
    }
  } catch {
    // Ignore localStorage errors
  }
}

// Run first visit check BEFORE anything else
ensureFirstVisitArabic()

// Get stored language preference - ONLY returns 'en' if explicitly set
const getStoredLanguage = (): 'ar' | 'en' => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  try {
    const stored = localStorage.getItem('i18nextLng')
    return stored === 'en' ? 'en' : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

const initialLanguage = getStoredLanguage()

// Set direction IMMEDIATELY before i18n initializes
if (typeof document !== 'undefined') {
  document.documentElement.dir = initialLanguage === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = initialLanguage
}

// Save the language choice to localStorage
if (typeof window !== 'undefined') {
  try {
    localStorage.setItem('i18nextLng', initialLanguage)
  } catch {
    // Ignore
  }
}

// Initialize i18next
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
    initImmediate: false,
    react: {
      useSuspense: false,
    },
  })

// Force language if mismatch after init
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
