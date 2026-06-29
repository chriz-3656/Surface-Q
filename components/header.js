/**
 * SurfaceQ Header Component
 * <sq-header> custom element with Shadow DOM
 * Attributes: title, subtitle
 * Features: glassmorphism, search, scan status, notifications, profile avatar
 */
class SQHeader extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'subtitle'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._notificationCount = 3;
    this._scanStatus = 'idle'; // idle, scanning, complete, error
    this._scanText = 'Last scan: 2m ago';
  }

  connectedCallback() {
    this.render();
    this._bindEvents();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.shadowRoot.innerHTML) {
      this.render();
      this._bindEvents();
    }
  }

  get pageTitle() {
    return this.getAttribute('title') || 'Dashboard';
  }

  get subtitle() {
    return this.getAttribute('subtitle') || '';
  }

  set notificationCount(val) {
    this._notificationCount = parseInt(val) || 0;
    const badge = this.shadowRoot.querySelector('.notification-badge');
    if (badge) {
      badge.textContent = this._notificationCount;
      badge.style.display = this._notificationCount > 0 ? 'flex' : 'none';
    }
  }

  set scanStatus(val) {
    this._scanStatus = val;
    const dot = this.shadowRoot.querySelector('.scan-dot');
    const text = this.shadowRoot.querySelector('.scan-text');
    if (dot) {
      dot.className = `scan-dot ${val}`;
    }
    if (text) {
      const statusMap = {
        idle: 'Last scan: 2m ago',
        scanning: 'Scanning...',
        complete: 'Scan complete',
        error: 'Scan error'
      };
      text.textContent = statusMap[val] || val;
    }
  }

  _bindEvents() {
    const searchInput = this.shadowRoot.querySelector('.search-input');
    const searchContainer = this.shadowRoot.querySelector('.search-container');

    if (searchInput && searchContainer) {
      searchInput.addEventListener('focus', () => {
        searchContainer.classList.add('focused');
      });
      searchInput.addEventListener('blur', () => {
        searchContainer.classList.remove('focused');
      });
    }

    // Cmd+K / Ctrl+K shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
        }
      }
    });

    // Notification bell click
    const bellBtn = this.shadowRoot.querySelector('.notification-btn');
    if (bellBtn) {
      bellBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('notifications-open', {
          bubbles: true,
          composed: true
        }));
      });
    }

    // Profile click
    const profileBtn = this.shadowRoot.querySelector('.profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('profile-open', {
          bubbles: true,
          composed: true
        }));
      });
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: sticky;
          top: 0;
          z-index: 50;
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
          padding: 0 24px;
          background: #0f0f11;
          border-bottom: 1px solid #27272a;
          box-sizing: border-box;
        }

        /* Left section - Title */
        .header-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 180px;
        }

        .page-title {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }

        .page-subtitle {
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.4);
          margin: 0;
          line-height: 1.3;
        }

        /* Center section - Search */
        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
          max-width: 480px;
          margin: 0 24px;
        }

        .search-container {
          position: relative;
          width: 100%;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .search-container.focused .search-icon {
          color: #00e5ff;
        }

        .search-input {
          width: 100%;
          height: 38px;
          padding: 0 70px 0 38px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #ffffff;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .search-input:focus {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(0, 229, 255, 0.3);
          box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.08);
        }

        .search-shortcut {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 4px;
          pointer-events: none;
        }

        .shortcut-key {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 22px;
          padding: 0 5px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          font-size: 11px;
          font-family: inherit;
          color: rgba(255, 255, 255, 0.35);
          line-height: 1;
        }

        .search-container.focused .search-shortcut {
          opacity: 0;
        }

        /* Right section */
        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 220px;
          justify-content: flex-end;
        }

        /* Scan status */
        .scan-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          cursor: default;
        }

        .scan-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00e676;
          flex-shrink: 0;
          position: relative;
        }

        .scan-dot.idle {
          background: #00e676;
        }

        .scan-dot.scanning {
          background: #00e5ff;
          animation: pulse-dot 1.5s ease-in-out infinite;
        }

        .scan-dot.complete {
          background: #00e676;
        }

        .scan-dot.error {
          background: #ff1744;
        }

        .scan-dot::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 50%;
          background: inherit;
          opacity: 0.3;
          animation: pulse-ring 2s ease-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(2); opacity: 0; }
        }

        .scan-text {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.45);
          white-space: nowrap;
        }

        /* Notification bell */
        .notification-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.5);
          transition: all 0.2s ease;
          padding: 0;
        }

        .notification-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.8);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: #ff1744;
          color: #ffffff;
          font-size: 10px;
          font-weight: 600;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(255, 23, 68, 0.4);
          line-height: 1;
          box-sizing: border-box;
        }

        /* Profile avatar */
        .profile-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #00e5ff 0%, #0091ea 100%);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          position: relative;
          overflow: hidden;
        }

        .profile-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 12px rgba(0, 229, 255, 0.3);
        }

        .profile-initials {
          font-size: 13px;
          font-weight: 600;
          color: #0a0e1a;
          letter-spacing: 0.5px;
          line-height: 1;
        }

        .profile-status {
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #00e676;
          border: 2px solid #0a0e1a;
        }

        /* Separator */
        .header-separator {
          width: 1px;
          height: 28px;
          background: rgba(255, 255, 255, 0.06);
        }
      </style>

      <header class="header">
        <!-- Left: Title -->
        <div class="header-left">
          <h1 class="page-title">${this.pageTitle}</h1>
          ${this.subtitle ? `<p class="page-subtitle">${this.subtitle}</p>` : ''}
        </div>

        <!-- Center: Search -->
        <div class="header-center">
          <div class="search-container">
            <div class="search-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                   stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="7" cy="7" r="4.5"/>
                <line x1="10.2" y1="10.2" x2="14" y2="14"/>
              </svg>
            </div>
            <input type="text" class="search-input" placeholder="Search assets, threats, endpoints..."
                   aria-label="Search">
            <div class="search-shortcut">
              <span class="shortcut-key">⌘</span>
              <span class="shortcut-key">K</span>
            </div>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="header-right">
          <!-- Scan Status -->
          <div class="scan-status">
            <div class="scan-dot idle"></div>
            <span class="scan-text">Last scan: 2m ago</span>
          </div>

          <div class="header-separator"></div>

          <!-- Notification Bell -->
          <button class="notification-btn" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor"
                 stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13.73 12.5A8.5 8.5 0 0 0 14.5 8V6.5a5.5 5.5 0 0 0-11 0V8a8.5 8.5 0 0 0 .77 4.5"/>
              <path d="M3 12.5h12a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2z"/>
              <path d="M7.5 15a1.5 1.5 0 0 0 3 0"/>
            </svg>
            <span class="notification-badge" style="${this._notificationCount > 0 ? '' : 'display:none'}">${this._notificationCount}</span>
          </button>

          <!-- Profile Avatar -->
          <button class="profile-btn" aria-label="Profile">
            <span class="profile-initials">SQ</span>
            <div class="profile-status"></div>
          </button>
        </div>
      </header>
    `;
  }
}

customElements.define('sq-header', SQHeader);
