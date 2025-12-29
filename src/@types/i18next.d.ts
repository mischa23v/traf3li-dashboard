/**
 * Type-safe i18next configuration
 *
 * This file provides compile-time type checking for translation keys.
 * When you use t('key'), TypeScript will validate the key exists.
 *
 * Pattern used by: Google, Meta, Airbnb, Stripe
 *
 * Benefits:
 * - Autocomplete for translation keys in IDE
 * - Compile-time errors for typos
 * - Refactoring support (rename key = update all usages)
 */

import 'i18next'

// Import the translation files to infer types
import type translationEN from '@/locales/en/translation.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    // Enable type-safe translations
    defaultNS: 'translation'

    // Define the resources structure
    resources: {
      translation: typeof translationEN
    }

    // Return string type instead of any for t() function
    returnNull: false
    returnEmptyString: false
  }
}
