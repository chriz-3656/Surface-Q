const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getRiskClass(score) {
  if (score >= 85) return 'risk-low';
  if (score >= 60) return 'risk-medium';
  if (score >= 30) return 'risk-high';
  return 'risk-critical';
}

function getSecurityClass(score) {
  if (score >= 85) return 'risk-low'; // High security = good (green)
  if (score >= 60) return 'risk-medium';
  if (score >= 30) return 'risk-high';
  return 'risk-critical';
}

function getSeverityBadgeClass(severity) {
  const s = String(severity).toLowerCase();
  if (s.includes('critical')) return 'badge-critical';
  if (s.includes('high')) return 'badge-high';
  if (s.includes('medium')) return 'badge-medium';
  if (s.includes('low')) return 'badge-low';
  return 'badge-info';
}

function buildReportHtml(scanData) {
  const templatePath = path.join(__dirname, '../templates/report.html');
  const cssPath = path.join(__dirname, '../templates/report.css');
  
  let html = fs.readFileSync(templatePath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');

  const { targetUrl, rawTelemetry, aiAssessment } = scanData;
  const telemetry = rawTelemetry || scanData;

  const domain = telemetry.domain || new URL(targetUrl || telemetry.url || 'http://unknown').hostname || 'Unknown';
  const scanDate = new Date().toLocaleString();
  const reportId = crypto.randomUUID();

  // Fix Risk vs Security Score
  // If AI gives a "score" of 85, is it 85/100 risk or 85/100 security? 
  // Let's assume AI 'score' is usually a security health score (0-100).
  const rawScore = aiAssessment?.score || 0;
  const securityScore = rawScore;
  const riskScore = 100 - rawScore;

  const architecture = aiAssessment?.renderingMode || 'Unknown';
  const httpsStatus = telemetry.isHttps ? 'Enabled (Secure)' : 'Disabled (Insecure)';
  const totalFindings = (aiAssessment?.findings || []).length;

  const executiveSummary = aiAssessment?.expert?.executiveSummary || aiAssessment?.simple?.executiveSummary || 'No executive summary provided.';
  const aiRecommendations = (aiAssessment?.expert?.recommendations || []).join('<br><br>') || 'No recommendations provided.';

  // Deduplicate Technologies
  const rawTechs = telemetry.technologies || [];
  const uniqueTechs = [...new Set(rawTechs.map(t => typeof t === 'string' ? t : t.name))];
  const technologiesHtml = uniqueTechs.length > 0 
    ? uniqueTechs.map(t => `<div class="tech-badge">${t}</div>`).join('')
    : '<div class="tech-badge">None Detected</div>';

  // Security Headers (Deduplicated)
  const rawHeaders = telemetry.securityHeaders || [];
  const uniqueHeadersMap = new Map();
  rawHeaders.forEach(h => {
    uniqueHeadersMap.set(h.header.toLowerCase(), h);
  });
  const headers = Array.from(uniqueHeadersMap.values());
  
  const securityHeadersHtml = headers.map(h => {
    const statusColor = h.status === 'present' ? 'var(--color-info)' : 'var(--color-critical)';
    let displayValue = h.value || 'N/A';
    let length = displayValue.length;
    let preview = length > 40 ? displayValue.substring(0, 40) + '...' : displayValue;
    
    return `
      <tr>
        <td><strong>${h.header}</strong></td>
        <td style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${h.status}</td>
        <td>
          <div class="value-preview">${preview}</div>
          ${length > 40 ? `<div class="value-full" style="display:none; font-size:10px; color:#666;">${displayValue}</div>` : ''}
        </td>
        <td style="text-align: right; color: #888;">${length}</td>
      </tr>
    `;
  }).join('');

  // Forms (Deduplicated by action + method)
  const rawForms = telemetry.forms || [];
  const uniqueFormsMap = new Map();
  rawForms.forEach(f => {
    uniqueFormsMap.set(`${f.action}-${f.method}`, f);
  });
  const forms = Array.from(uniqueFormsMap.values());
  
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
  const rawFindings = aiAssessment?.findings || [];
  const uniqueFindingsMap = new Map();
  rawFindings.forEach(f => {
    uniqueFindingsMap.set(f.title, f); // simple deduplication
  });
  const findings = Array.from(uniqueFindingsMap.values());
  
  const findingsHtml = findings.length > 0
    ? findings.map(f => {
        const severityClass = getSeverityBadgeClass(f.severity);
        return `
          <div class="finding-card">
            <div class="finding-header">
              <h3 class="finding-title">${f.title || 'Untitled Finding'}</h3>
              <div class="badges">
                <span class="badge ${severityClass}">${f.severity || 'INFO'}</span>
                ${f.category ? `<span class="badge badge-info">${f.category}</span>` : ''}
              </div>
            </div>
            
            <div class="finding-grid">
              <div class="finding-cell">
                <div class="finding-section-title">Description</div>
                <p>${f.description || 'No description.'}</p>
              </div>
              <div class="finding-cell">
                <div class="finding-section-title">Impact</div>
                <p>${f.impact || 'Not specified.'}</p>
              </div>
            </div>
            
            <div class="finding-section-title">Recommendation</div>
            <p>${f.recommendation || 'No recommendation.'}</p>
            
            ${f.owasp ? `<div class="finding-owasp"><strong>OWASP Mapping:</strong> ${f.owasp}</div>` : ''}
          </div>
        `;
      }).join('')
    : '<div class="finding-card"><p>No critical findings reported. Review the technical footprint for basic misconfigurations.</p></div>';

  html = html.replace('{{css}}', css);
  html = html.replace(/{{domain}}/g, domain);
  html = html.replace(/{{scanDate}}/g, scanDate);
  html = html.replace('{{architecture}}', architecture);
  html = html.replace('{{reportId}}', reportId);
  html = html.replace('{{securityScore}}', securityScore);
  html = html.replace('{{riskScore}}', riskScore);
  html = html.replace('{{riskClass}}', getRiskClass(riskScore)); // 100 is high risk, so red
  html = html.replace('{{securityClass}}', getSecurityClass(securityScore)); // 100 is high security, so green
  html = html.replace('{{executiveSummary}}', executiveSummary);
  html = html.replace('{{httpsStatus}}', httpsStatus);
  html = html.replace('{{totalFindings}}', totalFindings);
  html = html.replace('{{scanDuration}}', scanData.scanDurationMs ? \`\${(scanData.scanDurationMs/1000).toFixed(2)}s\` : 'N/A');
  html = html.replace('{{aiResponseTime}}', scanData.aiResponseTimeMs ? \`\${(scanData.aiResponseTimeMs/1000).toFixed(2)}s\` : 'N/A');
  html = html.replace('{{technologies}}', technologiesHtml);
  html = html.replace('{{securityHeaders}}', securityHeadersHtml);
  html = html.replace('{{forms}}', formsHtml);
  html = html.replace('{{findings}}', findingsHtml);
  html = html.replace('{{aiRecommendations}}', aiRecommendations);
  html = html.replace('{{reportVersion}}', '1.1.0');
  html = html.replace('{{surfaceVersion}}', '1.1.0');

  return html;
}

module.exports = {
  buildReportHtml
};
