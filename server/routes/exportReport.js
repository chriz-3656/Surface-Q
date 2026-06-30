const express = require('express');
const router = express.Router();
const { buildReportHtml } = require('../utils/reportBuilder');
const { generatePdfFromHtml } = require('../services/pdfGenerator');
const { getLatestScan } = require('../index'); // Adjust if exported differently

// Wait, getting latest scan from index.js could create circular dependencies if not careful.
// Let's rely on it being passed, or let index.js pass the `latestScan` state to the router via a function.

module.exports = (getLatestScanFunc) => {
  router.post('/', async (req, res) => {
    try {
      const scanData = getLatestScanFunc();

      if (!scanData) {
        return res.status(400).json({ error: 'No scan data available to export. Please run a scan first.' });
      }

      console.log('📄 Generating PDF Export...');

      // 1. Build HTML from templates
      const htmlContent = buildReportHtml(scanData);

      // 2. Generate PDF Buffer via Puppeteer
      const pdfBuffer = await generatePdfFromHtml(htmlContent);

      // 3. Construct filename
      const domain = scanData.domain || 'unknown-domain';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `SurfaceQ_Report_${domain}_${timestamp}.pdf`;

      // 4. Send the PDF as a downloadable file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.end(pdfBuffer);

      console.log('✅ PDF Export successfully generated and sent.');

    } catch (error) {
      console.error('❌ Failed to generate PDF report:', error);
      res.status(500).json({ error: 'Failed to generate PDF report.' });
    }
  });

  return router;
};
