import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

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
const storedLang = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    lng: storedLang || 'ar', // Use stored language or default to Arabic on first load
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Only use localStorage - don't detect browser language
      // This ensures Arabic is always the default on first load
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

// Set document direction based on language
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = lng
})

// Set initial direction
const initialDir = i18n.language === 'ar' ? 'rtl' : 'ltr'
document.documentElement.dir = initialDir
document.documentElement.lang = i18n.language

export default i18n