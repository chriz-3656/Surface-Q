# Surface-Q Architecture 🏗️

Surface-Q is built on a decoupled architecture comprising three primary components:
1. **Chrome Extension (Data Collector)**
2. **Node.js Backend (AI Orchestrator)**
3. **Frontend Dashboard (Visualization)**

## High-Level Data Flow

```mermaid
graph TD
    A[Target Website] -->|DOM & Network Data| B[Chrome Extension]
    B -->|POST /api/scans (JSON)| C[Node.js Backend]
    C -->|Format Prompt| D[AI Engine Gemini/Groq]
    D -->|Security Assessment| C
    C -->|Save State & Broadcast| E[Dashboard UI]
    E -->|Polls /api/scans/status| C
```

## 1. Chrome Extension (Manifest V3)
The extension is responsible for passive telemetry collection.
- **Background Service Worker (`background.js`):** Monitors network requests, capturing response headers (CSP, HSTS, etc.) without altering them.
- **Content Script (`content.js`):** Parses the DOM of the active tab. It extracts scripts, forms, meta tags, and inline technologies.
- **Popup (`popup.js`):** The user interface to trigger the scan and toggle between Simple/Expert modes.

## 2. Node.js Backend (`server/index.js`)
The backend acts as the central brain and integration point.
- **State Management:** Holds the `latestScan` and `currentScanStatus` in memory.
- **AI Integration:** Uses `@google/genai` (Gemini) or `groq-sdk` to evaluate the raw JSON telemetry provided by the extension.
- **Endpoints:**
  - `POST /api/scans`: Ingests data from the extension, triggers the AI analysis.
  - `GET /api/scans/latest`: Returns the final AI assessment.
  - `GET /api/scans/status`: Used by the dashboard to show live progress (Idle, Scanning, AI Processing).

## 3. Frontend Dashboard (`dashboard.html`)
A static, vanilla JS frontend enhanced with Tailwind CSS (via CDN) and Chart.js.
- **Live Feed:** Polls `/api/scans/status` every 1.5 seconds until completion to show realtime progress.
- **Dynamic Render:** Parses the AI JSON response to populate charts (Risk Score, Security Headers) and tables.
