import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:5177';
const PAGES_TO_CHECK = [
  '/dashboard/messages',
  '/dashboard/clients',
  '/dashboard/contacts',
  '/dashboard/organizations',
];

async function checkPage(page, pagePath) {
  const consoleMessages = [];

  // Listen for console events
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
      stack: error.stack,
    });
  });

  console.log(`\nNavigating to: ${BASE_URL}${pagePath}`);

  try {
    await page.goto(`${BASE_URL}${pagePath}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for any delayed console messages
    await page.waitForTimeout(3000);

    console.log(`\n${'='.repeat(80)}`);
    console.log(`Console Report for: ${pagePath}`);
    console.log('='.repeat(80));

    const errors = consoleMessages.filter((m) => m.type === 'error' || m.type === 'pageerror');
    const warnings = consoleMessages.filter((m) => m.type === 'warning');
    const logs = consoleMessages.filter((m) => m.type === 'log');

    if (consoleMessages.length === 0) {
      console.log('✓ No console messages detected');
    } else {
      if (errors.length > 0) {
        console.log(`\n❌ ERRORS (${errors.length}):`);
        errors.forEach((msg, idx) => {
          console.log(`\n  ${idx + 1}. [${msg.type.toUpperCase()}]`);
          console.log(`     Message: ${msg.text}`);
          if (msg.location) {
            console.log(`     Location: ${msg.location}`);
          }
          if (msg.stack) {
            console.log(`     Stack: ${msg.stack}`);
          }
        });
      }

      if (warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
        warnings.forEach((msg, idx) => {
          console.log(`\n  ${idx + 1}. [WARNING]`);
          console.log(`     Message: ${msg.text}`);
          if (msg.location) {
            console.log(`     Location: ${msg.location}`);
          }
        });
      }

      if (logs.length > 0) {
        console.log(`\nℹ️  LOGS (${logs.length}):`);
        logs.forEach((msg, idx) => {
          console.log(`\n  ${idx + 1}. [LOG]`);
          console.log(`     Message: ${msg.text}`);
        });
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');

    return {
      page: pagePath,
      errors: errors.length,
      warnings: warnings.length,
      logs: logs.length,
      messages: consoleMessages,
    };
  } catch (error) {
    console.error(`❌ Failed to load ${pagePath}: ${error.message}`);
    return {
      page: pagePath,
      errors: 1,
      warnings: 0,
      logs: 0,
      messages: [{ type: 'error', text: `Navigation failed: ${error.message}` }],
    };
  }
}

async function main() {
  console.log('🔍 Starting Console Error Check...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Pages to check: ${PAGES_TO_CHECK.length}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  for (const pagePath of PAGES_TO_CHECK) {
    const result = await checkPage(page, pagePath);
    results.push(result);
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));

  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings, 0);
  const totalLogs = results.reduce((sum, r) => sum + r.logs, 0);

  results.forEach((result) => {
    const status = result.errors > 0 ? '❌' : result.warnings > 0 ? '⚠️' : '✓';
    console.log(`${status} ${result.page}: ${result.errors} errors, ${result.warnings} warnings, ${result.logs} logs`);
  });

  console.log('\n' + '='.repeat(80));
  console.log(`Total: ${totalErrors} errors, ${totalWarnings} warnings, ${totalLogs} logs`);
  console.log('='.repeat(80));

  process.exit(totalErrors > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
