import { test, expect, Page } from '@playwright/test';

// Pages requested by user
const pages = [
  '/dashboard/library/laws',
  '/dashboard/library/rulings',
  '/dashboard/settings',
  '/dashboard/calendar',
];

// Base URL - using port 5177 as specified
const BASE_URL = 'http://localhost:5177';

interface ConsoleMessage {
  type: string;
  text: string;
  location?: string;
}

async function checkPageForConsoleErrors(page: Page, url: string) {
  const consoleMessages: ConsoleMessage[] = [];
  const pageErrors: string[] = [];

  // Listen for console messages
  page.on('console', (msg) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location() ? `${msg.location().url}:${msg.location().lineNumber}` : undefined,
    });
  });

  // Listen for page errors
  page.on('pageerror', (error) => {
    pageErrors.push(error.toString());
  });

  // Navigate to the page
  await page.goto(`${BASE_URL}${url}`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  // Wait for any async operations to complete
  await page.waitForTimeout(3000);

  return {
    consoleMessages,
    pageErrors,
  };
}

// Create a test for each page
pages.forEach((pagePath) => {
  test(`Console check: ${pagePath}`, async ({ page }) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Checking page: ${pagePath}`);
    console.log('='.repeat(80));

    const { consoleMessages, pageErrors } = await checkPageForConsoleErrors(page, pagePath);

    // Filter messages by type
    const errors = consoleMessages.filter((m) => m.type === 'error');
    const warnings = consoleMessages.filter((m) => m.type === 'warning');
    const others = consoleMessages.filter(
      (m) => m.type !== 'error' && m.type !== 'warning',
    );

    // Log results
    console.log(`\nTotal console messages: ${consoleMessages.length}`);

    if (pageErrors.length > 0) {
      console.log(`\n🔴 PAGE ERRORS (${pageErrors.length}):`);
      pageErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }

    if (errors.length > 0) {
      console.log(`\n🔴 CONSOLE ERRORS (${errors.length}):`);
      errors.forEach((msg, i) => {
        console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
        if (msg.location) {
          console.log(`     Location: ${msg.location}`);
        }
      });
    }

    if (warnings.length > 0) {
      console.log(`\n🟡 CONSOLE WARNINGS (${warnings.length}):`);
      warnings.forEach((msg, i) => {
        console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
        if (msg.location) {
          console.log(`     Location: ${msg.location}`);
        }
      });
    }

    if (others.length > 0 && others.length <= 10) {
      console.log(`\nℹ️  OTHER MESSAGES (${others.length}):`);
      others.forEach((msg, i) => {
        console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
      });
    } else if (others.length > 10) {
      console.log(`\nℹ️  OTHER MESSAGES: ${others.length} (showing first 10):`);
      others.slice(0, 10).forEach((msg, i) => {
        console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
      });
    }

    if (
      consoleMessages.length === 0 &&
      pageErrors.length === 0
    ) {
      console.log('\n✅ No console messages or errors detected');
    }

    // Report summary
    console.log('\n--- SUMMARY ---');
    console.log(`Page Errors: ${pageErrors.length}`);
    console.log(`Console Errors: ${errors.length}`);
    console.log(`Console Warnings: ${warnings.length}`);
    console.log(`Other Messages: ${others.length}`);
    console.log('='.repeat(80));

    // Test assertions - this test will pass even if there are errors
    // We're just using it to collect and report information
    expect(true).toBe(true);
  });
});
