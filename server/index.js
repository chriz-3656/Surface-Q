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

// Groq AI API Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { message, scanContext } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    // Return friendly local model evaluation advice if API key is not configured yet
    return res.json({
      reply: `🛡️ <strong>[SurfaceQ AI - Offline Mode]</strong> Groq API key is not configured.<br><br>
      To enable live LLM threat advisory insights, please add <code>GROQ_API_KEY=your_key</code> inside your server <code>.env</code> file.<br><br>
      <strong>Context Analysis:</strong><br>
      • Scanned Target: <code>${scanContext?.domain || 'None active'}</code><br>
      • Vulnerability Count: <code>${scanContext ? (scanContext.securityHeaders.filter(h => h.status !== 'present').length + scanContext.mixedContent.length) : 0}</code>`
    });
  }

  try {
    const systemPrompt = `You are SurfaceQ AI, a premium cybersecurity attack surface analyst. 
    Analyze the following scanned site context and respond to the user query:
    Domain: ${scanContext?.domain || 'unknown'}
    URL: ${scanContext?.url || 'unknown'}
    Security Headers: ${JSON.stringify(scanContext?.securityHeaders || [])}
    Mixed Content: ${JSON.stringify(scanContext?.mixedContent || [])}
    Technologies: ${JSON.stringify(scanContext?.technologies || [])}
    
    Format responses in clean html syntax with strong markers and bullet points. Focus purely on technical vulnerability mitigation and architectural hardening. Keep responses short and executive.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('Groq API Error:', err);
    res.status(500).json({ error: 'Failed to generate response from Groq AI: ' + err.message });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🛡️  SurfaceQ Server running at http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`==================================================`);
});
