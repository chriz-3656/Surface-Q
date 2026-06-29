# Project Structure 📂

The Surface-Q repository is organized into distinct logical units.

```text
Surface-Q/
├── .env.example             # Template for environment variables (API Keys)
├── .github/                 # GitHub Actions workflows (CI/CD)
├── assets/                  # Shared frontend assets
│   ├── css/                 # Global styles (landing.css, main.css)
│   ├── hero-final_000/      # GSAP cinematic sequence frames (WebP)
│   └── js/                  # Frontend scripts (landing.js, chart.js, vendor/)
├── components/              # Web Components for the dashboard
│   ├── header.js            # Top navigation bar
│   └── sidebar.js           # Left navigation menu
├── docs/                    # Comprehensive project documentation
│   ├── API.md               # Backend API routes
│   ├── ARCHITECTURE.md      # System design and Mermaid diagrams
│   ├── PROJECT_STRUCTURE.md # This file
│   └── ...                  # Other docs (DEPLOYMENT, INSTALLATION)
├── extension/               # Chrome Extension (Manifest V3)
│   ├── manifest.json        # Extension configuration
│   ├── background.js        # Service worker (Network interception)
│   ├── content.js           # DOM parser
│   ├── popup.html           # Extension UI
│   └── popup.js             # Extension logic
├── server/                  # Node.js Backend
│   ├── index.js             # Express server and AI integration
│   ├── test_extension.js    # Playwright E2E test for extension
│   └── test_landing.js      # Playwright test for landing page
├── index.html               # Premium Landing Page
├── dashboard.html           # Main Telemetry Dashboard
├── findings.html            # Detailed Findings View (WIP)
├── settings.html            # Settings View (WIP)
├── README.md                # Main project overview
├── SETUP.md                 # Installation and execution instructions
├── TESTING.md               # How to run integration tests
├── CONTRIBUTING.md          # Guidelines for open-source contributors
├── CHANGELOG.md             # Version history and updates
├── AI_DISCLOSURE.md         # AI usage, privacy, and limitations
└── LICENSE                  # MIT License
```

## Key Files
- `server/index.js`: The core API that handles AI processing.
- `extension/content.js`: The script that extracts passive DOM data.
- `assets/js/landing.js`: Orchestrates the high-performance GSAP animations.
- `dashboard.html`: The central hub for viewing scan telemetry.
