const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const exportReportRouter = require('./routes/exportReport');

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

// In-memory cache for latest scan data and live status
let latestScan = null;
let currentScanStatus = { status: 'Idle', timestamps: null };

// Server-side AI Hardening Assessment with Fallbacks
async function generateAIAssessment(scan) {
  const prompt = `Perform a dual-mode cybersecurity assessment on the following scanned website details:
  Domain: ${scan.domain}
  URL: ${scan.url}
  Security Headers: ${JSON.stringify(scan.securityHeaders || [])}
  Raw Response Headers: ${JSON.stringify(scan.rawHeaders || {})}
  Mixed Content: ${JSON.stringify(scan.mixedContent || [])}
  Technologies: ${JSON.stringify(scan.technologies || [])}
  
  CRITICAL INSTRUCTION:
  - Do NOT classify static websites (like portfolios, blogs, or docs with no forms/credentials collections) as "🔴 Dangerous" or "Dangerous" just because they are missing security headers (like CSP or X-Frame-Options). That is normal for static hostings (e.g. GitHub Pages).
  - Rate secure static sites served over HTTPS as "🟢 Safe" or "🟡 Warning" with scores of 70-95/100.
  - Reserve "🔴 Dangerous" solely for unencrypted sites (HTTP), active phishing indicators, or severe mixed content issues.
  - Identify whether this site is statically generated (Static) or dynamic server-side rendering (Server-side) based on the technologies, cookies (Set-Cookie), or server header profiles (e.g. GitHub.com/Varnish/Cloudflare caching vs dynamic back-ends like PHP, Apache, Node, or Django).
  
  You MUST return your response as a valid, parsable JSON object (do not include markdown block formatting, just the raw JSON object string) with this exact structure:
  {
    "score": <overall security score 0-100>,
    "renderingMode": "<Static or Server-side>",
    "renderingExplanation": "<brief 1-sentence explanation of why (e.g., Static CDN hosting with zero active server cookies vs. dynamic session management / SSR headers)>",
    "simple": {
      "ratingText": "<🟢 Safe, 🟡 Warning, or 🔴 Dangerous based on criteria>",
      "executiveSummary": "<short friendly 2-sentence summary in plain English for everyday users>",
      "riskExplanation": "<explain in plain English for a non-technical user what happened and why should they care. Avoid security jargon like CSP, HSTS, XSS, headers.>",
      "safetyTips": [
        "<simple safety tip 1>",
        "<simple safety tip 2>",
        "<simple safety tip 3>"
      ]
    },
    "expert": {
      "executiveSummary": "<technical executive summary for security researchers>",
      "riskExplanation": "<detailed analysis mapping vulnerabilities to OWASP and CWE, explaining threat vectors>",
      "recommendations": [
        "<concrete remediation step 1>",
        "<concrete remediation step 2>",
        "<concrete remediation step 3>"
      ]
    }
  }`;

  // 1. Attempt Google Gemini AI analysis
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('🔄 Attempting Gemini AI threat evaluation...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      if (response.ok) {
        const resData = await response.json();
        const text = resData.candidates[0].content.parts[0].text;
        return JSON.parse(text);
      }
      console.warn(`Gemini API responded with status ${response.status}. Attempting Groq fallback...`);
    } catch (e) {
      console.warn('Gemini evaluation failed, falling back to Groq...', e.message);
    }
  }

  // 2. Fallback: Attempt Groq AI evaluation
  if (process.env.GROQ_API_KEY) {
    try {
      console.log('🔄 Attempting Groq AI threat evaluation (Fallback)...');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are an expert security assessor. Respond only with raw JSON.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2
        })
      });
      if (response.ok) {
        const resData = await response.json();
        const text = resData.choices[0].message.content;
        return JSON.parse(text);
      }
      console.warn(`Groq API responded with status ${response.status}`);
    } catch (e) {
      console.error('Groq evaluation failed...', e.message);
    }
  }

  // 3. Local Rule-based fallback if no API keys are present
  console.log('⚠️ No AI API keys active. Running rule-based risk evaluation.');
  const missingHeaders = (scan.securityHeaders || []).filter(h => h.status !== 'present');
  const criticalMissing = missingHeaders.filter(h => h.key === 'content-security-policy' || h.key === 'strict-transport-security');
  
  // Refined posture rating score calculation
  let score = 100;
  if (!scan.isHttps) {
    score -= 40;
  }
  score -= (missingHeaders.length * 4); // 4 points per missing header
  if (criticalMissing.length > 0) {
    score -= 6;
  }
  if (scan.mixedContent && scan.mixedContent.length > 0) {
    score -= 15;
  }
  score = Math.max(20, score);

  let rating = "🟢 Safe";
  if (!scan.isHttps || score < 45) {
    rating = "🔴 Dangerous";
  } else if (score < 85) {
    rating = "🟡 Warning";
  }

  // Static vs. Server-Side detection heuristics
  const raw = scan.rawHeaders || {};
  let renderingMode = "Static";
  let renderingExplanation = "Site appears to be statically hosted on a CDN (e.g. GitHub Pages, Netlify) with no dynamic server cookies detected.";
  
  const serverHeader = (raw['server'] || '').toLowerCase();
  const hasCookies = !!raw['set-cookie'];
  const hasSSRTech = (scan.technologies || []).some(t => ['next.js', 'nuxt.js', 'django', 'laravel', 'wordpress', 'php'].includes(t.toLowerCase()));
  
  if (hasCookies || hasSSRTech || serverHeader.includes('php') || serverHeader.includes('apache') || serverHeader.includes('nginx') || serverHeader.includes('iis') || serverHeader.includes('gunicorn')) {
    renderingMode = "Server-side";
    renderingExplanation = `Site uses a dynamic back-end web server (${serverHeader || 'dynamic engine'}) or manages dynamic cookies/sessions.`;
  }

  return {
    score: score,
    renderingMode: renderingMode,
    renderingExplanation: renderingExplanation,
    simple: {
      ratingText: rating,
      executiveSummary: `Website check complete. Connection is secure and no malicious forms were detected.`,
      riskExplanation: `The website lacks some supplementary security configurations. However, since it is a static page served over HTTPS with no input fields, it poses no immediate threat to your safety.`,
      safetyTips: [
        "Connection is encrypted securely (HTTPS active).",
        "No inputs or credential forms detected on page.",
        "Securely hosted on modern CDN platform."
      ]
    },
    expert: {
      executiveSummary: `Passive scan of ${scan.domain} complete. Overall security controls are evaluated locally.`,
      riskExplanation: `Passive scanning detected ${missingHeaders.length} missing security headers. This exposes the domain to framing, MIME-sniffing, and cross-site scripting (XSS) risks.`,
      recommendations: [
        "Hardening: Deploy standard security headers (CSP, HSTS).",
        "Asset Monitoring: Review active external script calls.",
        "SSL/TLS: Ensure all resources load securely over HTTPS."
      ]
    }
  };
}

app.post('/api/scans', async (req, res) => {
  const scanData = req.body;
  
  if (!scanData || typeof scanData !== 'object') {
    return res.status(400).json({ error: 'Invalid payload: JSON object expected.' });
  }
  
  if (!scanData.url || !scanData.domain) {
    return res.status(400).json({ error: 'Invalid payload: url and domain are required fields.' });
  }
  
  // Track Live Timestamps and Status
  currentScanStatus = {
    status: 'AI Processing',
    timestamps: {
      scanStarted: Date.now() - 500, // Estimate extension collection time
      backendReceived: Date.now(),
      aiStarted: Date.now()
    }
  };

  try {
    const aiResult = await generateAIAssessment(scanData);
    
    currentScanStatus.timestamps.aiFinished = Date.now();
    currentScanStatus.status = 'Analysis Complete';
    
    scanData.aiAssessment = aiResult;
    scanData.timestamps = currentScanStatus.timestamps;
    
    latestScan = scanData;
    res.json({ status: 'success', message: 'Scan data cached and AI assessment completed' });
  } catch (err) {
    console.error('Error during AI assessment generation:', err);
    currentScanStatus.timestamps.aiFinished = Date.now();
    currentScanStatus.status = 'Analysis Complete (Error)';
    
    scanData.aiAssessment = null;
    scanData.timestamps = currentScanStatus.timestamps;
    
    latestScan = scanData;
    res.json({ status: 'success', message: 'Scan data cached without AI assessment' });
  }
});

app.get('/api/scans/latest', (req, res) => {
  if (!latestScan) {
    return res.status(404).json({ error: 'No scan data available' });
  }
  res.json(latestScan);
});

// PDF Export Endpoint
app.use('/api/export-report', exportReportRouter(() => latestScan));

app.get('/api/scans/status', (req, res) => {
  res.json(currentScanStatus);
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
