// scan-button.js — <sq-scan-button> custom element
// SurfaceQ Security Platform

const scanBtnTemplate = document.createElement('template');
scanBtnTemplate.innerHTML = `
<style>
  :host {
    display: inline-block;
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  }

  .wrapper {
    position: relative;
    width: 80px;
    height: 80px;
  }

  /* Gradient border ring */
  .ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    padding: 3px;
    background: linear-gradient(135deg, #00e5ff, #aa00ff);
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    transition: opacity 0.3s;
  }

  /* Spinning ring for scanning state */
  .spin-ring {
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #00e5ff;
    border-right-color: #aa00ff;
    opacity: 0;
    animation: none;
    pointer-events: none;
    transition: opacity 0.3s;
  }

  :host([state="scanning"]) .spin-ring {
    opacity: 1;
    animation: spinRing 1s linear infinite;
  }

  @keyframes spinRing {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Main button */
  button {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: none;
    background: rgba(10, 14, 30, 0.85);
    color: #ffffff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
    transition: transform 0.2s cubic-bezier(0.4,0,0.2,1),
                box-shadow 0.3s;
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.25),
                0 0 60px rgba(0, 229, 255, 0.1);
  }

  button:hover {
    transform: scale(1.06);
  }

  button:active {
    transform: scale(0.96);
  }

  /* Pulse glow for idle state */
  :host([state="idle"]) button,
  :host(:not([state])) button {
    animation: pulseGlow 2.5s ease-in-out infinite;
  }

  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(0,229,255,0.25),
                  0 0 60px rgba(0,229,255,0.1);
    }
    50% {
      box-shadow: 0 0 30px rgba(0,229,255,0.45),
                  0 0 80px rgba(0,229,255,0.2),
                  0 0 120px rgba(0,229,255,0.08);
    }
  }

  :host([state="scanning"]) button {
    animation: none;
    box-shadow: 0 0 24px rgba(0,229,255,0.35),
                0 0 64px rgba(0,229,255,0.15);
    cursor: wait;
  }

  :host([state="complete"]) button {
    animation: none;
    box-shadow: 0 0 24px rgba(0,230,118,0.35),
                0 0 60px rgba(0,230,118,0.12);
  }

  /* Icons */
  .icon {
    width: 32px;
    height: 32px;
    transition: opacity 0.3s, transform 0.3s;
  }

  .icon-shield,
  .icon-check {
    position: absolute;
  }

  .icon-shield {
    opacity: 1;
    transform: scale(1);
  }

  .icon-check {
    opacity: 0;
    transform: scale(0.5);
  }

  :host([state="complete"]) .icon-shield {
    opacity: 0;
    transform: scale(0.5);
  }
  :host([state="complete"]) .icon-check {
    opacity: 1;
    transform: scale(1);
  }

  /* Scanning shield pulse */
  :host([state="scanning"]) .icon-shield {
    animation: iconPulse 1.2s ease-in-out infinite;
  }

  @keyframes iconPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>

<div class="wrapper">
  <div class="ring"></div>
  <div class="spin-ring"></div>
  <button id="btn" type="button" aria-label="Start scan">
    <!-- Shield icon -->
    <svg class="icon icon-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
    <!-- Checkmark icon -->
    <svg class="icon icon-check" viewBox="0 0 24 24" fill="none" stroke="#00e676" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  </button>
</div>
`;

class SQScanButton extends HTMLElement {
  static get observedAttributes() {
    return ['state'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(scanBtnTemplate.content.cloneNode(true));
    this._btn = this.shadowRoot.getElementById('btn');
  }

  connectedCallback() {
    // Default state
    if (!this.hasAttribute('state')) {
      this.setAttribute('state', 'idle');
    }

    this._btn.addEventListener('click', () => {
      const state = this.getAttribute('state');
      if (state === 'scanning') return; // Ignore clicks while scanning

      this.dispatchEvent(new CustomEvent('scan-start', {
        bubbles: true,
        composed: true,
        detail: { timestamp: Date.now() },
      }));
    });
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'state') {
      // Update aria-label based on state
      const labels = {
        idle: 'Start scan',
        scanning: 'Scan in progress',
        complete: 'Scan complete',
      };
      this._btn.setAttribute('aria-label', labels[newVal] || 'Start scan');
    }
  }

  // Convenience getters / setters
  get state() {
    return this.getAttribute('state') || 'idle';
  }

  set state(val) {
    this.setAttribute('state', val);
  }
}

customElements.define('sq-scan-button', SQScanButton);
