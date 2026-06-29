const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static assets and web component files from the root of the project
app.use('/components', express.static(path.join(__dirname, '../components')));
app.use('/modules', express.static(path.join(__dirname, '../modules')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Serve root static pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard.html'));
});

// In-memory cache for latest scan data
let latestScan = null;

app.post('/api/scans', (req, res) => {
  latestScan = req.body;
  res.json({ status: 'success', message: 'Scan data cached' });
});

app.get('/api/scans/latest', (req, res) => {
  if (!latestScan) {
    return res.status(404).json({ error: 'No scan data available' });
  }
  res.json(latestScan);
});

// Basic API check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SurfaceQ backend is running' });
});

// Mock Scanner analysis endpoint for Dashboard fallback
app.post('/api/analyze', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Returns standard passive metadata response layout
  res.json({
    status: 'success',
    data: {
      url: url,
      domain: new URL(url).hostname,
      title: 'Scan Result for ' + url,
      technologies: ['React', 'Tailwind CSS', 'Cloudflare'],
      forms: [
        { id: 'login', purpose: 'login-or-register', inputCount: 2 }
      ],
      scripts: [
        { src: 'https://cdn.tailwindcss.com', category: 'third-party' }
      ],
      externalResources: { stylesheets: [], images: [], iframes: [] },
      mixedContent: [],
      securityHeaders: [
        { header: 'Content Security Policy (CSP)', status: 'missing', recommendation: 'Enable CSP to prevent XSS attacks.' },
        { header: 'Strict Transport Security (HSTS)', status: 'present', value: 'max-age=31536000' }
      ]
    }
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🛡️  SurfaceQ Server running at http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`==================================================`);
});
