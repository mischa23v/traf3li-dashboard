import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174';

const PAGES_TO_CHECK = [
  '/dashboard/pdf-templates',
];

test.describe('PDF Templates Console Error and Warning Check', () => {
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
        timeout: 60000,
      });

      // Wait a bit more for any delayed console messages
      await page.waitForTimeout(3000);

      // Take a screenshot to see what's rendered
      await page.screenshot({
        path: 'pdf-templates-screenshot.png',
        fullPage: true
      });

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

      // Filter out React DevTools and expected warnings
      const errors = consoleMessages.filter((m) => m.type === 'error' || m.type === 'pageerror');
      const reactErrors = errors.filter(e =>
        !e.text.includes('Download the React DevTools') &&
        !e.text.includes('react-devtools') &&
        !e.text.includes('401') // Filter out expected auth errors
      );

      const pdfmeErrors = errors.filter(e =>
        e.text.toLowerCase().includes('pdfme') ||
        e.text.toLowerCase().includes('form-render') ||
        (e.text.toLowerCase().includes('react') && e.text.toLowerCase().includes('19'))
      );

      // Report specifically about React 19 and @pdfme compatibility
      if (pdfmeErrors.length > 0) {
        console.log(`\n🔴 CRITICAL: Found ${pdfmeErrors.length} error(s) related to React 19 / @pdfme compatibility!`);
        expect(pdfmeErrors.length).toBe(0);
      } else if (reactErrors.length > 0) {
        console.log(`\n⚠️  Found ${reactErrors.length} other React error(s) (excluding auth errors)`);
      } else {
        console.log(`\n✅ No React 19 / @pdfme compatibility errors detected!`);
      }
    });
  }
});
