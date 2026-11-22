// Test responsive behavior of Add Member page at various breakpoints
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BREAKPOINTS = [320, 375, 390, 430, 768, 1024, 1280];
const URL = 'http://localhost:5174/members/add';
const SCREENSHOTS_DIR = 'screenshots';
const LOGIN_URL = 'http://localhost:5174/login';

// To authenticate, set these environment variables:
//   EMAIL=test@example.com PASSWORD=password
// If not set, tests will run on login page screenshots only (auth check recorded).
const EMAIL = process.env.TEST_EMAIL || '';
const PASSWORD = process.env.TEST_PASSWORD || '';

async function ensureDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

async function testResponsive() {
  await ensureDir();

  console.log('Testing Add Member page responsive behavior...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`  CONSOLE ERROR: ${msg.text()}`);
  });
  page.on('pageerror', err => console.log(`  PAGE ERROR: ${err.message}`));

  // Authenticate first if credentials provided
  let authenticated = false;
  if (EMAIL && PASSWORD) {
    console.log('Authenticating...');
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    // Fill email
    await page.locator('input[name="email"]').fill(EMAIL);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.locator('button[type="submit"]').click();

    // Wait for redirect away from /login
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
    authenticated = page.url().includes('/members/add') || !page.url().includes('/login');
    console.log(authenticated ? '  Authenticated successfully!' : '  Authentication failed or partial.');
    console.log('');
  } else {
    console.log('No TEST_EMAIL/TEST_PASSWORD set — running unauthenticated screenshot test.\n');
  }

  for (const width of BREAKPOINTS) {
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    const deviceType = isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop';

    await page.setViewportSize({ width, height: 800 });

    // Navigate with longer timeout since we're checking dev server
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for step icons to appear (progress steps indicator)
    await page.waitForSelector('.h-8.w-8.rounded-full', { timeout: 5000 }).catch(() => {});

    // Wait a bit more for React to render
    await page.waitForTimeout(500);

    const title = await page.title();
    const currentUrl = page.url();

    // Check key UI elements
    const headerVisible = await page.locator('text=নতুন সদস্য যোগ করুন').count();
    const stepIconsVisible = await page.locator('.h-8.w-8.rounded-full').count();

    // Check mobile-specific classes visibility via CSS
    const isHiddenOnMobile = await page.evaluate(() => {
      const el = document.querySelector('[class*="hidden sm:flex"]');
      return el ? window.getComputedStyle(el).display !== 'none' : null;
    });

    const onLoginPage = currentUrl.includes('/login');
    const status = onLoginPage ? '⚠️ Login page (unauthenticated)' : '✅';

    console.log(`\n=== Width: ${width}px (${deviceType}) ${status} ===`);
    console.log(`Title: ${title}`);
    console.log(`URL: ${currentUrl}`);
    console.log(`Header visible: ${headerVisible > 0 ? 'Yes ✓' : 'No ✗'}`);
    console.log(`Step icons count: ${stepIconsVisible}`);
    console.log(`Share/fee info hidden on mobile: ${isHiddenOnMobile === false ? 'Yes (correctly hidden) ✓' : isHiddenOnMobile === true ? 'No (visible - wrong!) ✗' : 'N/A'}`);

    // Take screenshot
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${width}px.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Screenshot saved: ${screenshotPath} ✓`);
  }

  await browser.close();
  console.log('\n✅ Responsive testing complete!');
}

testResponsive().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
