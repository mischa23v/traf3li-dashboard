import type { Font } from '@pdfme/common';

/**
 * PDFMe Font Configuration
 * Supports Arabic (Cairo, Tajawal) and English fonts
 * Using Google Fonts GitHub CDN for reliable font delivery
 *
 * Font URLs verified and tested for production use
 */
export const fonts: Font = {
  // Arabic fonts with fallback
  Cairo: {
    // Variable font supporting multiple weights and slant variations
    data: 'https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo%5Bslnt%2Cwght%5D.ttf',
    fallback: true,
  },
  Tajawal: {
    data: 'https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/Tajawal-Regular.ttf',
    fallback: false,
  },
  // English fonts
  Roboto: {
    // Variable font supporting multiple widths and weights
    data: 'https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto%5Bwdth%2Cwght%5D.ttf',
    fallback: false,
  },
  'Roboto-Bold': {
    // Same variable font handles bold weight
    data: 'https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto%5Bwdth%2Cwght%5D.ttf',
    fallback: false,
  },
};

/**
 * Theme Configuration using Ant Design tokens
 */
export const themeConfig = {
  token: {
    colorPrimary: '#10b981', // Emerald color
    borderRadius: 8,
    fontFamily: 'Cairo, Tajawal, Roboto, sans-serif',
  },
};

/**
 * Language options for PDFMe
 */
export const languageOptions = ['en', 'ar'] as const;
export type LanguageOption = (typeof languageOptions)[number];

/**
 * Default PDFMe options
 */
export const defaultOptions = {
  lang: 'ar' as const,
  font: 'Cairo',
};

/**
 * RTL Configuration
 */
export const rtlConfig = {
  ar: {
    direction: 'rtl' as const,
    fonts: ['Cairo', 'Tajawal'],
    defaultFont: 'Cairo',
  },
  en: {
    direction: 'ltr' as const,
    fonts: ['Roboto', 'Roboto-Bold'],
    defaultFont: 'Roboto',
  },
};

/**
 * Get font family based on language
 */
export const getFontByLanguage = (lang: LanguageOption): string => {
  return rtlConfig[lang].defaultFont;
};

/**
 * Get text direction based on language
 */
export const getDirectionByLanguage = (lang: LanguageOption): 'rtl' | 'ltr' => {
  return rtlConfig[lang].direction;
};

/**
 * PDFMe common options that can be shared across templates
 */
export const commonPdfOptions = {
  fonts,
  lang: defaultOptions.lang,
  font: defaultOptions.font,
};
