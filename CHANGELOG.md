# Changelog

All notable changes to SurfaceQ will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- SSL/TLS certificate chain analysis and scoring
- Advanced technology detection via passive fingerprinting
- DNS security analysis (SPF, DMARC, DKIM, DNSSEC)
- Google Gemini AI integration for intelligent risk assessment
- Natural language vulnerability descriptions and remediation guidance
- Report export in PDF, JSON, and CSV formats
- Side-by-side site comparison tool
- Dark mode for extension popup and web dashboard
- CI/CD pipeline with GitHub Actions

## [1.0.0] - 2026-06-29

### Added
- **Chrome Extension** — Manifest V3 browser extension with background service worker, content scripts, and popup interface for real-time security analysis
- **Extension Popup UI** — Tabbed popup interface displaying security header analysis, risk scores, technology detection results, and quick-action controls
- **Node.js Backend Server** — Express-based REST API server with modular route structure, middleware configuration, and CORS support
- **SQLite Database** — Local persistent storage using better-sqlite3 with schema for scan results, analysis history, domain records, and risk scores
- **HTTP Security Header Analysis** — Comprehensive parsing and evaluation of Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, and Permissions-Policy headers
- **Risk Scoring Algorithm** — Multi-dimensional scoring engine evaluating security headers, SSL/TLS configuration, technology stack, and DNS security with weighted composite scoring (0-100 scale)
- **Interactive Web Dashboard** — Full-featured web dashboard with Chart.js and D3.js visualizations, data tables, summary statistics, and responsive layout
- **Analysis History** — Persistent storage of scan results with timestamps, enabling historical lookups by domain and security posture tracking over time
- **Technology Stack Detection** — Passive identification of web frameworks, CMS platforms, server software, CDN providers, and third-party services through header and DOM analysis
- **Extension-Server Communication** — Secure message passing between the Chrome extension and backend server via REST API with structured request/response formats
- **Environment Configuration** — Dotenv-based configuration management with .env.example template for API keys, database paths, and server settings
- **Development Tooling** — ESLint configuration, nodemon hot-reload, npm scripts for development workflow, and EditorConfig for consistent formatting
- **Project Documentation** — Comprehensive README, Contributing Guide, Security Policy, Roadmap, Changelog, and MIT License

### Security
- All analysis performed through passive observation only — no active scanning or probing
- API keys stored exclusively server-side in environment variables, never exposed to the extension
- Local-only SQLite storage with no cloud sync, telemetry, or data collection
- Minimal Chrome extension permissions following the principle of least privilege
- CORS configuration restricting API access to authorized origins
- Environment file excluded from version control via .gitignore

[Unreleased]: https://github.com/chriz-3656/Surface-Q/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/chriz-3656/Surface-Q/releases/tag/v1.0.0
