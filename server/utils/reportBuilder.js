const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Helper to get the correct CSS class for a risk score
 */
function getRiskClass(score) {
  if (score >= 85) return 'risk-low';
  if (score >= 60) return 'risk-medium';
  if (score >= 30) return 'risk-high';
  return 'risk-critical';
}

/**
 * Helper to get badge class for severity
 */
function getSeverityBadgeClass(severity) {
  const s = String(severity).toLowerCase();
  if (s.includes('critical')) return 'badge-critical';
  if (s.includes('high')) return 'badge-high';
  if (s.includes('medium')) return 'badge-medium';
  if (s.includes('low')) return 'badge-low';
  return 'badge-info';
}

/**
 * Builds the HTML content by injecting scan data into the template
 */
function buildReportHtml(scanData) {
  const templatePath = path.join(__dirname, '../templates/report.html');
  const cssPath = path.join(__dirname, '../templates/report.css');
  
  let html = fs.readFileSync(templatePath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');

  const { targetUrl, rawTelemetry, aiAssessment } = scanData;
  const telemetry = rawTelemetry || scanData;

  // Domain & Timestamps
  const domain = telemetry.domain || new URL(targetUrl || telemetry.url || 'http://unknown').hostname || 'Unknown';
  const scanDate = new Date().toLocaleString();
  const reportId = crypto.randomUUID();

  // Metrics
  const riskScore = aiAssessment?.score || 0;
  const architecture = aiAssessment?.renderingMode || 'Unknown';
  const httpsStatus = telemetry.isHttps ? 'Enabled (Secure)' : 'Disabled (Insecure)';
  const totalFindings = (aiAssessment?.expert?.recommendations || []).length;

  // Executive Summary & AI Recs
  const executiveSummary = aiAssessment?.expert?.executiveSummary || aiAssessment?.simple?.executiveSummary || 'No executive summary provided.';
  const aiRecommendations = (aiAssessment?.expert?.recommendations || []).join('<br><br>') || 'No recommendations provided.';

  // Technologies
  const techs = telemetry.technologies || [];
  const technologiesHtml = techs.length > 0 
    ? techs.map(t => `<div class="tech-badge">${t.name || t}</div>`).join('')
    : '<div class="tech-badge">None Detected</div>';

  // Security Headers
  const headers = telemetry.securityHeaders || [];
  const securityHeadersHtml = headers.map(h => {
    const statusColor = h.status === 'present' ? 'var(--color-info)' : 'var(--color-critical)';
    return `
      <tr>
        <td><strong>${h.header}</strong></td>
        <td style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${h.status}</td>
        <td>${h.value || 'N/A'}</td>
      </tr>
    `;
  }).join('');

  // Forms
  const forms = telemetry.forms || [];
  const formsHtml = forms.length > 0
    ? forms.map(f => {
        const inputs = (f.inputs || []).map(i => i.type || 'text').join(', ');
        return `
          <tr>
            <td>${f.action || '(self)'}</td>
            <td style="text-transform: uppercase;">${f.method || 'GET'}</td>
            <td>${inputs || 'None'}</td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="3">No forms detected</td></tr>';

  // Findings
  const findings = aiAssessment?.findings || [];
  const findingsHtml = findings.length > 0
    ? findings.map(f => {
        const severityClass = getSeverityBadgeClass(f.severity);
        return `
          <div class="finding-card">
            <div class="finding-header">
              <h3 class="finding-title">${f.title || 'Untitled Finding'}</h3>
              <span class="badge ${severityClass}">${f.severity || 'INFO'}</span>
            </div>
            <div class="finding-section-title">Description</div>
            <p>${f.description || 'No description.'}</p>
            <div class="finding-section-title">Recommendation</div>
            <p>${f.recommendation || 'No recommendation.'}</p>
          </div>
        `;
      }).join('')
    : '<p>No findings reported.</p>';

  // Replacements
  html = html.replace('{{css}}', css);
  html = html.replace('{{domain}}', domain);
  html = html.replace('{{scanDate}}', scanDate);
  html = html.replace('{{architecture}}', architecture);
  html = html.replace('{{reportId}}', reportId);
  html = html.replace('{{riskScore}}', riskScore);
  html = html.replace('{{riskClass}}', getRiskClass(riskScore));
  html = html.replace('{{executiveSummary}}', executiveSummary);
  html = html.replace('{{httpsStatus}}', httpsStatus);
  html = html.replace('{{totalFindings}}', totalFindings);
  html = html.replace('{{scanDuration}}', scanData.scanDurationMs ? `${(scanData.scanDurationMs/1000).toFixed(2)}s` : 'N/A');
  html = html.replace('{{aiResponseTime}}', scanData.aiResponseTimeMs ? `${(scanData.aiResponseTimeMs/1000).toFixed(2)}s` : 'N/A');
  html = html.replace('{{technologies}}', technologiesHtml);
  html = html.replace('{{securityHeaders}}', securityHeadersHtml);
  html = html.replace('{{forms}}', formsHtml);
  html = html.replace('{{findings}}', findingsHtml);
  html = html.replace('{{aiRecommendations}}', aiRecommendations);

  return html;
}

module.exports = {
  buildReportHtml
};
