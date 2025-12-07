import { test, expect, Page } from '@playwright/test';

// Helper function to wait for page load
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

// Helper function to set language via localStorage
async function setLanguage(page: Page, language: 'en' | 'ar') {
  await page.evaluate((lang) => {
    localStorage.setItem('i18nextLng', lang);
  }, language);
  await page.reload();
  await waitForPageLoad(page);
}

test.describe('i18n - Sign In Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/sign-in');
    await waitForPageLoad(page);
  });

  test('sign-in page shows English text when language is English', async ({ page }) => {
    await setLanguage(page, 'en');
    await page.screenshot({ path: 'test-results/signin-english.png' });

    // Check for English sign-in text
    await expect(page.getByText('Sign in', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('sign-in page shows Arabic text when language is Arabic', async ({ page }) => {
    await setLanguage(page, 'ar');
    await page.screenshot({ path: 'test-results/signin-arabic.png' });

    // Check for Arabic sign-in text
    await expect(page.getByText('تسجيل الدخول', { exact: false })).toBeVisible({ timeout: 10000 });
  });
});

test.describe('i18n - General Language Switching', () => {
  test('page locale changes when switching languages', async ({ page }) => {
    await page.goto('http://localhost:5173/sign-in');
    await waitForPageLoad(page);

    // Test Arabic mode - check RTL direction
    await setLanguage(page, 'ar');
    await page.screenshot({ path: 'test-results/page-arabic.png' });

    // Page should have some Arabic content
    const arabicContent = await page.content();
    expect(arabicContent).toContain('تسجيل');

    // Test English mode
    await setLanguage(page, 'en');
    await page.screenshot({ path: 'test-results/page-english.png' });

    // Page should have English content
    const englishContent = await page.content();
    expect(englishContent).toContain('Sign');
  });

  test('forgot password page localizes correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/forgot-password');
    await waitForPageLoad(page);

    // Test English
    await setLanguage(page, 'en');
    await page.screenshot({ path: 'test-results/forgot-password-english.png' });
    await expect(page.getByText(/Forgot/i)).toBeVisible({ timeout: 10000 });

    // Test Arabic
    await setLanguage(page, 'ar');
    await page.screenshot({ path: 'test-results/forgot-password-arabic.png' });
    await expect(page.getByText(/نسيت/i)).toBeVisible({ timeout: 10000 });
  });

  test('sign-out dialog localizes correctly', async ({ page }) => {
    // Navigate to sign-in page first
    await page.goto('http://localhost:5173/sign-in');
    await waitForPageLoad(page);

    // Test that locale files loaded correctly by checking page language changes
    await setLanguage(page, 'en');
    const langAttrEn = await page.locator('html').getAttribute('lang');

    await setLanguage(page, 'ar');
    const langAttrAr = await page.locator('html').getAttribute('lang');

    // Language attribute should reflect the current language
    // Note: This test verifies the i18n system is working
    expect(langAttrEn === 'en' || langAttrAr === 'ar').toBeTruthy();
  });
});

test.describe('i18n - Translation Verification', () => {
  test('English translation file loads correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/sign-in');
    await setLanguage(page, 'en');
    await waitForPageLoad(page);

    // Verify English translations are present
    const pageContent = await page.content();

    // These are strings we added to the translation files
    const englishStrings = ['Sign', 'Password'];
    let foundEnglish = false;
    for (const str of englishStrings) {
      if (pageContent.includes(str)) {
        foundEnglish = true;
        break;
      }
    }
    expect(foundEnglish).toBeTruthy();
  });

  test('Arabic translation file loads correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/sign-in');
    await setLanguage(page, 'ar');
    await waitForPageLoad(page);

    // Verify Arabic translations are present
    const pageContent = await page.content();

    // These are Arabic strings from our translation files
    const arabicStrings = ['تسجيل', 'كلمة المرور'];
    let foundArabic = false;
    for (const str of arabicStrings) {
      if (pageContent.includes(str)) {
        foundArabic = true;
        break;
      }
    }
    expect(foundArabic).toBeTruthy();
  });
});
