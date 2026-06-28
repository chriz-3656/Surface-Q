# SurfaceQ API Reference

Complete reference for the SurfaceQ REST API. All endpoints return JSON responses and follow RESTful conventions.

---

## Overview

The SurfaceQ API provides programmatic access to the security analysis engine. It accepts JSON request bodies and returns JSON responses for all endpoints.

| Property | Value |
|----------|-------|
| **Protocol** | HTTP/HTTPS |
| **Format** | JSON |
| **Encoding** | UTF-8 |
| **Authentication** | API Key (header-based) |

---

## Base URL

```
http://localhost:3001/api
```

For production deployments, replace with your configured domain:

```
https://your-domain.com/api
```

---

## Authentication

All API endpoints (except `/health`) require authentication via the `X-API-Key` header.

### Request Header

```
X-API-Key: your-api-key-here
```

### Example

```bash
curl -H "X-API-Key: sk-surfaceq-abc123def456" \
  http://localhost:3001/api/history
```

### Authentication Errors

If the API key is missing or invalid, the server responds with:

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": 401,
    "message": "Invalid or missing API key. Provide a valid key via the X-API-Key header."
  }
}
```

---

## Endpoints

### 1. Analyze URL

Initiate a comprehensive security analysis of the specified URL.

```
POST /api/analyze
```

#### Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | The full URL to analyze (must include protocol) |

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-surfaceq-abc123def456" \
  -d '{
    "url": "https://chriz-3656.github.io"
  }'
```

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 42,
    "url": "https://chriz-3656.github.io",
    "domain": "chriz-3656.github.io",
    "timestamp": "2025-01-15T10:30:00.000Z",
    "scanDuration": 3200,
    "riskScore": 35.5,
    "riskLevel": "medium",
    "status": "completed",
    "headers": {
      "analyzed": 12,
      "present": 8,
      "missing": 4,
      "items": [
        {
          "name": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'",
          "status": "misconfigured",
          "recommendation": "Remove 'unsafe-inline' from script-src directive to prevent inline script injection attacks."
        },
        {
          "name": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload",
          "status": "present",
          "recommendation": null
        },
        {
          "name": "X-Frame-Options",
          "value": "DENY",
          "status": "present",
          "recommendation": null
        },
        {
          "name": "X-Content-Type-Options",
          "value": "nosniff",
          "status": "present",
          "recommendation": null
        },
        {
          "name": "Permissions-Policy",
          "value": null,
          "status": "missing",
          "recommendation": "Add a Permissions-Policy header to control browser feature access. Example: camera=(), microphone=(), geolocation=()"
        },
        {
          "name": "X-XSS-Protection",
          "value": null,
          "status": "missing",
          "recommendation": "While deprecated in modern browsers, add 'X-XSS-Protection: 0' to explicitly disable the XSS auditor and rely on CSP instead."
        }
      ]
    },
    "technologies": [
      {
        "name": "Nginx",
        "category": "server",
        "version": "1.24.0",
        "confidence": 0.95
      },
      {
        "name": "Cloudflare",
        "category": "cdn",
        "version": null,
        "confidence": 0.90
      },
      {
        "name": "React",
        "category": "framework",
        "version": "18.2.0",
        "confidence": 0.85
      }
    ],
    "dns": {
      "records": [
        {
          "type": "A",
          "value": "93.184.216.34",
          "ttl": 3600
        },
        {
          "type": "AAAA",
          "value": "2606:2800:220:1:248:1893:25c8:1946",
          "ttl": 3600
        },
        {
          "type": "MX",
          "value": "0 chriz-3656.github.io",
          "ttl": 86400
        },
        {
          "type": "TXT",
          "value": "v=spf1 -all",
          "ttl": 86400
        },
        {
          "type": "NS",
          "value": "a.iana-servers.net",
          "ttl": 172800
        }
      ]
    },
    "ssl": {
      "valid": true,
      "issuer": "DigiCert Global G2 TLS RSA SHA256 2020 CA1",
      "subject": "*.chriz-3656.github.io",
      "validFrom": "2024-01-30T00:00:00.000Z",
      "validTo": "2025-03-01T23:59:59.000Z",
      "daysRemaining": 45,
      "protocol": "TLSv1.3",
      "cipher": "TLS_AES_256_GCM_SHA384",
      "keySize": 2048,
      "selfSigned": false,
      "expired": false
    },
    "aiAnalysis": {
      "summary": "The site demonstrates good baseline security posture with HSTS and X-Frame-Options properly configured. However, the Content Security Policy contains 'unsafe-inline' which weakens XSS protections, and several recommended headers are missing.",
      "vulnerabilities": [
        {
          "severity": "medium",
          "title": "Weak Content Security Policy",
          "description": "The CSP includes 'unsafe-inline' in the script-src directive, allowing inline scripts that could be exploited in XSS attacks.",
          "remediation": "Replace 'unsafe-inline' with nonce-based or hash-based script allowlisting."
        },
        {
          "severity": "low",
          "title": "Missing Permissions-Policy Header",
          "description": "No Permissions-Policy header restricts access to sensitive browser APIs.",
          "remediation": "Add Permissions-Policy: camera=(), microphone=(), geolocation=() to restrict unnecessary API access."
        }
      ],
      "recommendations": [
        "Strengthen the Content Security Policy by removing 'unsafe-inline' and implementing nonce-based script loading.",
        "Add a Permissions-Policy header to restrict access to sensitive browser features.",
        "Implement Subresource Integrity (SRI) for externally loaded scripts and stylesheets.",
        "Consider adding a Report-To header to collect CSP violation reports."
      ],
      "threatLevel": "medium"
    }
  }
}
```

#### Error `400 Bad Request`

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Invalid URL format. Provide a valid URL with protocol (http:// or https://)."
  }
}
```

---

### 2. Get Scan History

Retrieve a paginated list of previous scan results.

```
GET /api/history
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | `20` | Number of results per page (max: 100) |
| `offset` | integer | `0` | Number of results to skip |
| `domain` | string | — | Filter by domain name |
| `sort` | string | `desc` | Sort order by timestamp: `asc` or `desc` |

#### Request

```bash
curl -H "X-API-Key: sk-surfaceq-abc123def456" \
  "http://localhost:3001/api/history?limit=10&offset=0&domain=chriz-3656.github.io&sort=desc"
```

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "scans": [
      {
        "id": 42,
        "url": "https://chriz-3656.github.io",
        "domain": "chriz-3656.github.io",
        "timestamp": "2025-01-15T10:30:00.000Z",
        "riskScore": 35.5,
        "riskLevel": "medium",
        "status": "completed"
      },
      {
        "id": 38,
        "url": "https://chriz-3656.github.io/login",
        "domain": "chriz-3656.github.io",
        "timestamp": "2025-01-14T08:15:00.000Z",
        "riskScore": 52.0,
        "riskLevel": "high",
        "status": "completed"
      }
    ],
    "pagination": {
      "total": 47,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### 3. Get Scan by ID

Retrieve the complete results of a specific scan.

```
GET /api/scans/:id
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | The scan ID |

#### Request

```bash
curl -H "X-API-Key: sk-surfaceq-abc123def456" \
  http://localhost:3001/api/scans/42
```

#### Response `200 OK`

Returns the same full scan object as the [Analyze URL](#1-analyze-url) endpoint response, including all headers, technologies, DNS records, SSL info, and AI analysis.

```json
{
  "success": true,
  "data": {
    "id": 42,
    "url": "https://chriz-3656.github.io",
    "domain": "chriz-3656.github.io",
    "timestamp": "2025-01-15T10:30:00.000Z",
    "riskScore": 35.5,
    "riskLevel": "medium",
    "status": "completed",
    "headers": { "..." : "..." },
    "technologies": [ "..." ],
    "dns": { "..." : "..." },
    "ssl": { "..." : "..." },
    "aiAnalysis": { "..." : "..." }
  }
}
```

#### Error `404 Not Found`

```json
{
  "success": false,
  "error": {
    "code": 404,
    "message": "Scan with ID 42 not found."
  }
}
```

---

### 4. Delete Scan

Permanently delete a scan and all associated records (headers, technologies, DNS records).

```
DELETE /api/scans/:id
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | The scan ID to delete |

#### Request

```bash
curl -X DELETE \
  -H "X-API-Key: sk-surfaceq-abc123def456" \
  http://localhost:3001/api/scans/42
```

#### Response `200 OK`

```json
{
  "success": true,
  "message": "Scan 42 and all associated records have been successfully deleted."
}
```

#### Error `404 Not Found`

```json
{
  "success": false,
  "error": {
    "code": 404,
    "message": "Scan with ID 42 not found."
  }
}
```

---

### 5. AI Analysis

Request an AI-powered security assessment for an existing scan using Google Gemini.

```
POST /api/ai/analyze
```

#### Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scanId` | integer | Yes | The ID of a completed scan to analyze |

```bash
curl -X POST http://localhost:3001/api/ai/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-surfaceq-abc123def456" \
  -d '{
    "scanId": 42
  }'
```

#### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "scanId": 42,
    "summary": "The analyzed website demonstrates a moderate security posture. While core transport security is properly implemented with HSTS and TLSv1.3, several gaps in header configuration and content security policy leave the site vulnerable to certain client-side attacks. The technology stack (Nginx, React, Cloudflare) is modern but reveals version information that could assist targeted attacks.",
    "vulnerabilities": [
      {
        "severity": "high",
        "title": "Content Security Policy Bypass Risk",
        "description": "The current CSP includes 'unsafe-inline' in the script-src directive. This effectively negates much of the protection CSP provides against cross-site scripting (XSS) attacks, as it allows arbitrary inline scripts to execute.",
        "remediation": "Implement nonce-based CSP: generate a unique nonce per request, add it to the CSP header (script-src 'nonce-{random}'), and include the nonce attribute on all legitimate script tags."
      },
      {
        "severity": "medium",
        "title": "Server Version Disclosure",
        "description": "The Nginx server header reveals version 1.24.0, providing attackers with specific version information to search for known vulnerabilities.",
        "remediation": "Configure 'server_tokens off;' in nginx.conf to suppress version information in response headers."
      },
      {
        "severity": "low",
        "title": "Missing Feature Policy Controls",
        "description": "No Permissions-Policy header is set, allowing the page to access sensitive browser APIs like camera, microphone, and geolocation by default.",
        "remediation": "Add a restrictive Permissions-Policy header that disables unused browser features."
      }
    ],
    "recommendations": [
      "Implement a strict Content Security Policy without 'unsafe-inline' or 'unsafe-eval' directives.",
      "Add server_tokens off to Nginx configuration to hide version information.",
      "Deploy a Permissions-Policy header restricting access to camera, microphone, geolocation, and payment APIs.",
      "Add Subresource Integrity (SRI) hashes to all externally loaded scripts and stylesheets.",
      "Configure a Report-To endpoint to collect and monitor CSP violation reports in production.",
      "Implement Certificate Transparency monitoring for the domain to detect unauthorized certificate issuance."
    ],
    "threatLevel": "medium"
  }
}
```

#### Error `404 Not Found`

```json
{
  "success": false,
  "error": {
    "code": 404,
    "message": "Scan with ID 42 not found. Perform a scan first using POST /api/analyze."
  }
}
```

---

### 6. Generate Report

Generate a formatted report for a completed scan.

```
GET /api/reports/:id
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | The scan ID to generate a report for |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `format` | string | `json` | Output format: `json` or `pdf` |

#### Request

```bash
# JSON report
curl -H "X-API-Key: sk-surfaceq-abc123def456" \
  "http://localhost:3001/api/reports/42?format=json"

# PDF report
curl -H "X-API-Key: sk-surfaceq-abc123def456" \
  "http://localhost:3001/api/reports/42?format=pdf" \
  -o report_42.pdf
```

#### Response `200 OK` (JSON)

```json
{
  "success": true,
  "data": {
    "report": {
      "id": 42,
      "generatedAt": "2025-01-15T11:00:00.000Z",
      "format": "json",
      "scan": {
        "url": "https://chriz-3656.github.io",
        "domain": "chriz-3656.github.io",
        "timestamp": "2025-01-15T10:30:00.000Z",
        "riskScore": 35.5,
        "riskLevel": "medium"
      },
      "executiveSummary": "Security analysis of chriz-3656.github.io reveals a moderate risk level with a score of 35.5/100. 8 of 12 recommended security headers are present. 3 technologies were detected. SSL certificate is valid with 45 days remaining.",
      "findings": {
        "headersPresent": 8,
        "headersMissing": 4,
        "technologiesDetected": 3,
        "dnsRecordsFound": 5,
        "sslValid": true,
        "sslDaysRemaining": 45
      },
      "fullResults": { "..." : "..." }
    }
  }
}
```

#### Response `200 OK` (PDF)

Returns a binary PDF file with `Content-Type: application/pdf`.

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="surfaceq_report_42.pdf"
```

---

### 7. Health Check

Check server status and connectivity. This endpoint does **not** require authentication.

```
GET /health
```

#### Request

```bash
curl http://localhost:3001/health
```

#### Response `200 OK`

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Server health status: `healthy` or `unhealthy` |
| `version` | string | SurfaceQ server version from `package.json` |
| `uptime` | number | Server uptime in seconds |
| `timestamp` | string | Current server time in ISO 8601 format |

---

## Rate Limiting

All authenticated endpoints are subject to rate limiting to prevent abuse and ensure fair usage.

### Default Configuration

| Setting | Value |
|---------|-------|
| **Window** | 15 minutes (900,000 ms) |
| **Max Requests** | 100 per window per IP |
| **Algorithm** | Fixed window counter |

### Rate Limit Response Headers

Every API response includes rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1705312200
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in the current window |
| `X-RateLimit-Remaining` | Requests remaining in the current window |
| `X-RateLimit-Reset` | Unix timestamp (seconds) when the rate limit window resets |

### Rate Limit Exceeded

When the rate limit is exceeded, the server responds with:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 300
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705312200

{
  "success": false,
  "error": {
    "code": 429,
    "message": "Rate limit exceeded. Maximum 100 requests per 15 minutes. Try again in 300 seconds."
  }
}
```

---

## Error Response Format

All error responses follow a consistent JSON structure:

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "A human-readable description of what went wrong."
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `false` for error responses |
| `error.code` | integer | HTTP status code |
| `error.message` | string | Human-readable error description |

---

## Status Codes

| Code | Status | Description |
|------|--------|-------------|
| `200` | OK | Request succeeded. Response body contains the requested data. |
| `201` | Created | Resource created successfully (e.g., new scan initiated). |
| `400` | Bad Request | Invalid request parameters or malformed request body. Check the error message for details. |
| `401` | Unauthorized | Missing or invalid API key. Provide a valid key via the `X-API-Key` header. |
| `404` | Not Found | The requested resource (scan, report) does not exist. Verify the ID. |
| `408` | Request Timeout | The scan operation timed out. The target URL may be unreachable or slow to respond. |
| `429` | Too Many Requests | Rate limit exceeded. Wait for the window to reset (see `Retry-After` header). |
| `500` | Internal Server Error | An unexpected server error occurred. Check server logs for details. |

---

## Examples

### Complete Workflow

Here's a typical workflow using the SurfaceQ API:

```bash
# Step 1: Initiate a scan
SCAN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-surfaceq-abc123def456" \
  -d '{"url": "https://chriz-3656.github.io"}')

echo "$SCAN_RESPONSE" | jq '.data.riskScore'
# Output: 35.5

# Step 2: Get the scan ID
SCAN_ID=$(echo "$SCAN_RESPONSE" | jq '.data.id')
# Output: 42

# Step 3: Request AI analysis
curl -s -X POST http://localhost:3001/api/ai/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-surfaceq-abc123def456" \
  -d "{\"scanId\": $SCAN_ID}" | jq '.data.summary'

# Step 4: Generate a report
curl -s -H "X-API-Key: sk-surfaceq-abc123def456" \
  "http://localhost:3001/api/reports/$SCAN_ID?format=json" | jq '.data.report.executiveSummary'

# Step 5: View scan history
curl -s -H "X-API-Key: sk-surfaceq-abc123def456" \
  "http://localhost:3001/api/history?limit=5&sort=desc" | jq '.data.scans[] | {url, riskScore, riskLevel}'
```

### JavaScript (Extension/Browser)

```javascript
const API_BASE = 'http://localhost:3001/api';
const API_KEY = 'sk-surfaceq-abc123def456';

async function analyzeSite(url) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  const result = await response.json();
  return result.data;
}

async function getScanHistory(limit = 20) {
  const response = await fetch(
    `${API_BASE}/history?limit=${limit}&sort=desc`,
    {
      headers: { 'X-API-Key': API_KEY },
    }
  );

  const result = await response.json();
  return result.data;
}
```

### Python

```python
import requests

API_BASE = "http://localhost:3001/api"
HEADERS = {
    "Content-Type": "application/json",
    "X-API-Key": "sk-surfaceq-abc123def456"
}

# Analyze a URL
response = requests.post(
    f"{API_BASE}/analyze",
    json={"url": "https://chriz-3656.github.io"},
    headers=HEADERS
)
scan = response.json()["data"]
print(f"Risk Score: {scan['riskScore']} ({scan['riskLevel']})")

# Get AI analysis
ai_response = requests.post(
    f"{API_BASE}/ai/analyze",
    json={"scanId": scan["id"]},
    headers=HEADERS
)
analysis = ai_response.json()["data"]
print(f"Summary: {analysis['summary']}")
```
