<div align="center">

# 🛡️ SurfaceQ

### AI-Powered Real-Time Attack Surface Intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-cyan.svg)](CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Understand the security posture of any website in real-time.**
*Passive analysis • AI-powered insights • Zero data collection*

[Features](#features) • [Quick Start](#quick-start) • [Testing](#-automated-testing) • [Documentation](#documentation) • [Contributing](#contributing)

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

### 🔄 Real-time Extension-to-Dashboard Sync
Scan results collected by the browser extension are immediately transmitted to the local backend and dynamically updated on your open dashboard via live API polling, updating all charts, metrics, and risk scores on the fly.

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

### Server Setup (Choose Node.js, Docker, or PowerShell Fallback)

#### Option A: Node.js (Recommended)
1. Install dependencies inside `server` directory:
   ```bash
   cd server
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open `http://localhost:3000/dashboard.html` in your browser.

#### Option B: Docker Compose
If you prefer running inside Docker:
```bash
docker compose up --build -d
```
The server will bind to `http://localhost:3000` (or `3001` based on your setup).

#### Option C: Native Windows PowerShell Fallback
If you don't have Node.js or Docker installed globally:
1. Open PowerShell.
2. Run the native HTTP listener script:
   ```powershell
   powershell -ExecutionPolicy Bypass -File server/start_server.ps1
   ```
3. This boots up a lightweight local listener on port `3000` without Node runtime dependencies.

### 🖥️ How to Use

1. **Open the Dashboard**: Navigate to `http://localhost:3000/dashboard.html` in your browser.
2. **Navigate to Target Website**: Go to any page you want to analyze (e.g., `https://github.com`) in the Chrome window where the extension is active.
3. **Trigger Scan**:
   - Click the **SurfaceQ shield** icon in the toolbar.
   - Click **Scan Website**.
   - The extension will analyze HTTP response headers, tech signatures, and security controls, displaying results inside the popup window.
4. **View Live Updates**: Your active dashboard at `http://localhost:3000/dashboard.html` will instantly sync with the scan payload, updating the risk score, vulnerabilities ledger, asset statistics, and the AI chatbot guidelines!

---

## 🧪 Automated Testing

We use **Playwright** for end-to-end integration audits. The test script verifies extension loading, target page navigation, passive header capture, and live backend dashboard syncing.

To run the automated tests:
1. Install dependencies inside the `server/` directory:
   ```bash
   cd server
   npm install playwright
   npx playwright install chromium
   ```
2. Run the test runner script:
   ```bash
   node test_extension.js
   ```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Extension** | JavaScript | Core extension logic and content scripts |
| **Extension** | Chrome Extension APIs | Browser integration, tab management, web requests |
| **Extension** | HTML/CSS | Popup UI and extension pages |
| **Backend** | Node.js / Express | Server runtime environment & REST API framework |
| **Fallback Host** | PowerShell Script | Native HTTP listener for lightweight hosting |
| **AI** | Google Gemini AI | Intelligent risk assessment and threat analysis |
| **Visualization** | Chart.js | Interactive charts and risk score gauges (hosted locally offline) |
| **E2E Automation** | Playwright | Browser simulation and integration validation |

## 🏗️ Architecture

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

## 📄 License

SurfaceQ is released under the [MIT License](LICENSE).
