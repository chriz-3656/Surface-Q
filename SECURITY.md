# Security Policy

## 🛡️ Our Commitment

The SurfaceQ team takes security seriously. As a security analysis tool, we hold ourselves to the highest standards when it comes to protecting our users' data and maintaining the integrity of our software. We are committed to addressing security vulnerabilities promptly and transparently.

This document outlines our security practices, vulnerability reporting process, and data handling policies.

## 📋 Supported Versions

The following versions of SurfaceQ are currently supported with security updates:

| Version | Status | Support |
|---------|--------|---------|
| 1.0.x | ✅ Current Release | Full security support |
| < 1.0.0 | ❌ Pre-release | No security support |

We strongly recommend always running the latest version of SurfaceQ to benefit from the most recent security patches and improvements.

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability in SurfaceQ, we appreciate your help in disclosing it responsibly.

### How to Report

1. **Email**: Send a detailed report to **[chrizmonsaji@gmail.com](mailto:chrizmonsaji@gmail.com)**
2. **Subject line**: Include `[SECURITY]` in the subject for priority handling
3. **Do NOT** open a public GitHub issue for security vulnerabilities

### What to Include

Please provide as much of the following information as possible:

- **Description** of the vulnerability and its potential impact
- **Steps to reproduce** the issue, including any specific configurations
- **Affected component** (extension, server, database, API, dashboard)
- **Affected version(s)** of SurfaceQ
- **Proof of concept** code or screenshots, if available
- **Suggested fix**, if you have one in mind
- **Your contact information** for follow-up communication

### Our Response Timeline

| Action | Timeline |
|--------|----------|
| Acknowledgment of report | Within **48 hours** |
| Initial assessment and severity classification | Within **72 hours** |
| Status update with remediation plan | Within **7 days** |
| Patch release for critical vulnerabilities | Within **14 days** |
| Public disclosure (coordinated with reporter) | After patch release |

### Responsible Disclosure

We follow a responsible disclosure process:

1. Reporter submits vulnerability details privately via email
2. Our team acknowledges receipt and begins investigation
3. We work with the reporter to understand and validate the issue
4. A fix is developed, tested, and prepared for release
5. The fix is released and the reporter is credited (unless they prefer anonymity)
6. A security advisory is published after users have had time to update

We kindly ask that you:
- **Do not** publicly disclose the vulnerability until we have released a fix
- **Do not** exploit the vulnerability beyond what is necessary to demonstrate it
- **Do not** access, modify, or delete data belonging to other users
- **Do** act in good faith to avoid privacy violations and data destruction

## 📊 Data Collection Policy

### ✅ What IS Collected and Stored

SurfaceQ analyzes and stores the following **publicly available** technical metadata:

| Data Type | Description | Storage |
|-----------|-------------|---------|
| **HTTP Security Headers** | Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, and other security-relevant response headers | Local SQLite |
| **SSL/TLS Certificate Details** | Certificate issuer, subject, validity period, protocol version, cipher suite, key exchange algorithm, certificate chain length | Local SQLite |
| **DNS Records** | A, AAAA, MX, TXT, CNAME, NS records; DMARC policy; SPF records; DNSSEC validation status | Local SQLite |
| **Technology Fingerprints** | Detected frameworks, libraries, CMS platforms, server software, CDN providers, and analytics tools identified through client-side inspection | Local SQLite |
| **Risk Scores** | Computed risk scores, severity ratings, and AI-generated assessment summaries | Local SQLite |
| **Domain/URL** | The domain name and URL path of analyzed websites | Local SQLite |

### ❌ What is NEVER Collected

SurfaceQ **does not** collect, store, transmit, or access any of the following:

| Data Type | Guarantee |
|-----------|-----------|
| **Passwords** | Never intercepted, read, or stored |
| **Form Data** | No access to form inputs, submissions, or autofill data |
| **Cookies** | No reading, writing, or transmission of browser cookies |
| **Session Tokens** | No access to authentication tokens or session identifiers |
| **Personally Identifiable Information (PII)** | No collection of names, emails, addresses, or any PII |
| **Browsing History** | No tracking of navigation patterns or visited URLs beyond active analysis |
| **Keystrokes** | No keylogging or input monitoring of any kind |
| **Clipboard Content** | No access to clipboard data |
| **File System** | No reading or writing to the local file system beyond the SQLite database |
| **Camera/Microphone** | No access to media devices |
| **Location Data** | No access to geolocation services |

## 🏗️ Privacy Architecture

SurfaceQ's architecture is designed with privacy as a foundational principle:

### Passive Analysis Only
All data collection is **purely passive**. SurfaceQ inspects data that the browser has already received during normal page loads (HTTP response headers, page content for technology detection). It does **not** send additional requests to target websites, perform port scans, or probe for vulnerabilities.

### Local SQLite Storage
All analysis results are stored in a **local SQLite database** on the user's machine. The database file is located at the path specified in the `.env` configuration (default: `./data/surfaceq.db`). No data is synced to any cloud service, remote server, or third-party platform.

### No Telemetry
SurfaceQ includes **zero telemetry**. There are no analytics trackers, no usage metrics collection, no crash reporters, and no phone-home mechanisms of any kind. Your usage of SurfaceQ is entirely private.

### Server-Side API Keys
API keys for external services (Google Gemini AI) are stored **exclusively on the server side** in environment variables. They are never exposed to the browser extension, never included in client-side code, and never transmitted to the frontend.

### Minimal Permissions
The Chrome extension requests only the **minimum permissions** necessary for its functionality. Each permission is documented and justified in the extension manifest.

## 🔒 Encryption & Secrets Management

### HTTPS Communication
All communication between the browser extension and the backend server should use **HTTPS** in production deployments. The development server runs on HTTP by default for local development convenience, but production deployments must be configured with TLS certificates.

### Environment Variables
All sensitive configuration values (API keys, database paths, server credentials) are stored in **environment variables** via the `.env` file. This file:
- Is listed in `.gitignore` and is **never committed to version control**
- Should have restrictive file permissions (`chmod 600 .env`)
- Should be backed up securely and separately from the codebase

### Database Security
The SQLite database file should be:
- Stored in a directory with restrictive permissions
- Excluded from any backup or sync services that transmit data externally
- Deleted securely when no longer needed

## 🛡️ Security Best Practices for Deployment

### Server Hardening

1. **Run behind a reverse proxy** (nginx, Caddy) with TLS termination
2. **Enable HTTPS** with a valid TLS certificate (Let's Encrypt recommended)
3. **Set restrictive CORS headers** to limit API access to the extension origin
4. **Use a firewall** to restrict access to the server port (default: 3000)
5. **Run as a non-root user** with minimal system permissions
6. **Keep dependencies updated** — run `npm audit` regularly

### Extension Security

1. **Install only from trusted sources** — use the official repository
2. **Review permissions** before enabling the extension
3. **Keep Chrome updated** to the latest stable version
4. **Disable the extension** when not actively using it

### API Key Protection

1. **Never share your Gemini API key** publicly or in version control
2. **Rotate keys periodically** and revoke unused keys
3. **Set API key restrictions** in Google Cloud Console (IP restrictions, API restrictions)
4. **Monitor API usage** for unexpected spikes that may indicate key compromise

### Network Security

1. **Use a trusted network** when running the SurfaceQ server
2. **Bind the server to localhost** (`127.0.0.1`) if only local access is needed
3. **Implement rate limiting** on API endpoints to prevent abuse
4. **Log and monitor** server access for suspicious activity

---

<div align="center">

**Security is a shared responsibility. Thank you for helping keep SurfaceQ safe. 🛡️**

</div>
