const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Starting Playwright test to verify Premium Landing Page UI...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to the local landing page served by our Express server
    console.log('1. Navigating to local index.html...');
    await page.goto('http://localhost:3000/index.html');

    // Wait for the tech stack section to be visible
    console.log('2. Locating premium UI components...');
    await page.waitForSelector('#tech-stack');

    // Check for the new premium glassmorphism tech badges
    const badges = await page.$$('.tech-badge-inline');
    console.log(`✅ Found ${badges.length} premium tech badges (expected around 6)!`);
    if (badges.length === 0) {
      throw new Error('Premium tech badges not found. The UI upgrade might be missing.');
    }

    // Check if GSAP/ScrollTrigger scripts are in the DOM
    const gsapScript = await page.$('script[src*="gsap.min.js"]');
    const scrollTriggerScript = await page.$('script[src*="ScrollTrigger.min.js"]');
    if (gsapScript && scrollTriggerScript) {
      console.log('✅ Found GSAP and ScrollTrigger vendor scripts loaded in the DOM!');
    } else {
      throw new Error('GSAP or ScrollTrigger scripts are missing from the DOM.');
    }

    // Check for the dedicated landing.js script
    const landingScript = await page.$('script[src*="landing.js"]');
    if (landingScript) {
      console.log('✅ Found landing.js orchestration script!');
    } else {
      throw new Error('landing.js script is missing.');
    }

    // Check for the landing.css stylesheet
    const landingCss = await page.$('link[href*="landing.css"]');
    if (landingCss) {
      console.log('✅ Found landing.css dedicated stylesheet!');
    } else {
      throw new Error('landing.css stylesheet is missing.');
    }

    console.log('==================================================');
    console.log('🎉 ALL PREMIUM UI VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
