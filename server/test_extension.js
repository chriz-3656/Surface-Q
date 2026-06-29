const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('==================================================');
  console.log('🧪 Starting End-to-End SurfaceQ Integration Test');
  console.log('==================================================');

  const pathToExtension = path.resolve(__dirname, '../extension');
  console.log(`Unpacked Extension Path: ${pathToExtension}`);

  // Launch Chromium with extension loaded
  const browserContext = await chromium.launchPersistentContext('', {
    headless: false, // Must be false for extensions to load
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`
    ]
  });

  try {
    // 1. Find Extension ID from service worker
    console.log('Locating extension service worker...');
    let [worker] = browserContext.serviceWorkers();
    if (!worker) {
      worker = await browserContext.waitForEvent('serviceworker');
    }
    
    // Parse ID from URL (e.g. chrome-extension://<id>/background.js)
    const extensionId = worker.url().split('/')[2];
    console.log(`✅ Found Extension ID: ${extensionId}`);

    // 2. Open target website (chriz-3656.github.io) to trigger passive header intercept
    const sitePage = await browserContext.newPage();
    console.log('1. Navigating to test target: https://chriz-3656.github.io/...');
    await sitePage.goto('https://chriz-3656.github.io/', { waitUntil: 'networkidle' });

    // 3. Open Extension Popup window
    console.log('2. Opening Extension Popup page...');
    const popupPage = await browserContext.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);

    // Switch to Expert Mode to reveal the JSON result-box viewport
    console.log('Switching popup to Expert Mode...');
    await popupPage.click('#toggle-mode-btn');

    // 4. Trigger Scan inside Popup
    console.log('3. Triggering scan button inside popup...');
    await popupPage.click('#scan-btn');

    // 5. Wait for scan JSON response
    console.log('Waiting for scan results inside viewport...');
    await popupPage.waitForSelector('#result-box', { state: 'visible' });
    const resultText = await popupPage.locator('#result-box').innerText();
    console.log('RESULT TEXT RECEIVED IN POPUP:', resultText);
    
    if (resultText.includes('chriz-3656.github.io')) {
      console.log('✅ Success: Extension generated structured scan JSON!');
    } else {
      throw new Error('Scan result did not contain target domain');
    }

    // 6. Verify Dashboard receives and renders this payload
    console.log('4. Navigating to local Dashboard...');
    const dashboardPage = await browserContext.newPage();
    await dashboardPage.goto('http://localhost:3000/dashboard.html', { waitUntil: 'networkidle' });

    // Give it a second to fetch and sync from the backend cache
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify Title/Domain is updated to chriz-3656.github.io
    const dashboardTitle = await dashboardPage.evaluate(() => {
      const header = document.querySelector('sq-header');
      return header ? header.getAttribute('title') : '';
    });

    console.log(`Dashboard Title: ${dashboardTitle}`);
    if (dashboardTitle.toLowerCase() === 'chriz-3656.github.io') {
      console.log('✅ Success: Extension and Dashboard communicating correctly via Server!');
    } else {
      throw new Error(`Integration failed: Dashboard title is "${dashboardTitle}", expected "chriz-3656.github.io"`);
    }

    console.log('==================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================');

  } catch (error) {
    console.error('❌ E2E Integration Test Failed:', error.message);
  } finally {
    await browserContext.close();
  }
})();
