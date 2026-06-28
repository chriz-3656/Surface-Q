# SurfaceQ Developer Guide

This guide provides everything you need to contribute to SurfaceQ, including development environment setup, project architecture, coding conventions, and debugging techniques.

---

## Development Environment

### Recommended IDE: Visual Studio Code

Install the following VS Code extensions for the best development experience:

| Extension | Purpose |
|-----------|---------|
| **ESLint** (`dbaeumer.vscode-eslint`) | JavaScript linting and style enforcement |
| **Prettier** (`esbenp.prettier-vscode`) | Code formatting |
| **Chrome Debugger** (`msjsdiag.debugger-for-chrome`) | Debug extension code directly in VS Code |
| **SQLite Viewer** (`alexcvzz.vscode-sqlite`) | Browse and query the SQLite database |
| **REST Client** (`humao.rest-client`) | Test API endpoints from within VS Code |
| **GitLens** (`eamodio.gitlens`) | Enhanced Git history and blame annotations |
| **Error Lens** (`usernamehw.errorlens`) | Inline error and warning display |

### VS Code Workspace Settings

Create `.vscode/settings.json` in the project root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.workingDirectories": ["server"],
  "files.exclude": {
    "**/node_modules": true,
    "**/.DS_Store": true,
    "server/data/*.db": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "server/data": true
  }
}
```

### Node Version Manager (nvm)

Use `nvm` to manage Node.js versions and ensure consistency across the team:

```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Install and use the required Node.js version
nvm install 18
nvm use 18

# Set as default
nvm alias default 18

# Verify
node --version  # Should output v18.x.x
```

Create an `.nvmrc` file in the project root:

```
18
```

This allows developers to run `nvm use` without specifying a version.

---

## Project Structure

```
Surface-Q/
├── extension/                  # Chrome extension source
│   ├── manifest.json           # Extension manifest (Manifest V3)
│   ├── popup.html              # Popup UI markup
│   ├── popup.js                # Popup logic and event handlers
│   ├── popup.css               # Popup styling
│   ├── background.js           # Service worker (API communication, messaging)
│   ├── content.js              # Content script (page metadata extraction)
│   ├── dashboard.html          # Full-page dashboard markup
│   ├── dashboard.js            # Dashboard logic (history, charts, reports)
│   ├── dashboard.css           # Dashboard styling
│   ├── icons/                  # Extension icons (16, 32, 48, 128px)
│   │   ├── icon-16.png
│   │   ├── icon-32.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   └── utils/                  # Shared extension utilities
│       └── api.js              # API client wrapper
│
├── server/                     # Express.js backend
│   ├── index.js                # Server entry point and middleware setup
│   ├── package.json            # Server dependencies and scripts
│   ├── .env.example            # Environment variable template
│   ├── Dockerfile              # Container build configuration
│   ├── routes/                 # API route handlers
│   │   ├── analyze.js          # POST /api/analyze - scan initiation
│   │   ├── history.js          # GET /api/history - scan history
│   │   ├── scans.js            # GET/DELETE /api/scans/:id - individual scans
│   │   ├── reports.js          # GET /api/reports/:id - report generation
│   │   └── ai.js               # POST /api/ai/analyze - AI analysis
│   ├── services/               # Business logic services
│   │   ├── scanner.js          # Multi-vector security scanning
│   │   ├── ai.js               # Google Gemini API integration
│   │   ├── database.js         # SQLite database operations
│   │   └── report.js           # Report generation and formatting
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # API key authentication
│   │   ├── rateLimiter.js      # Rate limiting configuration
│   │   └── errorHandler.js     # Global error handling
│   ├── utils/                  # Server utilities
│   │   ├── logger.js           # Structured logging
│   │   └── validators.js       # Request validation helpers
│   └── data/                   # Database storage (gitignored)
│       └── surfaceq.db         # SQLite database file
│
├── docs/                       # Project documentation
│   ├── ARCHITECTURE.md         # System architecture and diagrams
│   ├── INSTALLATION.md         # Setup instructions
│   ├── DEPLOYMENT.md           # Production deployment guide
│   ├── DEVELOPER.md            # This file
│   └── API.md                  # API endpoint reference
│
├── docker-compose.yml          # Development Docker configuration
├── docker-compose.prod.yml     # Production Docker configuration
├── .gitignore                  # Git ignore rules
├── LICENSE                     # Project license
└── README.md                   # Project overview and quick start
```

---

## Extension Development

### Manifest V3

SurfaceQ uses Chrome's Manifest V3 specification. Key differences from Manifest V2:

| Feature | Manifest V2 | Manifest V3 (SurfaceQ) |
|---------|------------|----------------------|
| Background | Persistent page | Service worker (event-driven) |
| Remote code | Allowed | Forbidden |
| Content Security | Flexible CSP | Strict CSP enforced |
| Permissions | Broad | Granular, on-demand |

### Manifest Structure

```json
{
  "manifest_version": 3,
  "name": "SurfaceQ",
  "version": "1.0.0",
  "description": "Surface-level security analysis for any website",
  "permissions": ["activeTab", "storage", "tabs"],
  "host_permissions": ["http://localhost:3001/*"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ]
}
```

### Content Security Policy (CSP)

Manifest V3 enforces a strict CSP that prohibits:
- Inline scripts (`<script>` tags with inline code)
- `eval()` and related dynamic code execution
- Loading scripts from external CDNs
- `unsafe-inline` and `unsafe-eval` directives

**Best Practices:**
- Keep all JavaScript in separate `.js` files.
- Use `addEventListener()` instead of inline event handlers.
- Bundle any third-party libraries into local files.

### Extension Messaging

SurfaceQ uses Chrome's messaging API for inter-component communication:

```javascript
// popup.js → background.js: Send a scan request
chrome.runtime.sendMessage(
  { action: 'startScan', url: currentUrl },
  (response) => {
    if (response.success) {
      renderResults(response.data);
    } else {
      showError(response.error);
    }
  }
);
```

```javascript
// background.js: Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startScan') {
    handleScan(message.url)
      .then((data) => sendResponse({ success: true, data }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});
```

```javascript
// background.js → content.js: Request page data
chrome.tabs.sendMessage(
  tabId,
  { action: 'getPageData' },
  (response) => {
    // Process page metadata
  }
);
```

### Chrome Storage API

Use `chrome.storage.local` for persisting extension state:

```javascript
// Save settings
chrome.storage.local.set({
  serverUrl: 'http://localhost:3001',
  apiKey: 'your-api-key',
  theme: 'dark',
  autoScan: false,
});

// Load settings
chrome.storage.local.get(
  ['serverUrl', 'apiKey', 'theme', 'autoScan'],
  (result) => {
    const serverUrl = result.serverUrl || 'http://localhost:3001';
    // Apply settings
  }
);
```

**Storage Limits:**
- `chrome.storage.local`: 10 MB maximum.
- Data is persisted across browser restarts.
- Use `chrome.storage.session` for temporary per-session data.

---

## Backend API Development

### Adding a New Route

1. **Create the route handler** in `server/routes/`:

```javascript
// server/routes/newFeature.js
const express = require('express');
const router = express.Router();
const db = require('../services/database');
const logger = require('../utils/logger');

/**
 * GET /api/new-feature
 * Description of what this endpoint does.
 */
router.get('/', async (req, res, next) => {
  try {
    const results = db.getNewFeatureData();
    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

2. **Register the route** in `server/index.js`:

```javascript
const newFeatureRoutes = require('./routes/newFeature');
app.use('/api/new-feature', authMiddleware, newFeatureRoutes);
```

3. **Test the endpoint:**

```bash
curl -H "X-API-Key: your-key" http://localhost:3001/api/new-feature
```

### Adding a New Service

Services contain business logic and are called by route handlers:

```javascript
// server/services/newService.js

/**
 * NewService handles business logic for the new feature.
 */
class NewService {
  /**
   * Process data for the new feature.
   * @param {string} input - The input to process.
   * @returns {Object} Processed result.
   */
  async process(input) {
    // Validate input
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input: expected a non-empty string');
    }

    // Perform processing
    const result = await this._fetchExternalData(input);
    return this._transformResult(result);
  }

  async _fetchExternalData(input) {
    // External API call or complex computation
  }

  _transformResult(raw) {
    // Transform raw data into the expected output format
  }
}

module.exports = new NewService();
```

### Database Queries

Use the database service for all SQLite interactions:

```javascript
// server/services/database.js

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'surfaceq.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

/**
 * Insert a new scan record.
 * @param {Object} scan - Scan data object.
 * @returns {Object} Inserted record with ID.
 */
function insertScan(scan) {
  const stmt = db.prepare(`
    INSERT INTO scans (url, domain, timestamp, risk_score, risk_level, status, raw_headers, ssl_info, ai_analysis)
    VALUES (@url, @domain, @timestamp, @riskScore, @riskLevel, @status, @rawHeaders, @sslInfo, @aiAnalysis)
  `);

  const result = stmt.run({
    url: scan.url,
    domain: scan.domain,
    timestamp: new Date().toISOString(),
    riskScore: scan.riskScore,
    riskLevel: scan.riskLevel,
    status: scan.status || 'completed',
    rawHeaders: JSON.stringify(scan.headers),
    sslInfo: JSON.stringify(scan.ssl),
    aiAnalysis: JSON.stringify(scan.aiAnalysis),
  });

  return { id: result.lastInsertRowid, ...scan };
}

/**
 * Retrieve a scan by ID with all related records.
 * @param {number} id - Scan ID.
 * @returns {Object|null} Complete scan record or null if not found.
 */
function getScanById(id) {
  const scan = db.prepare('SELECT * FROM scans WHERE id = ?').get(id);
  if (!scan) return null;

  scan.securityHeaders = db.prepare('SELECT * FROM security_headers WHERE scan_id = ?').all(id);
  scan.technologies = db.prepare('SELECT * FROM technologies WHERE scan_id = ?').all(id);
  scan.dnsRecords = db.prepare('SELECT * FROM dns_records WHERE scan_id = ?').all(id);

  return scan;
}

module.exports = { insertScan, getScanById };
```

### Error Handling

All route handlers should use the `next(error)` pattern to delegate errors to the global error handler:

```javascript
// Route handler pattern
router.post('/', async (req, res, next) => {
  try {
    // Business logic that might throw
    const result = await service.process(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error); // Delegate to global error handler
  }
});

// Global error handler (server/middleware/errorHandler.js)
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[${req.method}] ${req.path} - ${statusCode}: ${message}`, {
    stack: err.stack,
    body: req.body,
    params: req.params,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : message,
    },
  });
}
```

---

## Database Management

### Schema Initialization

The database schema is automatically created when the server starts for the first time. The initialization logic lives in the database service:

```javascript
// Schema initialization (runs once on first startup)
db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    risk_score REAL DEFAULT 0,
    risk_level TEXT DEFAULT 'unknown',
    status TEXT DEFAULT 'pending',
    raw_headers TEXT,
    ssl_info TEXT,
    ai_analysis TEXT
  );

  CREATE TABLE IF NOT EXISTS security_headers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id INTEGER NOT NULL,
    header_name TEXT NOT NULL,
    header_value TEXT,
    status TEXT NOT NULL,
    recommendation TEXT,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS technologies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    version TEXT,
    confidence REAL DEFAULT 0,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS dns_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id INTEGER NOT NULL,
    record_type TEXT NOT NULL,
    value TEXT NOT NULL,
    ttl INTEGER DEFAULT 0,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_scans_domain ON scans(domain);
  CREATE INDEX IF NOT EXISTS idx_scans_timestamp ON scans(timestamp);
  CREATE INDEX IF NOT EXISTS idx_security_headers_scan_id ON security_headers(scan_id);
  CREATE INDEX IF NOT EXISTS idx_technologies_scan_id ON technologies(scan_id);
  CREATE INDEX IF NOT EXISTS idx_dns_records_scan_id ON dns_records(scan_id);
`);
```

### Migrations

For schema changes after the initial release, use a versioned migration approach:

```javascript
// server/migrations/001_add_scan_duration.js
module.exports = {
  version: 1,
  description: 'Add scan_duration column to scans table',
  up: (db) => {
    db.exec('ALTER TABLE scans ADD COLUMN scan_duration INTEGER DEFAULT 0');
  },
  down: (db) => {
    // SQLite doesn't support DROP COLUMN directly
    // Requires table recreation for rollback
  },
};
```

Run migrations at server startup:

```javascript
function runMigrations(db) {
  db.exec('CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY, applied_at TEXT)');

  const applied = db.prepare('SELECT version FROM migrations').all().map((r) => r.version);
  const pending = allMigrations.filter((m) => !applied.includes(m.version));

  for (const migration of pending) {
    logger.info(`Running migration ${migration.version}: ${migration.description}`);
    migration.up(db);
    db.prepare('INSERT INTO migrations (version, applied_at) VALUES (?, ?)').run(
      migration.version,
      new Date().toISOString()
    );
  }
}
```

### Backup

See the [Deployment Guide](./DEPLOYMENT.md#backup-strategy) for detailed backup procedures. Quick developer backup:

```bash
# Create a quick backup
cp server/data/surfaceq.db server/data/surfaceq_backup_$(date +%Y%m%d).db

# Restore from backup
cp server/data/surfaceq_backup_20250115.db server/data/surfaceq.db
```

---

## Code Conventions

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | `camelCase.js` | `scannerService.js` |
| Directories | `lowercase` | `routes/`, `services/` |
| Variables | `camelCase` | `riskScore`, `scanResults` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRIES`, `DEFAULT_PORT` |
| Functions | `camelCase` (verb prefix) | `getScanById()`, `calculateRiskScore()` |
| Classes | `PascalCase` | `ScannerService`, `DatabaseManager` |
| CSS Classes | `kebab-case` | `risk-badge`, `scan-result-card` |
| API Endpoints | `kebab-case` | `/api/scan-history`, `/api/ai/analyze` |
| Database Tables | `snake_case` | `security_headers`, `dns_records` |
| Environment Variables | `UPPER_SNAKE_CASE` | `GEMINI_API_KEY`, `DB_PATH` |

### File Organization

- **One concern per file**: Each file should have a single, clear responsibility.
- **Index files**: Use `index.js` only for re-exporting, not for business logic.
- **Relative imports**: Use relative paths (`./`, `../`) within the server package.
- **Group by feature**: When adding major features, group related routes, services, and utilities together.

### Error Handling

```javascript
// DO: Use specific error types with status codes
class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} with ID ${id} not found`);
    this.statusCode = 404;
  }
}

// DO: Always catch and forward errors
router.get('/:id', async (req, res, next) => {
  try {
    const scan = db.getScanById(req.params.id);
    if (!scan) throw new NotFoundError('Scan', req.params.id);
    res.json({ success: true, data: scan });
  } catch (error) {
    next(error);
  }
});

// DON'T: Swallow errors silently
router.get('/:id', async (req, res) => {
  try {
    const scan = db.getScanById(req.params.id);
    res.json(scan);
  } catch (error) {
    // ❌ No logging, no proper response
    res.json({ error: 'Something went wrong' });
  }
});
```

### Async/Await

- **Always use `async/await`** over raw Promises for readability.
- **Never mix** `async/await` with `.then()/.catch()` chains.
- **Always handle rejections**: Use try/catch in async functions or `.catch()` on the returned Promise.

```javascript
// DO: Clean async/await with error handling
async function analyzeSite(url) {
  try {
    const headers = await fetchHeaders(url);
    const ssl = await checkSSL(url);
    const dns = await resolveDNS(url);
    return { headers, ssl, dns };
  } catch (error) {
    logger.error(`Analysis failed for ${url}: ${error.message}`);
    throw error;
  }
}

// DON'T: Mix patterns
async function analyzeSite(url) {
  const headers = await fetchHeaders(url);
  return checkSSL(url).then((ssl) => {  // ❌ Mixing patterns
    return { headers, ssl };
  });
}
```

### Logging

Use the structured logger for all output — never use `console.log` in production code:

```javascript
const logger = require('../utils/logger');

// Levels: error > warn > info > debug
logger.error('Database connection failed', { error: err.message, dbPath });
logger.warn('Rate limit approaching', { ip: req.ip, remaining: 5 });
logger.info('Scan completed', { url, riskScore, duration: '2.3s' });
logger.debug('Raw headers received', { headers: rawHeaders });
```

---

## Debugging

### Chrome DevTools for Extension

#### Popup

1. Right-click the SurfaceQ extension icon → **"Inspect popup"**.
2. This opens DevTools for the popup context.
3. Use the Console, Network, and Sources tabs to debug popup behavior.
4. **Note:** Closing the popup closes DevTools. Keep it open while debugging.

#### Background Service Worker

1. Navigate to `chrome://extensions`.
2. Find SurfaceQ and click **"Service Worker"** under "Inspect views."
3. This opens DevTools for the background service worker.
4. Check the Console for errors and the Network tab for API calls.

#### Content Script

1. Open DevTools on the page where the content script is injected (`F12` or `Ctrl+Shift+I`).
2. Go to the **Console** tab.
3. Select **"SurfaceQ"** from the context dropdown (top-left of Console) to see content script logs.
4. Alternatively, check the **Sources** tab → **Content scripts** to set breakpoints.

### Node.js Inspector for Backend

#### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "program": "${workspaceFolder}/server/index.js",
      "envFile": "${workspaceFolder}/server/.env",
      "console": "integratedTerminal",
      "restart": true
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Server",
      "port": 9229,
      "restart": true
    }
  ]
}
```

#### Command-Line Debugging

```bash
# Start server with inspector
node --inspect server/index.js

# Start server with inspector (break on first line)
node --inspect-brk server/index.js
```

Then open `chrome://inspect` in Chrome and click "inspect" on the Node.js target.

### Common Issues and Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Service worker inactive | Background script stops responding | Service workers are event-driven and go idle. Ensure all operations complete within the event handler. Use `chrome.alarms` for periodic tasks instead of `setInterval`. |
| CORS mismatch | `403 Forbidden` on API calls from extension | Verify `CORS_ORIGIN` in `.env` matches your extension's `chrome-extension://` ID exactly. Check for trailing slashes. |
| SQLite locked | `SQLITE_BUSY` errors | Enable WAL mode (`PRAGMA journal_mode = WAL`). Ensure only one server instance runs at a time. |
| Content script not injected | `chrome.tabs.sendMessage` fails | Reload the page after installing/updating the extension. Check `manifest.json` `matches` patterns. |
| `better-sqlite3` build failure | `npm install` fails on native module | Install build tools: `apt install build-essential python3` (Linux) or `xcode-select --install` (macOS). |
| API timeout | Scans hang or timeout | Check `REQUEST_TIMEOUT_MS` in `.env`. Increase for slow sites. Verify network connectivity from the server. |
| Extension icon missing | Toolbar shows generic puzzle icon | Verify icon files exist at the paths specified in `manifest.json`. Use PNG format with correct dimensions. |

### Testing API Endpoints

Use the REST Client extension for VS Code or `curl`:

```bash
# Test scan endpoint
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"url": "https://chriz-3656.github.io"}'

# Test history endpoint
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3001/api/history?limit=10&sort=desc"

# Test health check (no auth required)
curl http://localhost:3001/health
```

Or create a `.http` file for the REST Client extension:

```http
### Health Check
GET http://localhost:3001/health

### Analyze URL
POST http://localhost:3001/api/analyze
Content-Type: application/json
X-API-Key: your-api-key

{
  "url": "https://chriz-3656.github.io"
}

### Get History
GET http://localhost:3001/api/history?limit=10&sort=desc
X-API-Key: your-api-key
```
