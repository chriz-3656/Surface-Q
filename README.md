<div align="center">

# 🛡️ SurfaceQ

### AI-Powered Real-Time Attack Surface Intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-cyan.svg)](CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Understand the security posture of any website in real-time.**
*Passive analysis • AI-powered insights • Zero data collection*

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 📖 About

**SurfaceQ** is an open-source security intelligence platform that combines a lightweight Chrome browser extension with a powerful Node.js backend to passively analyze the attack surface of any website you visit. Unlike traditional vulnerability scanners that actively probe targets, SurfaceQ operates entirely through passive observation — inspecting publicly available security headers, SSL/TLS certificate configurations, technology stack fingerprints, and DNS records to build a comprehensive security profile.

At its core, SurfaceQ leverages **Google Gemini AI** to transform raw technical data into actionable intelligence. The AI engine generates human-readable risk assessments, identifies potential vulnerabilities based on detected configurations, suggests concrete remediation steps, and provides contextual threat intelligence tailored to each website's unique technology stack.

Whether you're a security researcher auditing client infrastructure, a developer validating your own deployments, or a curious technologist who wants to understand the security landscape of the web, SurfaceQ gives you instant, meaningful insights without sending a single probe packet.

### Why SurfaceQ?

- **Non-intrusive**: All analysis is performed on data that is already publicly available — HTTP response headers, SSL certificates, DNS records, and client-side technology fingerprints. No active scanning, no port probing, no exploitation.
- **Intelligent**: Raw security data is processed by Google Gemini AI to produce risk scores, vulnerability assessments, and prioritized remediation guidance that would take a human analyst significant time to compile.
- **Private**: Your browsing data never leaves your control. Analysis results are stored locally in a SQLite database on your machine. There is no telemetry, no cloud sync, and no data collection of any kind.
- **Extensible**: Built on a modular three-tier architecture that makes it easy to add new analysis modules, integrate additional AI models, or extend the dashboard with custom visualizations.

## 📸 Screenshots

<!-- Screenshots will be added -->
<!-- Screenshot: Extension popup showing security analysis results -->
<!-- Screenshot: Interactive dashboard with risk scoring charts -->
<!-- Screenshot: AI-generated threat assessment report -->
<!-- Screenshot: Technology stack detection panel -->
<!-- Screenshot: Historical analysis comparison view -->

## ✨ Features

### 🔍 Passive Scanning
Automatically analyze every website you visit without sending additional network requests. SurfaceQ inspects HTTP response headers, extracts security-relevant configurations, and identifies missing protections — all from data your browser already receives during normal page loads.

### 🤖 AI Analysis
Powered by Google Gemini AI, SurfaceQ transforms raw security headers and technical metadata into comprehensive threat assessments. The AI engine understands the relationships between different security configurations and identifies compound vulnerabilities that simple rule-based checks would miss.

### 📊 Attack Surface Visualization
Interactive charts and graphs built with Chart.js and D3.js provide an intuitive visual representation of a website's attack surface. See security header coverage, technology risk distribution, SSL/TLS configuration strength, and historical security trends at a glance.

### ⚡ Risk Scoring
A multi-dimensional risk scoring algorithm evaluates each website across security headers, SSL/TLS configuration, technology stack vulnerabilities, and DNS security. Scores are weighted by severity and exploitability to produce an actionable overall risk rating from 0 (critical) to 100 (excellent).

### 📝 Report Generation
Export detailed security reports in multiple formats for documentation, compliance, or client delivery. Reports include the full technical analysis, AI-generated executive summary, risk scores with historical trends, and prioritized remediation recommendations.

### 🔒 Privacy First
SurfaceQ is built from the ground up with privacy as a core design principle. All analysis data is stored locally in a SQLite database on your machine. API keys are stored server-side and never exposed to the extension. There is zero telemetry, zero cloud sync, and zero data collection.

### 🧩 Browser Extension
A lightweight Chrome extension integrates seamlessly into your browsing workflow. The extension popup provides instant security insights for the current tab, with one-click access to detailed analysis, historical data, and the full interactive dashboard.

### 📈 Interactive Dashboard
A full-featured web dashboard provides deep-dive analysis capabilities, historical trend visualization, cross-site comparison tools, and comprehensive reporting. Built with responsive design for desktop and tablet use.

## 🚀 Quick Start

### Browser Extension Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chriz-3656/Surface-Q.git
   cd Surface-Q
   ```

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** using the toggle in the top-right corner
   - Click **Load unpacked**
   - Select the `extension/` directory from the cloned repository

3. **Verify installation**
   - You should see the SurfaceQ shield icon in your Chrome toolbar
   - Click the icon to open the popup and verify it loads correctly

### Server Setup

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your configuration:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   DB_PATH=./data/surfaceq.db
   ```

3. **Start the server**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000` by default.

4. **Access the dashboard**
   Open `http://localhost:3000/dashboard` in your browser to view the interactive analysis dashboard.

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the generated key and paste it into your `.env` file

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Extension** | JavaScript | Core extension logic and content scripts |
| **Extension** | Chrome Extension APIs | Browser integration, tab management, web requests |
| **Extension** | HTML/CSS | Popup UI and extension pages |
| **Backend** | Node.js | Server runtime environment |
| **Backend** | Express | REST API framework |
| **Database** | SQLite / better-sqlite3 | Local persistent storage for analysis results |
| **AI** | Google Gemini AI | Intelligent risk assessment and threat analysis |
| **Visualization** | Chart.js | Interactive charts and risk score gauges |
| **Visualization** | D3.js | Advanced data visualizations and network graphs |

## 🏗️ Architecture

SurfaceQ employs a **three-tier architecture** designed for modularity, performance, and privacy. The **browser extension** serves as the data collection layer, passively intercepting HTTP response headers, extracting technology fingerprints from page content, and capturing SSL/TLS certificate details through Chrome's WebRequest and related APIs. This raw data is transmitted to the **backend server**, a Node.js/Express application running locally on the user's machine, which orchestrates the analysis pipeline. The server processes incoming data through specialized analysis modules (header analysis, SSL evaluation, technology detection, DNS resolution), persists results in a local **SQLite database** via better-sqlite3, and forwards relevant data to the **Google Gemini AI** layer for intelligent risk assessment. The AI engine returns structured assessments including risk scores, vulnerability descriptions, remediation recommendations, and contextual threat intelligence, which are stored alongside the raw analysis data and served to both the extension popup and the interactive web dashboard.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Chrome          │     │  Node.js/Express │     │  Google Gemini  │
│  Extension       │────▶│  Backend Server  │────▶│  AI Engine      │
│  (Passive Data)  │◀────│  (Analysis +     │◀────│  (Risk          │
│                  │     │   SQLite DB)     │     │   Assessment)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │
        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐
│  Extension       │     │  Web Dashboard   │
│  Popup UI        │     │  (Chart.js/D3)   │
└─────────────────┘     └──────────────────┘
```

## 🔐 Privacy & Security

SurfaceQ is committed to protecting your privacy. Here is a clear breakdown of what the platform does and does not access:

### ✅ What We Analyze
- HTTP security response headers (CSP, HSTS, X-Frame-Options, etc.)
- SSL/TLS certificate details (issuer, expiry, protocol version, cipher suites)
- DNS records (A, AAAA, MX, TXT, DMARC, SPF, DNSSEC status)
- Technology stack fingerprints (frameworks, libraries, CMS, server software)
- Security risk scores derived from the above data points

### ❌ What We NEVER Collect
- Passwords or authentication credentials
- Form data or user input
- Cookies or session tokens
- Personally identifiable information (PII)
- Browsing history or navigation patterns
- Keystrokes or clipboard content
- File system access or downloads
- Microphone, camera, or location data

All analysis results are stored exclusively in a local SQLite database on your machine. The only external network requests made by the server are to the Google Gemini API for AI-powered analysis, and these requests contain only the technical metadata listed above — never any personal or browsing data.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ROADMAP.md](ROADMAP.md) | Development phases, milestones, and future vision |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute, development setup, and code style |
| [SECURITY.md](SECURITY.md) | Security policy, vulnerability reporting, and data handling |
| [CHANGELOG.md](CHANGELOG.md) | Version history and release notes |
| [LICENSE](LICENSE) | MIT License terms |

## 🤝 Contributing

We welcome contributions of all kinds! Whether you're fixing a typo, adding a feature, improving documentation, or suggesting ideas, your help makes SurfaceQ better for everyone.

Please read our [Contributing Guide](CONTRIBUTING.md) for detailed instructions on:
- Setting up your development environment
- Our branching and commit message conventions
- The pull request review process
- Code style and testing requirements

## 🗺️ Roadmap

SurfaceQ is under active development. See our [ROADMAP.md](ROADMAP.md) for the full development plan, including:
- **Phase 1**: Foundation — Project setup, scaffolding, and core infrastructure ✅
- **Phase 2**: Core Features — Header analysis, SSL/TLS, tech detection, risk scoring 🔄
- **Phase 3**: AI Integration — Gemini-powered analysis and threat intelligence 📋
- **Phase 4**: Production Polish — Export, comparison, dark mode, CI/CD 📋

## 📄 License

SurfaceQ is released under the [MIT License](LICENSE). You are free to use, modify, and distribute this software in accordance with the license terms.

## 👥 Team & Credits

**chriz-3656** — This project is built and maintained by a community of security enthusiasts, developers, and researchers who believe that understanding the web's attack surface should be accessible to everyone.

We are grateful to the open-source community and the creators of the technologies that make SurfaceQ possible:
- [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/) for the backend foundation
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for fast, synchronous SQLite access
- [Google Gemini AI](https://ai.google.dev/) for intelligent analysis capabilities
- [Chart.js](https://www.chartjs.org/) and [D3.js](https://d3js.org/) for data visualization
- The Chrome Extensions platform for seamless browser integration

---

<div align="center">

**Built with 🛡️ by the SurfaceQ community**

[Report a Bug](https://github.com/chriz-3656/Surface-Q/issues) · [Request a Feature](https://github.com/chriz-3656/Surface-Q/issues) · [Security Policy](SECURITY.md)

</div>
