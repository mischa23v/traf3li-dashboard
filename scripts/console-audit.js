/**
 * Console Audit Script
 *
 * Crawls all pages and captures console errors/warnings to a JSON file
 *
 * Usage:
 *   node scripts/console-audit.js
 *
 * Requirements:
 *   - Dev server running on localhost:5173
 *   - Playwright installed: npm install -D @playwright/test
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const OUTPUT_FILE = path.join(__dirname, '..', 'console-audit-report.json');

// Pages to audit (add more as needed)
const PAGES = [
  '/',
  '/sign-in',
  '/dashboard',
  '/dashboard/clients',
  '/dashboard/cases',
  '/dashboard/tasks',
  '/dashboard/tasks/gantt',
  '/dashboard/tasks/calendar',
  '/dashboard/tasks/reminders',
  '/dashboard/tasks/events',
  '/dashboard/finance',
  '/dashboard/finance/invoices',
  '/dashboard/finance/expenses',
  '/dashboard/finance/quotes',
  '/dashboard/finance/bills',
  '/dashboard/finance/accounting',
  '/dashboard/finance/saudi-banking',
  '/dashboard/staff',
  '/dashboard/hr',
  '/dashboard/crm',
  '/dashboard/sales',
  '/dashboard/reports',
  '/dashboard/chats',
  '/dashboard/settings',
  '/dashboard/apps',
];

async function auditPage(page, url) {
  const logs = [];

  // Capture console messages
  page.on('console', (msg) => {
    const type = msg.type();
    if (['error', 'warning', 'warn'].includes(type)) {
      logs.push({
        type: type === 'warning' ? 'warn' : type,
        text: msg.text(),
        location: msg.location(),
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    logs.push({
      type: 'pageerror',
      text: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  });

  // Capture request failures
  page.on('requestfailed', (request) => {
    logs.push({
      type: 'requestfailed',
      text: `${request.failure()?.errorText} - ${request.url()}`,
      method: request.method(),
      timestamp: new Date().toISOString(),
    });
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // Wait a bit for any async errors
    await page.waitForTimeout(2000);
  } catch (error) {
    logs.push({
      type: 'navigation_error',
      text: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  return logs;
}

async function runAudit() {
  console.log('Starting Console Audit...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_FILE}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'ar-SA',
  });

  const results = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalPages: PAGES.length,
      pagesWithErrors: 0,
      totalErrors: 0,
      totalWarnings: 0,
      totalRequestFailed: 0,
    },
    pages: {},
  };

  for (const pagePath of PAGES) {
    const url = `${BASE_URL}${pagePath}`;
    console.log(`Auditing: ${pagePath}`);

    const page = await context.newPage();
    const logs = await auditPage(page, url);
    await page.close();

    const errors = logs.filter((l) => l.type === 'error' || l.type === 'pageerror');
    const warnings = logs.filter((l) => l.type === 'warn');
    const requestFailed = logs.filter((l) => l.type === 'requestfailed');

    results.pages[pagePath] = {
      url,
      errorCount: errors.length,
      warningCount: warnings.length,
      requestFailedCount: requestFailed.length,
      logs,
    };

    results.summary.totalErrors += errors.length;
    results.summary.totalWarnings += warnings.length;
    results.summary.totalRequestFailed += requestFailed.length;

    if (errors.length > 0 || warnings.length > 0) {
      results.summary.pagesWithErrors++;
      console.log(`  - ${errors.length} errors, ${warnings.length} warnings`);
    } else {
      console.log(`  - Clean!`);
    }
  }

  await browser.close();

  // Write results to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));

  // Print summary
  console.log('\n========== AUDIT SUMMARY ==========');
  console.log(`Total Pages: ${results.summary.totalPages}`);
  console.log(`Pages with Issues: ${results.summary.pagesWithErrors}`);
  console.log(`Total Errors: ${results.summary.totalErrors}`);
  console.log(`Total Warnings: ${results.summary.totalWarnings}`);
  console.log(`Failed Requests: ${results.summary.totalRequestFailed}`);
  console.log(`\nReport saved to: ${OUTPUT_FILE}`);
  console.log('====================================\n');

  // Exit with error code if issues found
  if (results.summary.totalErrors > 0) {
    process.exit(1);
  }
}

runAudit().catch((error) => {
  console.error('Audit failed:', error);
  process.exit(1);
});
