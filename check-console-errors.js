import { chromium } from '@playwright/test';

const pages = [
  '/dashboard/hr/employees',
  '/dashboard/hr/leave',
  '/dashboard/hr/payroll',
  '/dashboard/hr/attendance',
  '/dashboard/hr/recruitment',
];

async function checkPage(browser, url) {
  const page = await browser.newPage();
  const messages = [];

  // Capture console messages
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    messages.push({ type, text });
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    messages.push({ type: 'pageerror', text: error.toString() });
  });

  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Checking: ${url}`);
    console.log('='.repeat(80));

    await page.goto(`http://localhost:5177${url}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait a bit more for any async operations
    await page.waitForTimeout(2000);

    // Report messages
    const errors = messages.filter((m) => m.type === 'error' || m.type === 'pageerror');
    const warnings = messages.filter((m) => m.type === 'warning');
    const others = messages.filter((m) => m.type !== 'error' && m.type !== 'pageerror' && m.type !== 'warning');

    console.log(`\nTotal console messages: ${messages.length}`);

    if (errors.length > 0) {
      console.log(`\n🔴 ERRORS (${errors.length}):`);
      errors.forEach((msg, i) => {
        console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
      });
    }

    if (warnings.length > 0) {
      console.log(`\n🟡 WARNINGS (${warnings.length}):`);
      warnings.forEach((msg, i) => {
        console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
      });
    }

    if (others.length > 0) {
      console.log(`\nℹ️  OTHER MESSAGES (${others.length}):`);
      others.forEach((msg, i) => {
        console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
      });
    }

    if (messages.length === 0) {
      console.log('\n✅ No console messages detected');
    }

  } catch (error) {
    console.log(`\n❌ Failed to load page: ${error.message}`);
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('Starting console error check on http://localhost:5177');
  console.log('Checking pages:', pages);

  const browser = await chromium.launch();

  for (const pagePath of pages) {
    await checkPage(browser, pagePath);
  }

  await browser.close();
  console.log(`\n${'='.repeat(80)}`);
  console.log('Check complete!');
  console.log('='.repeat(80));
}

main().catch(console.error);
