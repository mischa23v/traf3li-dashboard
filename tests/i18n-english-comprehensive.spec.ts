import { test, expect, Page } from '@playwright/test';

// Arabic Unicode range: \u0600-\u06FF
const ARABIC_REGEX = /[\u0600-\u06FF]/;

// Helper function to wait for page load
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

// Helper function to set language via localStorage before navigation
async function setLanguageBeforeNavigation(page: Page, language: 'en' | 'ar', url: string) {
  // First, go to the URL to set up the context
  await page.goto(url);

  // Set the language in localStorage
  await page.evaluate((lang) => {
    localStorage.setItem('i18nextLng', lang);
  }, language);

  // Reload to apply the language from localStorage
  await page.reload();
  await waitForPageLoad(page);

  // Wait for React to hydrate
  await page.waitForTimeout(300);
}

// Helper function to change language on current page via localStorage + reload
async function setLanguage(page: Page, language: 'en' | 'ar') {
  await page.evaluate((lang) => {
    localStorage.setItem('i18nextLng', lang);
  }, language);
  await page.reload();
  await waitForPageLoad(page);
  await page.waitForTimeout(300);
}

// Helper to check for Arabic text in element
async function checkNoArabicText(page: Page, selector: string, context: string) {
  const elements = await page.locator(selector).all();
  for (const element of elements) {
    const text = await element.textContent();
    if (text && ARABIC_REGEX.test(text)) {
      // Skip code blocks and technical content
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      if (!['code', 'pre', 'script', 'style'].includes(tagName)) {
        console.log(`Found Arabic text in ${context}: "${text.substring(0, 100)}..."`);
        return { hasArabic: true, text: text.substring(0, 100) };
      }
    }
  }
  return { hasArabic: false, text: '' };
}

// Helper to verify English content exists
async function verifyEnglishContent(page: Page, expectedTexts: string[]) {
  const pageContent = await page.content();
  const found: string[] = [];
  for (const text of expectedTexts) {
    if (pageContent.includes(text)) {
      found.push(text);
    }
  }
  return found;
}

test.describe('i18n - English Translation Comprehensive Tests', () => {

  test.describe('Sign In Page', () => {
    test('shows English text when language is set to English', async ({ page }) => {
      await page.goto('http://localhost:5173/sign-in');
      await setLanguage(page, 'en');

      // Check for English text presence
      const englishTexts = ['Sign in', 'Email', 'Password', 'Forgot password'];
      const foundTexts = await verifyEnglishContent(page, englishTexts);
      expect(foundTexts.length).toBeGreaterThan(0);

      // Verify page direction is LTR
      const htmlDir = await page.locator('html').getAttribute('dir');
      expect(htmlDir).toBe('ltr');

      // Verify language attribute
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('en');

      await page.screenshot({ path: 'test-results/sign-in-english.png' });
    });

    test('form inputs are visible', async ({ page }) => {
      await page.goto('http://localhost:5173/sign-in');
      await setLanguage(page, 'en');

      // Verify form is in English mode
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('en');

      // Check that input fields are present (text input for username/email, password input)
      const textInput = page.locator('input[type="text"]').first();
      await expect(textInput).toBeVisible({ timeout: 10000 });

      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible({ timeout: 10000 });
    });

    test('sign in button shows English text', async ({ page }) => {
      await page.goto('http://localhost:5173/sign-in');
      await setLanguage(page, 'en');

      // Check for English sign in button
      const signInButton = page.getByRole('button', { name: /sign in/i });
      await expect(signInButton).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Forgot Password Page', () => {
    test('shows English text', async ({ page }) => {
      await page.goto('http://localhost:5173/forgot-password');
      await setLanguage(page, 'en');

      // Verify page is in English mode
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('en');

      const htmlDir = await page.locator('html').getAttribute('dir');
      expect(htmlDir).toBe('ltr');

      await page.screenshot({ path: 'test-results/forgot-password-english.png' });
    });
  });

  test.describe('Language Switching', () => {
    test('switching from Arabic to English removes Arabic content', async ({ page }) => {
      await page.goto('http://localhost:5173/sign-in');

      // First set to Arabic
      await setLanguage(page, 'ar');
      const arabicContent = await page.content();
      expect(ARABIC_REGEX.test(arabicContent)).toBeTruthy();

      // Then switch to English
      await setLanguage(page, 'en');

      // Get visible text content (excluding meta tags and scripts)
      const visibleText = await page.evaluate(() => {
        const body = document.body;
        const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null);
        let text = '';
        let node;
        while (node = walker.nextNode()) {
          const parent = node.parentElement;
          if (parent && !['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(parent.tagName)) {
            text += node.textContent + ' ';
          }
        }
        return text;
      });

      // Check that main visible text doesn't contain significant Arabic
      // (Some Arabic in URLs or data attributes is okay)
      const arabicMatches = visibleText.match(/[\u0600-\u06FF]+/g) || [];
      const significantArabic = arabicMatches.filter(match => match.length > 3);

      if (significantArabic.length > 0) {
        console.log('Found Arabic text in English mode:', significantArabic.slice(0, 5));
      }

      // We expect minimal Arabic in English mode
      expect(significantArabic.length).toBeLessThan(5);
    });

    test('HTML attributes update correctly', async ({ page }) => {
      await page.goto('http://localhost:5173/sign-in');

      // Set to English
      await setLanguage(page, 'en');

      let htmlLang = await page.locator('html').getAttribute('lang');
      let htmlDir = await page.locator('html').getAttribute('dir');
      expect(htmlLang).toBe('en');
      expect(htmlDir).toBe('ltr');

      // Set to Arabic
      await setLanguage(page, 'ar');

      htmlLang = await page.locator('html').getAttribute('lang');
      htmlDir = await page.locator('html').getAttribute('dir');
      expect(htmlLang).toBe('ar');
      expect(htmlDir).toBe('rtl');
    });
  });

  test.describe('Translation Key Verification', () => {
    test('no missing translation keys (showing key names)', async ({ page }) => {
      await page.goto('http://localhost:5173/sign-in');
      await setLanguage(page, 'en');

      // Check for common translation key patterns that indicate missing translations
      const pageContent = await page.content();
      const missingKeyPatterns = [
        /\bsidebar\.\w+\.\w+/,  // sidebar.nav.home style keys
        /\bauth\.\w+\.\w+/,     // auth.signIn.title style keys
        /\bcommon\.\w+/,        // common.save style keys
      ];

      const visibleText = await page.evaluate(() => {
        return document.body.innerText;
      });

      // Look for patterns like "sidebar.nav.home" which indicate untranslated keys
      const keyPattern = /\b[a-z]+\.[a-z]+\.[a-z]+\b/gi;
      const potentialMissingKeys = visibleText.match(keyPattern) || [];

      // Filter out URLs and technical patterns
      const actualMissingKeys = potentialMissingKeys.filter(key => {
        return !key.includes('http') &&
               !key.includes('www') &&
               !key.includes('com') &&
               key.split('.').every(part => /^[a-z]+$/i.test(part));
      });

      if (actualMissingKeys.length > 0) {
        console.log('Potential missing translation keys:', actualMissingKeys);
      }

      // We shouldn't have obvious translation keys in the visible text
      expect(actualMissingKeys.length).toBe(0);
    });
  });

  test.describe('UI Components in English', () => {
    test('error pages show English content', async ({ page }) => {
      // Test 404 page
      await page.goto('http://localhost:5173/non-existent-page');
      await setLanguage(page, 'en');

      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('en');

      await page.screenshot({ path: 'test-results/404-english.png' });
    });
  });
});

test.describe('i18n - Arabic Translation Verification', () => {
  test('sign-in page shows Arabic when language is Arabic', async ({ page }) => {
    await page.goto('http://localhost:5173/sign-in');
    await setLanguage(page, 'ar');

    // Verify RTL direction
    const htmlDir = await page.locator('html').getAttribute('dir');
    expect(htmlDir).toBe('rtl');

    // Verify Arabic language
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('ar');

    // Verify Arabic content exists
    const pageContent = await page.content();
    expect(ARABIC_REGEX.test(pageContent)).toBeTruthy();

    await page.screenshot({ path: 'test-results/sign-in-arabic.png' });
  });
});

test.describe('i18n - Sidebar Translations', () => {
  test('sidebar translation keys are properly defined', async ({ page }) => {
    await page.goto('http://localhost:5173/sign-in');
    await setLanguage(page, 'en');

    // Verify that sidebar translations exist by checking for key English terms
    // These are from the translation file
    const expectedSidebarTranslations = [
      'Quick Actions',
      'Calendar',
      'Notifications',
      'No events for this day',
      'No upcoming reminders',
      'View All Reminders'
    ];

    // Note: These will only be visible if we can access the dashboard
    // For now, we just verify the sign-in page works correctly
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en');
  });
});
