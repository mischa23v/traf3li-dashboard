const { chromium } = require('playwright');

async function checkPage(url, pageName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Checking: ${pageName}`);
  console.log(`URL: ${url}`);
  console.log('='.repeat(80));

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const messages = [];

  // Capture console messages
  page.on('console', msg => {
    messages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  // Capture page errors
  page.on('pageerror', error => {
    messages.push({
      type: 'error',
      text: `PAGE ERROR: ${error.message}`,
      stack: error.stack
    });
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait a bit more for any async operations
    await page.waitForTimeout(3000);

    // Print all messages
    if (messages.length === 0) {
      console.log('✅ No console messages');
    } else {
      console.log(`\nFound ${messages.length} console message(s):\n`);
      messages.forEach((msg, idx) => {
        console.log(`[${idx + 1}] Type: ${msg.type.toUpperCase()}`);
        console.log(`    Text: ${msg.text}`);
        if (msg.location) {
          console.log(`    Location: ${msg.location.url}:${msg.location.lineNumber}:${msg.location.columnNumber}`);
        }
        if (msg.stack) {
          console.log(`    Stack: ${msg.stack}`);
        }
        console.log('');
      });
    }
  } catch (error) {
    console.error(`❌ Error loading page: ${error.message}`);
  }

  await browser.close();
}

async function main() {
  const baseUrl = 'http://localhost:5177';
  const pages = [
    { url: `${baseUrl}/dashboard/sales/leads`, name: 'Sales Leads' },
    { url: `${baseUrl}/dashboard/sales/pipeline`, name: 'Sales Pipeline' },
    { url: `${baseUrl}/dashboard/sales/referrals`, name: 'Sales Referrals' },
    { url: `${baseUrl}/dashboard/sales/reports`, name: 'Sales Reports' }
  ];

  console.log('🔍 TRAF3LI Console Error Check');
  console.log(`Starting check at: ${new Date().toISOString()}`);

  for (const page of pages) {
    await checkPage(page.url, page.name);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Check complete!');
  console.log('='.repeat(80));
}

main().catch(console.error);
