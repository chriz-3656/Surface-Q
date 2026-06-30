// finding-card.js — <sq-finding> custom element
// SurfaceQ Security Platform

const severityColors = {
  critical: '#ff1744',
  high: '#ff5252',
  medium: '#ff9100',
  low: '#ffea00',
  info: '#00e5ff',
};

const template = document.createElement('template');
template.innerHTML = `
<style>
  :host {
    display: block;
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  }

  .card {
    position: relative;
    background: rgba(255,255,255,0.03);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(255,255,255,0.06);
    border-left: 4px solid var(--severity-color, #00e5ff);
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1),
                box-shadow 0.25s cubic-bezier(0.4,0,0.2,1);
    cursor: default;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.35),
                0 0 0 1px rgba(255,255,255,0.08);
  }

  /* Header row */
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  /* Severity badge */
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: var(--severity-color, #00e5ff);
    color: #000;
    flex-shrink: 0;
    line-height: 1.5;
  }
  /* For low severity badge, ensure contrast */
  :host([severity="low"]) .badge {
    color: #1a1a00;
  }

  .title {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    flex: 1 1 0%;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.4;
  }

  /* Action buttons (expand + copy) */
  .actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .icon-btn {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    color: rgba(255,255,255,0.55);
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    padding: 0;
  }
  .icon-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
    border-color: rgba(255,255,255,0.15);
  }
  .icon-btn svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .toggle-arrow {
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  }
  .toggle-arrow.open {
    transform: rotate(180deg);
  }

  /* Description */
  .description {
    margin-top: 10px;
    font-size: 14px;
    color: rgba(255,255,255,0.55);
    line-height: 1.6;
  }

  /* Collapsible details */
  .details {
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1),
                opacity 0.25s ease,
                margin-top 0.25s ease;
    margin-top: 0;
  }
  .details.open {
    max-height: 600px;
    opacity: 1;
    margin-top: 14px;
  }

  .detail-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 6px 0;
    border-top: 1px solid rgba(255,255,255,0.04);
    font-size: 13px;
  }
  .detail-row:first-child {
    border-top: none;
  }

  .detail-label {
    color: rgba(255,255,255,0.35);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 11px;
    flex-shrink: 0;
    min-width: 70px;
  }

  .detail-value {
    color: rgba(255,255,255,0.7);
    word-break: break-all;
  }

  a {
    color: #00e5ff;
    text-decoration: none;
    transition: color 0.2s;
  }
  a:hover {
    color: #18ffff;
    text-decoration: underline;
  }

  /* Copy confirmation */
  .copy-toast {
    position: absolute;
    top: -8px;
    right: 12px;
    background: #00e676;
    color: #000;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 6px;
    opacity: 0;
    transform: translateY(4px);
    pointer-events: none;
    transition: opacity 0.25s, transform 0.25s;
  }
  .copy-toast.show {
    opacity: 1;
    transform: translateY(0);
  }
</style>

<div class="card">
  <span class="copy-toast">Copied!</span>

  <div class="header">
    <span class="badge" id="badge"></span>
    <span class="title" id="title"></span>
    <div class="actions">
      <button class="icon-btn" id="copy-btn" title="Copy finding" aria-label="Copy finding">
        <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
      </button>
      <button class="icon-btn" id="toggle-btn" title="Toggle details" aria-expanded="false" aria-label="Toggle details">
        <svg class="toggle-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </div>
  </div>

  <div class="description" id="description"></div>

  <div class="details" id="details">
    <div class="detail-row" id="owasp-row">
      <span class="detail-label">OWASP</span>
      <span class="detail-value"><a id="owasp-link" href="#" target="_blank" rel="noopener noreferrer"></a></span>
    </div>
    <div class="detail-row" id="url-row">
      <span class="detail-label">URL</span>
      <span class="detail-value" id="url-value"></span>
    </div>
  </div>
</div>
`;

class SQFinding extends HTMLElement {
  static get observedAttributes() {
    return ['severity', 'title', 'description', 'owasp', 'url'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._expanded = false;
    this._card = this.shadowRoot.querySelector('.card');
    this._badge = this.shadowRoot.getElementById('badge');
    this._title = this.shadowRoot.getElementById('title');
    this._desc = this.shadowRoot.getElementById('description');
    this._details = this.shadowRoot.getElementById('details');
    this._owaspLink = this.shadowRoot.getElementById('owasp-link');
    this._owaspRow = this.shadowRoot.getElementById('owasp-row');
    this._urlValue = this.shadowRoot.getElementById('url-value');
    this._urlRow = this.shadowRoot.getElementById('url-row');
    this._toggleBtn = this.shadowRoot.getElementById('toggle-btn');
    this._toggleArrow = this.shadowRoot.querySelector('.toggle-arrow');
    this._copyBtn = this.shadowRoot.getElementById('copy-btn');
    this._copyToast = this.shadowRoot.querySelector('.copy-toast');
  }

  connectedCallback() {
    this._toggleBtn.addEventListener('click', () => this._toggle());
    this._copyBtn.addEventListener('click', () => this._copy());
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  _render() {
    const severity = (this.getAttribute('severity') || 'info').toLowerCase();
    const title = this.getAttribute('title') || '';
    const description = this.getAttribute('description') || '';
    const owasp = this.getAttribute('owasp') || '';
    const url = this.getAttribute('url') || '';

    const color = severityColors[severity] || severityColors.info;
    this._card.style.setProperty('--severity-color', color);
    this._badge.textContent = severity;
    this._badge.style.background = color;

    // Ensure contrast for light badges
    if (severity === 'low' || severity === 'info') {
      this._badge.style.color = '#0a0e1a';
    } else {
      this._badge.style.color = '#fff';
    }

    this._title.textContent = title;
    this._desc.textContent = description;

    if (owasp) {
      this._owaspRow.style.display = '';
      this._owaspLink.textContent = owasp;
      // Build a search URL for the OWASP reference
      this._owaspLink.href = `https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/`;
    } else {
      this._owaspRow.style.display = 'none';
    }

    if (url) {
      this._urlRow.style.display = '';
      this._urlValue.textContent = url;
    } else {
      this._urlRow.style.display = 'none';
    }
  }

  _toggle() {
    this._expanded = !this._expanded;
    this._details.classList.toggle('open', this._expanded);
    this._toggleArrow.classList.toggle('open', this._expanded);
    this._toggleBtn.setAttribute('aria-expanded', this._expanded.toString());
  }

  _copy() {
    const severity = this.getAttribute('severity') || 'info';
    const title = this.getAttribute('title') || '';
    const description = this.getAttribute('description') || '';
    const owasp = this.getAttribute('owasp') || '';
    const url = this.getAttribute('url') || '';

    const text = [
      `[${severity.toUpperCase()}] ${title}`,
      description,
      owasp ? `OWASP: ${owasp}` : '',
      url ? `URL: ${url}` : '',
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      this._copyToast.classList.add('show');
      setTimeout(() => this._copyToast.classList.remove('show'), 1500);
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this._copyToast.classList.add('show');
      setTimeout(() => this._copyToast.classList.remove('show'), 1500);
    });
  }
}

customElements.define('sq-finding', SQFinding);
