import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5177';

const PAGES_TO_CHECK = [
  '/dashboard/messages',
  '/dashboard/clients',
  '/dashboard/contacts',
  '/dashboard/organizations',
];

test.describe('Console Error and Warning Check', () => {
  for (const pagePath of PAGES_TO_CHECK) {
    test(`Check console messages on ${pagePath}`, async ({ page }) => {
      const consoleMessages: Array<{
        type: string;
        text: string;
        location?: string;
      }> = [];

      // Listen for all console events
      page.on('console', (msg) => {
        const type = msg.type();
        if (type === 'error' || type === 'warning' || type === 'log') {
          consoleMessages.push({
            type,
            text: msg.text(),
            location: msg.location()?.url,
          });
        }
      });

      // Listen for page errors
      page.on('pageerror', (error) => {
        consoleMessages.push({
          type: 'pageerror',
          text: error.message,
        });
      });

      // Navigate to the page
      await page.goto(`${BASE_URL}${pagePath}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait a bit more for any delayed console messages
      await page.waitForTimeout(2000);

      // Log all console messages
      console.log(`\n${'='.repeat(80)}`);
      console.log(`Console messages for: ${pagePath}`);
      console.log('='.repeat(80));

      if (consoleMessages.length === 0) {
        console.log('✓ No console messages detected');
      } else {
        const errors = consoleMessages.filter((m) => m.type === 'error' || m.type === 'pageerror');
        const warnings = consoleMessages.filter((m) => m.type === 'warning');
        const logs = consoleMessages.filter((m) => m.type === 'log');

        if (errors.length > 0) {
          console.log(`\n❌ ERRORS (${errors.length}):`);
          errors.forEach((msg, idx) => {
            console.log(`\n${idx + 1}. [${msg.type.toUpperCase()}]`);
            console.log(`   Message: ${msg.text}`);
            if (msg.location) {
              console.log(`   Location: ${msg.location}`);
            }
          });
        }

        if (warnings.length > 0) {
          console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
          warnings.forEach((msg, idx) => {
            console.log(`\n${idx + 1}. [WARNING]`);
            console.log(`   Message: ${msg.text}`);
            if (msg.location) {
              console.log(`   Location: ${msg.location}`);
            }
          });
        }

        if (logs.length > 0) {
          console.log(`\nℹ️  LOGS (${logs.length}):`);
          logs.forEach((msg, idx) => {
            console.log(`\n${idx + 1}. [LOG]`);
            console.log(`   Message: ${msg.text}`);
          });
        }
      }

      console.log('\n' + '='.repeat(80) + '\n');

      // For now, we'll just report, not fail the test
      // If you want to fail on errors, uncomment the line below:
      // expect(errors.length).toBe(0);
    });
  }
});
