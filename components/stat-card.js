// stat-card.js — <sq-stat-card> custom element
// SurfaceQ Security Platform

const ICONS = {
  scan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>`,
  gauge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
    <path d="M12 6v6l4 2"/>
  </svg>`,
};

const statTemplate = document.createElement('template');
statTemplate.innerHTML = `
<style>
  :host {
    display: block;
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  }

  .card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 24px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .card:hover {
    border-color: rgba(255,255,255,0.15);
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
  }

  /* Subtle top-left glow */
  .card::before {
    content: '';
    position: absolute;
    width: 120px;
    height: 120px;
    top: -60px;
    left: -60px;
    background: radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .icon-container {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(0,229,255,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    color: #00e5ff;
  }
  .icon-container svg {
    width: 20px;
    height: 20px;
  }

  .value {
    font-size: 32px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .label {
    font-size: 14px;
    color: rgba(255,255,255,0.5);
    margin-top: 4px;
    line-height: 1.4;
  }

  .trend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 12px;
    font-size: 13px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 6px;
  }

  .trend.up {
    color: #00e676;
    background: rgba(0,230,118,0.1);
  }

  .trend.down {
    color: #ff1744;
    background: rgba(255,23,68,0.1);
  }

  .trend.neutral {
    color: rgba(255,255,255,0.4);
    background: rgba(255,255,255,0.04);
  }

  .trend-arrow {
    font-size: 12px;
  }

  .bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .value-block {
    flex: 1;
  }
</style>

<div class="card">
  <div class="icon-container" id="icon"></div>
  <div class="bottom-row">
    <div class="value-block">
      <div class="value" id="value"></div>
      <div class="label" id="label"></div>
    </div>
    <span class="trend" id="trend"></span>
  </div>
</div>
`;

class SQStatCard extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'value', 'icon', 'trend'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(statTemplate.content.cloneNode(true));

    this._iconEl = this.shadowRoot.getElementById('icon');
    this._valueEl = this.shadowRoot.getElementById('value');
    this._labelEl = this.shadowRoot.getElementById('label');
    this._trendEl = this.shadowRoot.getElementById('trend');
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  _render() {
    const label = this.getAttribute('label') || '';
    const value = this.getAttribute('value') || '0';
    const icon = (this.getAttribute('icon') || 'scan').toLowerCase();
    const trend = this.getAttribute('trend') || '';

    // Icon
    this._iconEl.innerHTML = ICONS[icon] || ICONS.scan;

    // Value — animate count-up on first render
    this._valueEl.textContent = value;
    this._labelEl.textContent = label;

    // Trend
    if (trend) {
      this._trendEl.style.display = '';
      const parsed = this._parseTrend(trend);
      this._trendEl.className = `trend ${parsed.direction}`;
      const arrows = { up: '▲', down: '▼', neutral: '—' };
      this._trendEl.innerHTML = `<span class="trend-arrow">${arrows[parsed.direction]}</span> ${parsed.text}`;
    } else {
      this._trendEl.style.display = 'none';
    }
  }

  /**
   * Parse trend attribute.
   * Accepted formats: "up 12%", "down 5%", "neutral", "+12%", "-5%", "12%"
   */
  _parseTrend(raw) {
    const trimmed = raw.trim().toLowerCase();

    if (trimmed.startsWith('up')) {
      return { direction: 'up', text: trimmed.replace(/^up\s*/, '') };
    }
    if (trimmed.startsWith('down')) {
      return { direction: 'down', text: trimmed.replace(/^down\s*/, '') };
    }
    if (trimmed.startsWith('neutral') || trimmed === '—' || trimmed === '-') {
      return { direction: 'neutral', text: trimmed.replace(/^neutral\s*/, '') || '0%' };
    }
    if (trimmed.startsWith('+')) {
      return { direction: 'up', text: trimmed };
    }
    if (trimmed.startsWith('-')) {
      return { direction: 'down', text: trimmed };
    }
    // Default: treat as neutral
    return { direction: 'neutral', text: trimmed };
  }
}

customElements.define('sq-stat-card', SQStatCard);
