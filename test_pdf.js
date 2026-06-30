const { buildReportHtml } = require('./server/utils/reportBuilder');
const { generatePdfFromHtml } = require('./server/services/pdfGenerator');
const fs = require('fs');

async function testPdf() {
  const dummyScanData = {
    targetUrl: "https://example.com",
    rawTelemetry: {
      domain: "example.com",
      url: "https://example.com",
      isHttps: true,
      technologies: ["React", "Node.js"],
      securityHeaders: [
        { header: "Strict-Transport-Security", status: "present", value: "max-age=31536000" }
      ],
      forms: []
    },
    aiAssessment: {
      score: 85,
      renderingMode: "Static",
      expert: {
        executiveSummary: "Test Summary",
        recommendations: ["Fix XSS", "Fix CSP"]
      },
      simple: {
        executiveSummary: "Simple Test Summary"
      },
      findings: [
        { title: "Missing CSP", severity: "High", category: "Security", description: "No CSP", recommendation: "Add CSP" }
      ]
    }
  };

  try {
    const html = buildReportHtml(dummyScanData);
    fs.writeFileSync('test_report.html', html);
    console.log("HTML generated. Generating PDF...");
    
    const pdf = await generatePdfFromHtml(html);
    fs.writeFileSync('test_report.pdf', pdf);
    console.log("PDF generated successfully! Size:", pdf.length, "bytes");
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

testPdf();
