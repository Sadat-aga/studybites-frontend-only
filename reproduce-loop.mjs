import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', error => console.log(`[Browser Error] ${error.message}`));

  try {
    console.log('Navigating to library...');
    await page.goto('http://localhost:3000/library');
    await page.waitForLoadState('networkidle');

    // Since mock data is used, there should be a file available to click.
    // Let's find the first file link in the library.
    console.log('Looking for a file to open...');
    // In mock data, there is usually a file. Let's just click the first link that goes to /library/files/
    await page.click('a[href^="/library/files/"]');
    await page.waitForLoadState('networkidle');

    console.log('On File Page. Clicking Practice...');
    // The "Practice" button has ctaLabel="Practice". Let's find it.
    await page.click('text=Practice');
    await page.waitForLoadState('networkidle');

    console.log('Started session. Waiting for question to appear...');
    await page.waitForSelector('text=Question 1', { timeout: 10000 });
    console.log('Session is active. Path A is successful.');

    console.log('Canceling mid-session (clicking Back)...');
    // Click back chevron / button
    await page.click('text=Back');
    await page.waitForLoadState('networkidle');

    console.log('Back on File Page. Clicking Practice again (Path B)...');
    await page.click('text=Practice');
    
    console.log('Waiting to see what happens...');
    // Wait for either the spinner or the question
    await page.waitForTimeout(5000);

    const isSpinnerVisible = await page.locator('.animate-spin').isVisible();
    console.log('Spinner visible:', isSpinnerVisible);

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
})();
