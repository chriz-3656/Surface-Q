const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🧪 Starting PDF Export E2E Test...');
  
  const pathToExtension = path.join(__dirname, '../extension');
  const userDataDir = '/tmp/test-user-data-dir';

  let browserContext;
  try {
    // Launch browser with extension
    browserContext = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    });

    // 1. Target a mock local target to simulate scanning
    const page = await browserContext.newPage();
    await page.goto('http://localhost:3000');

    // 2. Open dashboard
    const dashboard = await browserContext.newPage();
    await dashboard.goto('http://localhost:3000/dashboard.html');
    
    console.log('⏳ Waiting for Live Scan to complete...');
    
    // Trigger mock scan in backend to simulate extension workflow
    const scanResponse = await fetch('http://localhost:3000/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'http://localhost:3000',
        domain: 'localhost',
        isHttps: false,
        rawHeaders: { server: 'Express' },
        technologies: [{name: 'Express'}],
        securityHeaders: [{header: 'X-Frame-Options', status: 'missing'}],
        mixedContent: [],
        forms: []
      })
    });
    await scanResponse.json();

    // 3. Wait for the Export button to become visible (which happens when dot turns emerald)
    console.log('⏳ Waiting for Export button to appear...');
    const exportBtn = dashboard.locator('#simple-export-pdf-btn');
    await exportBtn.waitFor({ state: 'visible', timeout: 15000 });
    
    // 4. Click Export and capture download
    console.log('📥 Clicking Export PDF...');
    const [download] = await Promise.all([
      dashboard.waitForEvent('download'),
      exportBtn.click()
    ]);
    
    // 5. Verify download filename
    const suggestedFilename = download.suggestedFilename();
    console.log(`📁 Downloaded file: ${suggestedFilename}`);
    if (!suggestedFilename.startsWith('SurfaceQ_Report_') || !suggestedFilename.endsWith('.pdf')) {
      throw new Error(`Invalid filename format: ${suggestedFilename}`);
    }

    // 6. Save downloaded file temporarily
    const downloadPath = path.join(__dirname, suggestedFilename);
    await download.saveAs(downloadPath);

    // 7. Verify file size is > 0 bytes
    const stats = fs.statSync(downloadPath);
    if (stats.size === 0) {
      throw new Error('PDF file size is 0 bytes.');
    }
    console.log(`✅ PDF Size Verified: ${stats.size} bytes`);
    
    // Clean up test file
    fs.unlinkSync(downloadPath);
    
    console.log('🎉 ALL PDF EXPORT TESTS PASSED SUCCESSFULLY!');

  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    if (browserContext) {
      await browserContext.close();
    }
  }
})();
