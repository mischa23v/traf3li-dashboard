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
  if (typeof window === 'undefined') {
    console.log('[i18n] SSR environment, using default:', DEFAULT_LANGUAGE)
    return DEFAULT_LANGUAGE
  }

  try {
    const stored = localStorage.getItem('i18nextLng')
    console.log('[i18n] localStorage i18nextLng:', stored)

    // ONLY English if explicitly set to 'en'
    const result = stored === 'en' ? 'en' : DEFAULT_LANGUAGE
    console.log('[i18n] Resolved language:', result)
    return result
  } catch (e) {
    // localStorage might be blocked in some browsers
    console.warn('[i18n] localStorage blocked:', e)
    return DEFAULT_LANGUAGE
  }
}

const initialLanguage = getStoredLanguage()
console.log('[i18n] Initial language:', initialLanguage)

// Set direction IMMEDIATELY before i18n even initializes
// This prevents flash of wrong direction
if (typeof document !== 'undefined') {
  const dir = initialLanguage === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = initialLanguage
  console.log('[i18n] Set document dir:', dir, 'lang:', initialLanguage)
}

// Save the language choice to localStorage
if (typeof window !== 'undefined') {
  try {
    localStorage.setItem('i18nextLng', initialLanguage)
    console.log('[i18n] Saved to localStorage:', initialLanguage)
  } catch (e) {
    console.warn('[i18n] Failed to save to localStorage:', e)
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

console.log('[i18n] After init - i18n.language:', i18n.language, 'i18n.resolvedLanguage:', i18n.resolvedLanguage)

// After init, FORCE the language if it doesn't match
// This is the nuclear option to ensure Arabic is set
if (i18n.language !== initialLanguage) {
  console.warn('[i18n] Language mismatch! Expected:', initialLanguage, 'Got:', i18n.language, '- FORCING change')
  i18n.changeLanguage(initialLanguage)
} else {
  console.log('[i18n] Language matches expected:', initialLanguage)
}

// Listen for language changes and update DOM + localStorage
i18n.on('languageChanged', (lng) => {
  console.log('[i18n] Language changed to:', lng)
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

console.log('[i18n] Initialization complete. Final language:', i18n.language)

export default i18n
