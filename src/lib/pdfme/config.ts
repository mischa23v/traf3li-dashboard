import type { Font } from '@pdfme/common';

/**
 * PDFMe Font Configuration
 * Supports Arabic (Cairo, Tajawal) and English fonts
 */
export const fonts: Font = {
  // Arabic fonts with fallback
  Cairo: {
    data: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hGA-W1ToLQ-HmA.ttf',
    fallback: true,
  },
  Tajawal: {
    data: 'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l_6gLrZjiLlJ-G0.ttf',
    fallback: false,
  },
  // English fonts
  Roboto: {
    data: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff',
    fallback: false,
  },
  'Roboto-Bold': {
    data: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff',
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
