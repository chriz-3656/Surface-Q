# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-30

### Added
- **Professional PDF Export:** Added ability to export the complete security scan report as a beautifully formatted PDF (like a commercial cybersecurity assessment report) directly from the dashboard.
- **Puppeteer Integration:** Integrated Headless Chrome via Puppeteer to generate high-fidelity PDFs from HTML/CSS templates.

### Fixed
- **Dashboard AI Rendering Crash:** Fixed a critical issue where the dashboard UI would crash if the AI (Gemini/Groq) returned an incomplete JSON structure missing specific keys (`simple` or `expert`). The UI now safely falls back to default values.
- **Extension Connection Error:** Fixed the `Unchecked runtime.lastError: Could not establish connection` error. This occurred when users attempted to scan restricted pages (like `chrome://`) or tabs that hadn't been refreshed since the extension was installed. The background script now safely handles and suppresses this error.
- **Dashboard UI State Sync:** Fixed a bug where the Export PDF button would remain hidden if a user refreshed the dashboard after a scan was already completed.

### Engineering Challenges & Solutions
- **Challenge:** E2E Playwright tests timing out when testing the PDF download feature.
- **Reason:** Playwright's `page.waitForEvent('download')` does not natively intercept file downloads triggered dynamically via Javascript `Blob` objects and `URL.createObjectURL(blob)`.
- **Solution:** Modified the frontend and backend architectures to ensure the telemetry state successfully reached the Node.js server, and validated the PDF generation independently using API endpoint testing rather than fighting Playwright's blob download limitations.

## [1.0.0] - 2026-06-29

### Added
- **Premium Landing Page:** Apple-inspired design with GSAP sequence animations.
- **Manifest V3 Extension:** Passive telemetry collection (headers, forms, scripts).
- **Node.js AI Backend:** Integration with Google Gemini for security risk assessments.
- **Telemetry Dashboard:** Real-time UI with Chart.js, Glassmorphism, and a Live Scan feed.
- **Dynamic Architecture Detection:** AI identification of static vs dynamic target stacks.
- **Expert & Simple Modes:** Adaptive feedback loops for different user personas.
- **E2E Testing:** Playwright suites for extension and landing page verification.

### Changed
- **UX Polish:** Global `:focus-visible` states for accessibility.
- **Performance:** Optimized WebP preloading from parallel network blasts to sequential batching.
- **Code Quality:** Removed dead canvas visualizer engines and bloated CSS.

### Fixed
- Playwright tests failing due to active interval timers (`networkidle` replaced with `domcontentloaded`).
- Misaligned spacing on the dashboard live feed on mobile viewports.

### Security
- Extension strictly uses passive DOM observation; zero outgoing payload injection.
- AI processing occurs locally on user-configured endpoints (Zero data logging by default).
