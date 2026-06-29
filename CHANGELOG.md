# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
