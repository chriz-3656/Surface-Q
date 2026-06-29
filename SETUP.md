# Installation & Setup Guide 🛠️

Follow these instructions to get Surface-Q running locally on your machine.

## Prerequisites
- **Node.js** (v18 or higher recommended)
- **NPM** or **Yarn**
- **Google Chrome** (For the Manifest V3 Extension)
- **API Key** for Google Gemini (or Groq)

## 1. Clone the Repository
```bash
git clone https://github.com/chriz-3656/Surface-Q.git
cd Surface-Q
```

## 2. Backend Setup
The backend orchestrates the AI analysis.

1. Navigate to the root directory (where `package.json` is located).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment file:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` and add your API Keys:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_key_here
   GROQ_API_KEY=your_groq_key_here
   ```
5. Start the server:
   ```bash
   npm start
   # Or for development: node server/index.js
   ```
   The server will run on `http://localhost:3000`.

## 3. Chrome Extension Setup
The extension is used to capture passive telemetry.

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right).
3. Click **Load unpacked**.
4. Select the `extension/` folder inside the Surface-Q repository.
5. The Surface-Q icon will now appear in your Chrome toolbar.

## 4. Launching the Dashboard
1. Ensure the Node.js backend is running.
2. Open your browser and navigate to:
   ```text
   http://localhost:3000/dashboard.html
   ```
3. Navigate to a target website in another tab, click the Surface-Q extension, and press **Scan Website**.
4. The dashboard will automatically update with the live telemetry and final AI results!
