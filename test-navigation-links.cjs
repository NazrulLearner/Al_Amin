const { chromium } = require('playwright');

async function testNavigation() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  const baseUrl = 'http://localhost:5174';

  console.log('=== Testing Navigation Links (Journey B) ===\n');

  // Start at Home page
  await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Get all nav links from header and footer
  const navLinks = await page.locator('header a, footer a, nav a').all();
  console.log(`Found ${navLinks.length} navigation links`);

  const publicRoutes = ['/', '/about', '/activities', '/contact', '/faq', '/privacy-terms'];

  for (const route of publicRoutes) {
    const url = baseUrl + route;
    console.log(`\n📍 Navigating to ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      // Check all nav links on this page
      const links = await page.locator('header a, footer a, nav a').all();
      let working = 0, broken = 0;

      for (const link of links) {
        const href = await link.getAttribute('href').catch(() => null);
        if (!href) continue;
        if (href.startsWith('#')) continue; // skip anchor links

        try {
          // Test if the link works by checking if target page loads
          const targetUrl = new URL(href, url).toString();
          // Only test internal routes
          if (!targetUrl.startsWith(baseUrl)) continue;

          const response = await page.request.get(targetUrl, { timeout: 5000 });
          if (response.ok()) working++;
          else broken++;
        } catch (e) {
          broken++;
        }
      }
      console.log(`   Links: ${working} working, ${broken} broken`);
      console.log(`   Page loads: ✅`);
    } catch (err) {
      console.log(`   ❌ ERROR: ${err.message}`);
    }
  }

  console.log('\n=== Testing Direct URL Access (Journey C) ===\n');
  for (const route of publicRoutes) {
    const url = baseUrl + route;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log(`   ❌ ${route}: Redirected to login`);
      } else {
        console.log(`   ✅ ${route}: Direct access works`);
      }
    } catch (err) {
      console.log(`   ❌ ${route}: ${err.message}`);
    }
  }

  console.log('\n=== Testing Login Flow (Journey E) ===\n');
  await page.goto(baseUrl + '/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  console.log(`   Login page accessible: ${page.url().includes('/login') ? '✅' : '❌'}`);

  await browser.close();
  console.log('\n=== All Navigation Tests Complete ===');
}

testNavigation().catch(console.error);