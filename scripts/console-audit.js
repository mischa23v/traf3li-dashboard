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

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const OUTPUT_FILE = path.join(__dirname, '..', 'console-audit-report.json');

// Pages to audit - public pages only for CI (no auth required)
// In CI, authenticated pages will redirect to login, so we only audit public pages
const PUBLIC_PAGES = [
  '/',
  '/sign-in',
  '/otp',
  '/sign-up',
  '/forgot-password',
];

// Full list for local testing with authentication
const ALL_PAGES = [
  ...PUBLIC_PAGES,
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

// Use PUBLIC_PAGES in CI, ALL_PAGES for local testing
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const PAGES = isCI ? PUBLIC_PAGES : ALL_PAGES;

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

// Helper to write results - MUST always write before exiting
function writeResults(results) {
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`Report saved to: ${OUTPUT_FILE}`);
    return true;
  } catch (err) {
    console.error('Failed to write report:', err.message);
    return false;
  }
}

// Filter out noise - browser extension errors, expected warnings, etc.
function isRealError(log) {
  const text = log.text || '';
  const ignorePatterns = [
    // Browser extension errors
    'chrome-extension://',
    'moz-extension://',
    // React DevTools
    'Download the React DevTools',
    // Expected development warnings
    'Warning: ReactDOM.render is no longer supported',
    // Font loading (not critical)
    'Failed to decode downloaded font',
    // Service worker scope
    'service worker scope',
  ];
  return !ignorePatterns.some(pattern => text.includes(pattern));
}

async function runAudit() {
  console.log('Starting Console Audit...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_FILE}`);
  console.log(`Mode: ${isCI ? 'CI (public pages only)' : 'Local (all pages)'}`);
  console.log(`Pages to audit: ${PAGES.length}\n`);

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

  let browser = null;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'ar-SA',
    });

    for (const pagePath of PAGES) {
      const url = `${BASE_URL}${pagePath}`;
      console.log(`Auditing: ${pagePath}`);

      try {
        const page = await context.newPage();
        const logs = await auditPage(page, url);
        await page.close();

        // Filter out noise
        const filteredLogs = logs.filter(isRealError);
        const errors = filteredLogs.filter((l) => l.type === 'error' || l.type === 'pageerror');
        const warnings = filteredLogs.filter((l) => l.type === 'warn');
        const requestFailed = filteredLogs.filter((l) => l.type === 'requestfailed');

        results.pages[pagePath] = {
          url,
          errorCount: errors.length,
          warningCount: warnings.length,
          requestFailedCount: requestFailed.length,
          logs: filteredLogs,
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
      } catch (pageError) {
        console.log(`  - Error auditing page: ${pageError.message}`);
        results.pages[pagePath] = {
          url,
          errorCount: 1,
          warningCount: 0,
          requestFailedCount: 0,
          logs: [{ type: 'audit_error', text: pageError.message }],
        };
        results.summary.totalErrors += 1;
        results.summary.pagesWithErrors++;
      }
    }

    await browser.close();
    browser = null;
  } catch (error) {
    console.error('Browser error:', error.message);
    results.summary.totalErrors += 1;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore close errors
      }
    }
  }

  // ALWAYS write results before exiting
  writeResults(results);

  // Print summary
  console.log('\n========== AUDIT SUMMARY ==========');
  console.log(`Total Pages: ${results.summary.totalPages}`);
  console.log(`Pages with Issues: ${results.summary.pagesWithErrors}`);
  console.log(`Total Errors: ${results.summary.totalErrors}`);
  console.log(`Total Warnings: ${results.summary.totalWarnings}`);
  console.log(`Failed Requests: ${results.summary.totalRequestFailed}`);
  console.log('====================================\n');

  // Return error count for the caller to decide exit code
  return results.summary.totalErrors;
}

runAudit()
  .then((errorCount) => {
    // Exit with code 1 if errors found (for CI to detect failures)
    // But report is already written, so artifact upload will work
    if (errorCount > 0) {
      console.log(`\n❌ Found ${errorCount} console errors. Exiting with code 1.`);
      process.exit(1);
    } else {
      console.log('\n✅ No console errors found!');
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('Audit failed:', error);

    // Write a minimal report even on failure so the workflow can upload something
    const failureReport = {
      generatedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      error: error.message,
      summary: {
        totalPages: 0,
        pagesWithErrors: 0,
        totalErrors: 1,
        totalWarnings: 0,
        totalRequestFailed: 0,
      },
      pages: {},
    };

    writeResults(failureReport);
    process.exit(1);
  });
