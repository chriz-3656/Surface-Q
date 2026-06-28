// toast-container.js — <sq-toast-container> custom element
// SurfaceQ Security Platform

const TYPE_COLORS = {
  success: '#00e676',
  error: '#ff1744',
  warning: '#ff9100',
  info: '#00e5ff',
};

const TYPE_ICONS = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

const toastContainerTemplate = document.createElement('template');
toastContainerTemplate.innerHTML = `
<style>
  :host {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 10000;
    display: flex;
    flex-direction: column-reverse;
    gap: 8px;
    pointer-events: none;
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  }

  .toast {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 320px;
    max-width: 420px;
    padding: 14px 16px;
    padding-right: 40px;
    background: rgba(15,20,40,0.95);
    border: 1px solid rgba(255,255,255,0.06);
    border-left: 4px solid var(--toast-color, #00e5ff);
    border-radius: 8px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4),
                0 0 0 1px rgba(255,255,255,0.04);
    pointer-events: auto;
    overflow: hidden;
    transform: translateX(120%);
    opacity: 0;
    animation: slideIn 0.35s cubic-bezier(0.4,0,0.2,1) forwards;
  }

  .toast.dismissing {
    animation: slideOut 0.3s cubic-bezier(0.4,0,0.2,1) forwards;
  }

  @keyframes slideIn {
    0% {
      transform: translateX(120%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    100% {
      transform: translateX(120%);
      opacity: 0;
    }
  }

  .toast-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    color: var(--toast-color, #00e5ff);
    margin-top: 1px;
  }
  .toast-icon svg {
    width: 20px;
    height: 20px;
  }

  .toast-message {
    flex: 1;
    font-size: 14px;
    color: rgba(255,255,255,0.9);
    line-height: 1.5;
    word-break: break-word;
  }

  .toast-close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
    border: none;
    background: rgba(255,255,255,0.06);
    border-radius: 6px;
    color: rgba(255,255,255,0.4);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, color 0.2s;
    padding: 0;
  }
  .toast-close:hover {
    background: rgba(255,255,255,0.12);
    color: #fff;
  }
  .toast-close svg {
    width: 14px;
    height: 14px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* Progress bar */
  .toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: var(--toast-color, #00e5ff);
    border-radius: 0 0 0 8px;
    opacity: 0.7;
    /* width is animated via JS */
    transition: none;
  }

  @keyframes progressShrink {
    0% { width: 100%; }
    100% { width: 0%; }
  }
</style>

<div id="container"></div>
`;

class SQToastContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(toastContainerTemplate.content.cloneNode(true));
    this._container = this.shadowRoot.getElementById('container');
    this._toasts = [];
  }

  /**
   * Show a toast notification.
   * @param {string} message  — Text to display
   * @param {string} [type]   — 'success' | 'error' | 'warning' | 'info'
   * @param {number} [duration] — Auto-dismiss in ms (default 4000, 0 = manual only)
   * @returns {HTMLElement} the toast element (for programmatic removal)
   */
  show(message, type = 'info', duration = 4000) {
    const color = TYPE_COLORS[type] || TYPE_COLORS.info;
    const iconSvg = TYPE_ICONS[type] || TYPE_ICONS.info;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.setProperty('--toast-color', color);

    toast.innerHTML = `
      <span class="toast-icon">${iconSvg}</span>
      <span class="toast-message">${this._escapeHTML(message)}</span>
      <button class="toast-close" aria-label="Dismiss">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      ${duration > 0 ? `<div class="toast-progress" style="animation: progressShrink ${duration}ms linear forwards;"></div>` : ''}
    `;

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this._dismiss(toast));

    this._container.appendChild(toast);
    this._toasts.push(toast);

    // Auto-dismiss
    if (duration > 0) {
      toast._dismissTimer = setTimeout(() => this._dismiss(toast), duration);
    }

    return toast;
  }

  /**
   * Dismiss a toast with slide-out animation.
   */
  _dismiss(toast) {
    if (toast._dismissed) return;
    toast._dismissed = true;

    clearTimeout(toast._dismissTimer);
    toast.classList.add('dismissing');

    toast.addEventListener('animationend', () => {
      toast.remove();
      this._toasts = this._toasts.filter(t => t !== toast);
    }, { once: true });
  }

  /**
   * Clear all toasts immediately.
   */
  clearAll() {
    [...this._toasts].forEach(t => this._dismiss(t));
  }

  /**
   * Escape HTML to prevent XSS.
   */
  _escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

customElements.define('sq-toast-container', SQToastContainer);
