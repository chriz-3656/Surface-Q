const puppeteer = require('puppeteer');

let browserInstance = null;

/**
 * Initializes and returns a Puppeteer browser instance.
 * Reuses the instance if it already exists.
 */
async function getBrowser() {
  if (!browserInstance) {
    try {
      browserInstance = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
    } catch (error) {
      console.error('Failed to launch Puppeteer browser:', error);
      throw error;
    }
  }
  return browserInstance;
}

/**
 * Generates a PDF from the provided HTML content.
 */
async function generatePdfFromHtml(htmlContent) {
  let page = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    
    // Set the HTML content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Emulate print media to apply print-specific CSS
    await page.emulateMediaType('print');

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true, // Respects @page directives
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    });

    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    if (page) {
      await page.close().catch(console.error); // Clean up the page
    }
  }
}

/**
 * Gracefully closes the browser instance (e.g., during app shutdown)
 */
async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

module.exports = {
  generatePdfFromHtml,
  closeBrowser
};
