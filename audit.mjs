import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Logging in...');
    await page.goto('https://app.studybites.ai/authenticate', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'tryrevivestore@gmail.com');
    await page.fill('input[type="password"]', 'Pasforbites');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(10000);

    console.log('Opening a file...');
    await page.click('a[href^="/library/files/"]');
    await page.waitForTimeout(10000);

    console.log('Detecting Sidebar Highlight Logic...');
    const highlightData = await page.evaluate(() => {
      const activeItem = document.querySelector('[class*="bg-bg-brand-tertiary"]');
      if (!activeItem) return 'No highlight found';
      return {
        text: activeItem.innerText,
        classes: activeItem.className,
        parentClasses: activeItem.parentElement?.className
      };
    });
    console.log('Highlight Data:', highlightData);

    console.log('Checking for In-Progress states...');
    const inProgressFound = await page.evaluate(() => {
      const bodyText = document.body.innerText.toLowerCase();
      const hasSpinner = !!document.querySelector('.animate-spin');
      return {
        textFound: bodyText.includes('processing') || bodyText.includes('progress') || bodyText.includes('generating'),
        hasSpinner
      };
    });
    console.log('In-Progress Found:', inProgressFound);

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
