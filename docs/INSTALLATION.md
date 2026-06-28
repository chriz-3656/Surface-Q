# SurfaceQ Installation Guide

This guide walks you through setting up the SurfaceQ security analysis platform on your local machine. The setup involves two components: a Chrome browser extension and a Node.js backend server.

---

## Prerequisites

Ensure you have the following installed and available before proceeding:

| Requirement | Minimum Version | Purpose | Installation |
|-------------|----------------|---------|-------------|
| **Node.js** | 18.0+ | Server runtime | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0+ | Package management | Included with Node.js |
| **Chrome / Chromium** | 110+ | Extension host browser | [google.com/chrome](https://www.google.com/chrome/) |
| **Git** | 2.30+ | Source code management | [git-scm.com](https://git-scm.com/) |
| **Google Gemini API Key** | — | AI-powered analysis | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

### Verify Prerequisites

```bash
# Check Node.js version
node --version
# Expected: v18.x.x or higher

# Check npm version
npm --version
# Expected: 9.x.x or higher

# Check Git version
git --version
# Expected: git version 2.30.x or higher

# Check Chrome version (Linux)
google-chrome --version
# or
chromium-browser --version
```

### Obtaining a Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey).
2. Sign in with your Google account.
3. Click **"Create API Key"**.
4. Select or create a Google Cloud project.
5. Copy the generated API key — you'll need it during server configuration.

> **Note:** The free tier provides generous rate limits suitable for development and personal use. See [Gemini API pricing](https://ai.google.dev/pricing) for production usage details.

---

## Extension Installation from Source

### Step 1: Clone the Repository

```bash
git clone https://github.com/chriz-3656/Surface-Q.git
cd Surface-Q
```

### Step 2: Open Chrome Extensions Page

Navigate to the Chrome extensions management page:

```
chrome://extensions
```

You can also access this via **Menu (⋮) → Extensions → Manage Extensions**.

### Step 3: Enable Developer Mode

Toggle the **"Developer mode"** switch in the top-right corner of the extensions page. This enables loading unpacked extensions from your local filesystem.

### Step 4: Load the Extension

1. Click the **"Load unpacked"** button that appears after enabling Developer mode.
2. In the file browser dialog, navigate to the cloned repository.
3. Select the **`extension/`** directory (not the root project directory).
4. Click **"Select Folder"** (or "Open" on some systems).

The SurfaceQ extension should now appear in your extensions list with its icon and name.

### Step 5: Pin the Extension

1. Click the **puzzle piece icon** (🧩) in Chrome's toolbar to open the extensions menu.
2. Find **SurfaceQ** in the list.
3. Click the **pin icon** (📌) next to it.

The SurfaceQ icon will now be permanently visible in your toolbar for quick access.

### Verifying Extension Installation

After loading the extension:
- The SurfaceQ icon should appear in the Chrome toolbar (or extensions menu).
- Clicking the icon should open the popup interface.
- The popup should display the SurfaceQ logo and a "Scan" button.
- Check `chrome://extensions` to confirm there are no error badges on the extension card.

---

## Server Setup

### Step 1: Navigate to Server Directory

```bash
cd server
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required Node.js packages including Express, better-sqlite3, and other dependencies. The installation typically takes 30–60 seconds.

### Step 3: Configure Environment Variables

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Open `.env` in your preferred editor and configure the required values:

```bash
# Open with your preferred editor
nano .env
# or
code .env
# or
vim .env
```

At minimum, you must set the Gemini API key:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (defaults shown)
PORT=3001
NODE_ENV=development
API_KEY=your_api_key_for_extension_auth
CORS_ORIGIN=chrome-extension://your-extension-id
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DB_PATH=./data/surfaceq.db
LOG_LEVEL=info
```

### Step 4: Start the Server

```bash
npm start
```

You should see output similar to:

```
[INFO] SurfaceQ server starting...
[INFO] Database initialized at ./data/surfaceq.db
[INFO] Server listening on http://localhost:3001
[INFO] Environment: development
```

### Step 5: Verify Server is Running

Test the health endpoint:

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 5,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Development Mode

For development with auto-restart on file changes:

```bash
npm run dev
```

This uses `nodemon` to watch for file changes and automatically restart the server.

---

## Docker Setup

Docker provides a containerized deployment option that eliminates the need to install Node.js locally.

### Prerequisites

- **Docker** 20.10+ — [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** 2.0+ — Included with Docker Desktop, or [install separately](https://docs.docker.com/compose/install/)

### Step 1: Configure Environment

```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your configuration (see [Environment Configuration](#environment-configuration) below).

### Step 2: Build and Start Containers

From the project root directory:

```bash
docker-compose up -d
```

This command will:
1. Build the Node.js server image from the Dockerfile.
2. Start the container in detached mode.
3. Mount the SQLite database directory as a persistent volume.
4. Expose port 3001 on your host machine.

### Step 3: Verify Container is Running

```bash
# Check container status
docker-compose ps

# Check server health
curl http://localhost:3001/health

# View server logs
docker-compose logs -f surfaceq-server
```

### Managing the Docker Container

```bash
# Stop the server
docker-compose down

# Restart the server
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build

# View real-time logs
docker-compose logs -f
```

---

## Environment Configuration

The following environment variables control the behavior of the SurfaceQ server:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | HTTP port the server listens on | `3001` | No |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` | No |
| `GEMINI_API_KEY` | Google Gemini API key for AI-powered analysis | — | **Yes** |
| `API_KEY` | API key for authenticating extension requests | — | Recommended |
| `CORS_ORIGIN` | Allowed CORS origin(s) for API requests | `*` | Recommended |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting time window in milliseconds | `900000` (15 min) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Maximum requests per rate limit window | `100` | No |
| `DB_PATH` | Path to the SQLite database file | `./data/surfaceq.db` | No |
| `LOG_LEVEL` | Logging verbosity (`error`, `warn`, `info`, `debug`) | `info` | No |

### Variable Details

- **`GEMINI_API_KEY`**: Obtain this from [Google AI Studio](https://aistudio.google.com/apikey). This is the only strictly required variable — the server will not start without it.
- **`API_KEY`**: Used to authenticate requests from the browser extension. Set this to a strong random string and configure the same value in the extension settings. If not set, API authentication is disabled (not recommended for production).
- **`CORS_ORIGIN`**: Set this to your Chrome extension's origin (`chrome-extension://<extension-id>`) to restrict API access. Find your extension ID on `chrome://extensions`. Use comma-separated values for multiple origins.
- **`DB_PATH`**: The SQLite database file is created automatically if it doesn't exist. The directory must be writable by the server process.

---

## Verification Steps

After completing both the extension and server setup, verify the full system is working:

### 1. Health Endpoint Check

```bash
curl http://localhost:3001/health
```

Confirm you receive a JSON response with `"status": "healthy"`.

### 2. Extension Loads Correctly

1. Open Chrome and click the SurfaceQ icon in the toolbar.
2. The popup should open without errors.
3. Open Chrome DevTools (`Ctrl+Shift+I`) → Console to check for any error messages.
4. Navigate to `chrome://extensions` and verify no error badges appear on the SurfaceQ card.

### 3. Test Scan

1. Navigate to any website (e.g., `https://chriz-3656.github.io`).
2. Click the SurfaceQ extension icon.
3. Click the **"Scan"** button.
4. The scan should complete within 5–15 seconds.
5. Results should display including:
   - Risk score and risk level
   - Security headers analysis
   - Detected technologies
   - AI-powered assessment

### 4. Dashboard Verification

1. In the extension popup, click **"Dashboard"** or **"View History"**.
2. The dashboard should open in a new tab.
3. Your test scan should appear in the history list.

---

## Troubleshooting

### CORS Errors

**Symptom:** Console shows `Access to fetch has been blocked by CORS policy` errors.

**Solutions:**
1. Ensure the `CORS_ORIGIN` environment variable includes your extension's origin.
2. Find your extension ID at `chrome://extensions` (displayed under the extension name).
3. Set `CORS_ORIGIN=chrome-extension://<your-extension-id>` in your `.env` file.
4. For development, you can temporarily set `CORS_ORIGIN=*` (not recommended for production).
5. Restart the server after changing environment variables.

```bash
# Find your extension ID and update .env
CORS_ORIGIN=chrome-extension://abcdefghijklmnopqrstuvwxyz
```

### Extension Not Loading

**Symptom:** "Load unpacked" fails or the extension shows an error badge.

**Solutions:**
1. Ensure you selected the `extension/` subdirectory, not the project root.
2. Verify `manifest.json` exists inside the selected directory.
3. Check that Developer Mode is enabled on `chrome://extensions`.
4. Look at the error details by clicking the "Errors" button on the extension card.
5. If you see a "Service worker registration failed" error, ensure `background.js` exists and has no syntax errors.
6. Try removing the extension and reloading it.

```bash
# Validate manifest.json is valid JSON
cat extension/manifest.json | python3 -m json.tool
```

### Server Won't Start

**Symptom:** `npm start` fails or the server crashes immediately.

**Solutions:**
1. **Missing `.env` file:** Ensure you copied `.env.example` to `.env` and set `GEMINI_API_KEY`.
   ```bash
   cp .env.example .env
   ```
2. **Port already in use:** Another process is using port 3001.
   ```bash
   # Find the process using port 3001
   lsof -i :3001
   # Kill it or change PORT in .env
   ```
3. **Node.js version too old:** SurfaceQ requires Node.js 18+.
   ```bash
   node --version
   # If below 18, upgrade Node.js
   ```
4. **Missing dependencies:** Run `npm install` in the `server/` directory.
   ```bash
   cd server && npm install
   ```
5. **better-sqlite3 build failure:** This native module requires build tools.
   ```bash
   # Ubuntu/Debian
   sudo apt-get install build-essential python3
   # macOS
   xcode-select --install
   # Then retry
   npm install
   ```

### Database Errors

**Symptom:** "SQLITE_CANTOPEN" or "database is locked" errors.

**Solutions:**
1. **Database directory doesn't exist:** The server creates it automatically, but verify the parent directory is writable.
   ```bash
   mkdir -p server/data
   chmod 755 server/data
   ```
2. **Permission denied:** Ensure the server process has write access to the database path.
   ```bash
   ls -la server/data/
   ```
3. **Corrupted database:** Delete the database file and restart — it will be recreated with a fresh schema.
   ```bash
   rm server/data/surfaceq.db
   npm start
   ```
4. **Database locked:** This usually occurs when multiple processes access the same database file. Ensure only one server instance is running.

### API Key Issues

**Symptom:** AI analysis returns errors or empty results.

**Solutions:**
1. **Invalid API key:** Verify your Gemini API key is correct and active.
   ```bash
   # Test the API key directly
   curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY"
   ```
2. **Key not set:** Ensure `GEMINI_API_KEY` is defined in your `.env` file (no quotes around the value).
3. **Rate limited:** The free tier has rate limits. Wait a few minutes and try again, or check your usage at [Google AI Studio](https://aistudio.google.com/).
4. **API not enabled:** Ensure the Generative Language API is enabled in your Google Cloud project.
5. **Billing issues:** Some API features require a billing account. Check your Google Cloud console.

---

## Next Steps

Once installation is verified:

- Read the [Architecture Documentation](./ARCHITECTURE.md) to understand the system design.
- Review the [API Documentation](./API.md) for endpoint details.
- Check the [Developer Guide](./DEVELOPER.md) for contributing guidelines.
- See the [Deployment Guide](./DEPLOYMENT.md) for production setup instructions.
