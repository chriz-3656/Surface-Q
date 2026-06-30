# Phase 1: Project Audit - Surface-Q

## Overview
This audit covers the current state of Surface-Q, evaluating the Frontend, Dashboard, Browser Extension, Backend API, AI pipeline, PDF generation, Documentation, and overall architectural patterns.

## 1. Frontend & Dashboard (`dashboard.html`, `index.html`, `components/`)
- **Performance:** 
  - Usage of `cdn.tailwindcss.com` in production for Tailwind CSS (explicitly suppressed via a hack script in `dashboard.html`). This is heavily detrimental to performance and should be replaced with a compiled CSS bundle via Tailwind CLI.
  - Multiple external CDN scripts (Chart.js, Fonts) which block rendering.
- **Accessibility:** 
  - `<canvas>` elements for Chart.js lack `aria-label` or fallback content for screen readers.
  - Interactive elements inside web components need keyboard navigation checks.
- **Responsiveness:**
  - Chart containers have fixed inline heights (`style="height: 320px;"`), which may cause overflow issues on smaller viewports.
- **UX Inconsistencies:** 
  - The UI relies on `localStorage.getItem('userMode')` for simple/expert mode toggling, but state synchronization with the actual UI toggle may be disconnected.
  - "View All" findings link (`findings.html`) is present, but it's unclear if the page exists or is populated dynamically.
- **Security:**
  - `innerHTML` or string concatenation in web components could expose the UI to DOM-based XSS if scan data is unescaped.

## 2. Browser Extension (`extension/`)
- **Memory Leak (Performance):** `background.js` caches HTTP response headers globally in `headerCache` by hostname without any TTL, LRU eviction, or cleanup mechanism. This will bloat memory over time.
- **Configuration (UX / Dead Code):** The `fetch` call in `background.js` hardcodes `http://localhost:3000/api/scans`. The extension cannot operate in a real-world environment without a configurable backend URL.
- **Security Issues:** The extension has `<all_urls>` permissions and sends sensitive structural data to a local server without authentication.

## 3. Backend & API (`server/index.js`)
- **Concurrency & State Management (Critical Security / Logic Issue):** `latestScan` and `currentScanStatus` are stored as global variables in `server/index.js`. If multiple users or tabs trigger scans simultaneously, their data will overwrite each other. 
- **Missing Validations:** `POST /api/scans` takes `req.body` directly and passes it to the AI prompt without any schema validation (e.g., Zod or Joi), making the application fragile to malformed payloads.
- **Missing Error Handling:** 
  - In `generateAIAssessment`, the Groq fallback `fetch` block does not throw or catch errors properly if the response is not `ok`, it simply falls through or fails silently.
  - `POST /api/chat` exposes raw error messages (`err.message`) in 500 responses.
- **Dead Code:** `POST /api/analyze` appears to be a mock fallback endpoint that may no longer be utilized by the primary frontend flow.

## 4. AI Pipeline
- **Security (Prompt Injection):** The system prompt in `generateAIAssessment` blindly injects `${scan.domain}`, `${scan.url}`, and JSON stringified headers. A malicious target site could construct headers or URLs specifically designed to manipulate the AI's output.
- **Reliability:** The fallback chain (Gemini -> Groq -> Rule-based) is robust, but the parsing of the JSON response from the LLM relies on strict JSON generation without a guaranteed fallback if the LLM wraps the response in Markdown blocks (e.g., ` ```json `), which happens frequently.

## 5. PDF Generation (`server/routes/exportReport.js`)
- **State Coupling:** It relies on `getLatestScanFunc()` passing the global `latestScan` variable. As mentioned, this global state is flawed and can result in exporting a report for the wrong domain if another scan occurs concurrently.
- **Error Handling:** Returns generic 500 errors but Puppeteer failures (e.g., missing dependencies) could crash the server if not strictly isolated.

## 6. Documentation & Unused Assets
- **Documentation:** The project has standard docs (`README.md`, `SECURITY.md`, `DEVELOPER.md`), but lacks API documentation (Swagger/OpenAPI).
- **Unused Assets:** Need deeper tree-shaking to verify if older CSS/JS inside `assets/` or `modules/` is orphaned, especially given the migration to Tailwind utility classes.
