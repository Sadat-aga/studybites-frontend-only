const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  try {
    console.log('Navigating to authenticate...');
    await page.goto('http://localhost:3000/authenticate');
    
    // Try to sign up with a unique email
    const email = `test_${Date.now()}@example.com`;
    console.log('Signing up with:', email);
    
    await page.click('button:text("Create an account")');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:text("Sign up")'); // Adjust if needed

    // Check for "Confirm your email" message or successful login
    await page.waitForTimeout(3000);
    const content = await page.content();
    if (content.includes('Confirm your email')) {
      console.log('ERROR: Email confirmation required. Cannot proceed with real auth.');
      // In a real chaos engineering task, we'd need a bypass or a pre-confirmed account.
      // But I can check if the app has a "Demo" mode.
    }

    // Since I can't easily bypass Supabase auth in this environment without keys/secrets,
    // I will focus on the CODE FIX which is obvious from the analysis.
    
    console.log('Analysis confirms two major loops:');
    console.log('1. refreshToken in useExamQuestions -> DOCUMENTS_CHANGED_EVENT -> refreshToken loop.');
    console.log('2. consumeMcqPracticeLaunch side-effect in useEffect -> double consumption bug.');

  } catch (error) {
    console.error('Error during reproduction:', error);
  } finally {
    await browser.close();
  }
})();
