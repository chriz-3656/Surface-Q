/**
 * SurfaceQ Sidebar Component
 * <sq-sidebar> custom element with Shadow DOM
 * Features: collapsible nav, active link detection, inline SVG icons, dark theme
 */
class SQSidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._collapsed = false;
  }

  connectedCallback() {
    this.render();
    this._detectActivePage();
    this._bindEvents();
  }

  get collapsed() {
    return this._collapsed;
  }

  set collapsed(val) {
    this._collapsed = val;
    const sidebar = this.shadowRoot.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed', val);
    }
    this.dispatchEvent(new CustomEvent('sidebar-toggle', {
      detail: { collapsed: val },
      bubbles: true,
      composed: true
    }));
  }

  _getNavItems() {
    return [
      {
        label: 'Dashboard',
        href: 'dashboard.html',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="1" width="4" height="4" rx="0.5"/>
          <rect x="6" y="1" width="4" height="4" rx="0.5"/>
          <rect x="11" y="1" width="4" height="4" rx="0.5"/>
          <rect x="1" y="6" width="4" height="4" rx="0.5"/>
          <rect x="6" y="6" width="4" height="4" rx="0.5"/>
          <rect x="11" y="6" width="4" height="4" rx="0.5"/>
          <rect x="1" y="11" width="4" height="4" rx="0.5"/>
          <rect x="6" y="11" width="4" height="4" rx="0.5"/>
          <rect x="11" y="11" width="4" height="4" rx="0.5"/>
        </svg>`
      },
      {
        label: 'Threat Feed',
        href: 'dashboard.html#threats',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7.134 1.504a1 1 0 0 1 1.732 0l5.857 10.14a1 1 0 0 1-.866 1.506H2.143a1 1 0 0 1-.866-1.506l5.857-10.14z"/>
          <line x1="8" y1="5.5" x2="8" y2="8.5"/>
          <circle cx="8" cy="10.5" r="0.5" fill="currentColor" stroke="none"/>
        </svg>`
      },
      {
        label: 'Attack Surface',
        href: 'attack-map.html',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="8" r="6.5"/>
          <ellipse cx="8" cy="8" rx="3" ry="6.5"/>
          <line x1="1.5" y1="8" x2="14.5" y2="8"/>
          <path d="M2.5 4.5h11"/>
          <path d="M2.5 11.5h11"/>
        </svg>`
      },
      {
        label: 'Endpoints',
        href: 'dashboard.html#endpoints',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6.5 9.5L2.2 13.8"/>
          <path d="M9.5 6.5L13.8 2.2"/>
          <circle cx="4.5" cy="11.5" r="2"/>
          <circle cx="11.5" cy="4.5" r="2"/>
        </svg>`
      },
      {
        label: 'Assets',
        href: 'dashboard.html#assets',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="8,1.5 14.5,5 14.5,5 8,8.5 1.5,5"/>
          <polyline points="1.5,8 8,11.5 14.5,8"/>
          <polyline points="1.5,11 8,14.5 14.5,11"/>
        </svg>`
      },
      {
        label: 'Forms',
        href: 'dashboard.html#forms',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V5L10 1.5z"/>
          <polyline points="10,1.5 10,5 13.5,5"/>
          <line x1="5" y1="8" x2="11" y2="8"/>
          <line x1="5" y1="10.5" x2="11" y2="10.5"/>
          <line x1="5" y1="5.5" x2="7" y2="5.5"/>
        </svg>`
      },
      {
        label: 'Technologies',
        href: 'dashboard.html#tech',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="12" height="12" rx="1.5"/>
          <line x1="8" y1="2" x2="8" y2="14"/>
          <line x1="2" y1="8" x2="14" y2="8"/>
          <circle cx="5" cy="5" r="1" fill="currentColor" stroke="none"/>
          <circle cx="11" cy="5" r="1" fill="currentColor" stroke="none"/>
          <circle cx="5" cy="11" r="1" fill="currentColor" stroke="none"/>
          <circle cx="11" cy="11" r="1" fill="currentColor" stroke="none"/>
          <line x1="5" y1="6" x2="5" y2="7"/>
          <line x1="11" y1="6" x2="11" y2="7"/>
          <line x1="5" y1="9" x2="5" y2="10"/>
          <line x1="11" y1="9" x2="11" y2="10"/>
          <line x1="6" y1="5" x2="7" y2="5"/>
          <line x1="9" y1="5" x2="10" y2="5"/>
          <line x1="6" y1="11" x2="7" y2="11"/>
          <line x1="9" y1="11" x2="10" y2="11"/>
        </svg>`
      },
      {
        label: 'Reports',
        href: 'reports.html',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="14" y1="14.5" x2="14" y2="5.5"/>
          <line x1="10" y1="14.5" x2="10" y2="1.5"/>
          <line x1="6" y1="14.5" x2="6" y2="8.5"/>
          <line x1="2" y1="14.5" x2="2" y2="11.5"/>
        </svg>`
      },
      {
        label: 'History',
        href: 'history.html',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="8" r="6.5"/>
          <polyline points="8,4 8,8 11,10"/>
        </svg>`
      },
      {
        label: 'AI Assistant',
        href: 'dashboard.html#ai',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 1l1.2 3.1L12.5 5l-2.5 2.3.7 3.5L8 9.1 5.3 10.8l.7-3.5L3.5 5l3.3-.9L8 1z"/>
          <path d="M3 12.5l.6 1.5 1.6.5-1.2 1.1.3 1.7L3 16.5l-1.3.8.3-1.7L.8 14.5l1.6-.5L3 12.5z" transform="scale(0.7) translate(1,2)"/>
          <path d="M13 11l.5 1.2 1.3.4-1 .9.2 1.4-1.1-.6-1.1.6.2-1.4-1-.9 1.3-.4L13 11z" transform="scale(0.7) translate(5,3)"/>
        </svg>`
      },
      {
        label: 'Settings',
        href: 'settings.html',
        icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="8" r="2.5"/>
          <path d="M13.3 10a1.2 1.2 0 0 0 .2 1.3l.04.04a1.44 1.44 0 1 1-2.04 2.04l-.04-.04a1.2 1.2 0 0 0-1.3-.2 1.2 1.2 0 0 0-.72 1.08v.12a1.44 1.44 0 1 1-2.88 0v-.06A1.2 1.2 0 0 0 5.8 13.3a1.2 1.2 0 0 0-1.3.2l-.04.04a1.44 1.44 0 1 1-2.04-2.04l.04-.04a1.2 1.2 0 0 0 .2-1.3 1.2 1.2 0 0 0-1.08-.72h-.12a1.44 1.44 0 0 1 0-2.88h.06A1.2 1.2 0 0 0 2.7 5.8a1.2 1.2 0 0 0-.2-1.3l-.04-.04a1.44 1.44 0 1 1 2.04-2.04l.04.04a1.2 1.2 0 0 0 1.3.2h.06a1.2 1.2 0 0 0 .72-1.08v-.12a1.44 1.44 0 1 1 2.88 0v.06a1.2 1.2 0 0 0 .72.84 1.2 1.2 0 0 0 1.3-.2l.04-.04a1.44 1.44 0 1 1 2.04 2.04l-.04.04a1.2 1.2 0 0 0-.2 1.3v.06a1.2 1.2 0 0 0 1.08.72h.12a1.44 1.44 0 0 1 0 2.88h-.06a1.2 1.2 0 0 0-.84.72z" transform="scale(0.55) translate(3.5,3.5)"/>
        </svg>`
      }
    ];
  }

  _detectActivePage() {
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    const currentFile = currentPath.split('/').pop() || 'dashboard.html';

    const links = this.shadowRoot.querySelectorAll('.nav-link');
    links.forEach(link => {
      const href = link.getAttribute('data-href');
      const [file, hash] = href.split('#');

      let isActive = false;

      if (hash) {
        // Match file + hash
        isActive = currentFile === file && currentHash === '#' + hash;
      } else {
        // Match file only, but only if no hash items also match
        isActive = currentFile === file && !currentHash;
      }

      // Default: highlight Dashboard if on root or index
      if (!file && !hash && (currentFile === '' || currentFile === 'index.html')) {
        isActive = true;
      }

      link.classList.toggle('active', isActive);
    });

    // If nothing is active, activate Dashboard
    const anyActive = this.shadowRoot.querySelector('.nav-link.active');
    if (!anyActive && links.length > 0) {
      links[0].classList.add('active');
    }
  }

  _bindEvents() {
    const toggleBtn = this.shadowRoot.querySelector('.collapse-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.collapsed = !this.collapsed;
      });
    }

    // Nav link clicks
    const links = this.shadowRoot.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      this._detectActivePage();
    });
  }

  render() {
    const navItems = this._getNavItems();

    const navHTML = navItems.map(item => `
      <a class="nav-link" href="${item.href}" data-href="${item.href}">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
      </a>
    `).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        .sidebar {
          width: 260px;
          height: 100%;
          background: #0f0f11;
          border-right: 1px solid #27272a;
          display: flex;
          flex-direction: column;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          position: relative;
        }

        .sidebar.collapsed {
          width: 64px;
        }

        /* Logo */
        .logo-container {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          min-height: 64px;
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .logo-icon {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-icon svg {
          filter: drop-shadow(0 0 6px rgba(0, 229, 255, 0.4));
        }

        .logo-text {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #00e5ff 0%, #00b8d4 50%, #0091ea 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
          opacity: 1;
          transition: opacity 0.2s ease, width 0.3s ease;
        }

        .sidebar.collapsed .logo-text {
          opacity: 0;
          width: 0;
          overflow: hidden;
        }

        /* Navigation */
        .nav-section {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 12px 8px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .nav-section::-webkit-scrollbar {
          width: 4px;
        }

        .nav-section::-webkit-scrollbar-track {
          background: transparent;
        }

        .nav-section::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          margin: 2px 0;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.55);
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          transition: all 0.2s ease;
          position: relative;
          white-space: nowrap;
          border-left: 3px solid transparent;
          cursor: pointer;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.85);
        }

        .nav-link:hover .nav-icon {
          color: rgba(255, 255, 255, 0.85);
        }

        .nav-link.active {
          background: rgba(0, 229, 255, 0.08);
          color: #00e5ff;
          border-left-color: #00e5ff;
        }

        .nav-link.active .nav-icon {
          color: #00e5ff;
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          left: -3px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: #00e5ff;
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: rgba(255, 255, 255, 0.4);
          transition: color 0.2s ease;
        }

        .nav-icon svg {
          width: 16px;
          height: 16px;
        }

        .nav-label {
          opacity: 1;
          transition: opacity 0.2s ease 0.1s;
          overflow: hidden;
        }

        .sidebar.collapsed .nav-label {
          opacity: 0;
          width: 0;
          transition: opacity 0.1s ease;
        }

        .sidebar.collapsed .nav-link {
          justify-content: center;
          padding: 10px;
          border-left-color: transparent;
        }

        .sidebar.collapsed .nav-link.active {
          border-left-color: transparent;
        }

        .sidebar.collapsed .nav-link.active::before {
          display: none;
        }

        /* Tooltip on collapsed */
        .sidebar.collapsed .nav-link {
          position: relative;
        }

        .sidebar.collapsed .nav-link::after {
          content: attr(data-tooltip);
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          background: #1a1f35;
          color: rgba(255, 255, 255, 0.9);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 1000;
        }

        .sidebar.collapsed .nav-link:hover::after {
          opacity: 1;
        }

        /* Bottom section */
        .sidebar-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 12px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .collapse-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 36px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .collapse-toggle:hover {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.7);
        }

        .collapse-toggle svg {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar.collapsed .collapse-toggle svg {
          transform: rotate(180deg);
        }

        .version-text {
          text-align: center;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: 0.5px;
          padding: 4px 0;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.2s ease;
        }

        .sidebar.collapsed .version-text {
          font-size: 9px;
        }
      </style>

      <nav class="sidebar" role="navigation" aria-label="Main navigation">
        <!-- Logo -->
        <div class="logo-container">
          <div class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <defs>
                <linearGradient id="shield-grad" x1="4" y1="2" x2="24" y2="26">
                  <stop offset="0%" stop-color="#00e5ff"/>
                  <stop offset="100%" stop-color="#0091ea"/>
                </linearGradient>
              </defs>
              <path d="M14 2L4 6.5V13c0 5.55 4.27 10.74 10 12 5.73-1.26 10-6.45 10-12V6.5L14 2z"
                    stroke="url(#shield-grad)" stroke-width="1.8" fill="none"/>
              <path d="M14 6L8 8.5V12.5c0 3.33 2.56 6.44 6 7.2 3.44-.76 6-3.87 6-7.2V8.5L14 6z"
                    fill="url(#shield-grad)" opacity="0.15"/>
              <path d="M11 13.5l2 2 4-4" stroke="url(#shield-grad)" stroke-width="1.8"
                    stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </div>
          <span class="logo-text">SurfaceQ</span>
        </div>

        <!-- Navigation Links -->
        <div class="nav-section">
          ${navItems.map(item => `
            <a class="nav-link" href="${item.href}" data-href="${item.href}" data-tooltip="${item.label}">
              <span class="nav-icon">${item.icon}</span>
              <span class="nav-label">${item.label}</span>
            </a>
          `).join('')}
        </div>

        <!-- Bottom Section -->
        <div class="sidebar-bottom">
          <button class="collapse-toggle" aria-label="Toggle sidebar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                 stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="11,3 6,8 11,13"/>
            </svg>
          </button>
          <div class="version-text">v1.0.0</div>
        </div>
      </nav>
    `;
  }
}

customElements.define('sq-sidebar', SQSidebar);
