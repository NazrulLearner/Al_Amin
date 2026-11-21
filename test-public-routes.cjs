const { chromium } = require('playwright');

async function testRoutes() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  const baseUrl = 'http://localhost:5174';
  const routes = [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About Us' },
    { path: '/activities', name: 'Activities' },
    { path: '/contact', name: 'Contact' },
    { path: '/faq', name: 'FAQ' },
    { path: '/privacy-terms', name: 'Privacy & Terms' },
  ];

  console.log('=== Testing Public Routes (Unauthenticated) ===\n');

  for (const route of routes) {
    try {
      const url = baseUrl + route.path;
      console.log(`\n📍 Testing ${route.name} (${url})...`);

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait a bit for React to hydrate
      await page.waitForTimeout(2000);

      // Check if we got redirected to login (bad)
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log(`   ❌ FAILED: Redirected to login page`);
      } else {
        console.log(`   ✅ SUCCESS: Loaded at ${currentUrl}`);

        // Check for PublicHeader (nav) presence
        const header = await page.locator('header, nav').first().isVisible({ timeout: 5000 }).catch(() => false);
        console.log(`   Header/Nav visible: ${header ? 'Yes' : 'No'}`);

        // Check for PublicFooter presence
        const footer = await page.locator('footer').first().isVisible({ timeout: 5000 }).catch(() => false);
        console.log(`   Footer visible: ${footer ? 'Yes' : 'No'}`);

        // Check page content
        const bodyText = await page.locator('body').textContent({ timeout: 3000 }).catch(() => '');
        const hasContent = bodyText && bodyText.length > 100;
        console.log(`   Has content: ${hasContent ? 'Yes' : 'No'} (${bodyText?.length || 0} chars)`);
      }
    } catch (err) {
      console.log(`   ❌ ERROR: ${err.message}`);
    }
  }

  console.log('\n=== Testing Private Route Protection ===');
  const privateRoutes = ['/admin-dashboard', '/member-dashboard', '/cashier-dashboard', '/collector/dashboard'];
  for (const route of privateRoutes) {
    try {
      await page.goto(baseUrl + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log(`   ✅ SUCCESS: ${route} correctly redirects to /login`);
      } else {
        console.log(`   ❌ FAILED: ${route} did not redirect to login (at ${currentUrl})`);
      }
    } catch (err) {
      console.log(`   ERROR for ${route}: ${err.message}`);
    }
  }

  console.log('\n=== Testing Login Page Access ===');
  try {
    await page.goto(baseUrl + '/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log(`   ✅ SUCCESS: /login page accessible`);
    } else {
      console.log(`   ❌ FAILED: /login not accessible (at ${currentUrl})`);
    }
  } catch (err) {
    console.log(`   ERROR: ${err.message}`);
  }

  await browser.close();
  console.log('\n=== All Tests Complete ===');
}

testRoutes().catch(console.error);