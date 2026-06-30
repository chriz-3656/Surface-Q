// SurfaceQ Background Service Worker — WebRequest Header Interception & Storage
const headerCache = {};

// Listen to incoming headers to extract security posture parameters passively
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.type === "main_frame" && details.responseHeaders) {
      const headers = {};
      details.responseHeaders.forEach((h) => {
        headers[h.name.toLowerCase()] = h.value;
      });

      // Cache headers by domain
      try {
        const url = new URL(details.url);
        headerCache[url.hostname] = {
          timestamp: Date.now(),
          headers: headers
        };

        // Memory Leak Fix: Keep cache size bounded (max 50 entries)
        const keys = Object.keys(headerCache);
        if (keys.length > 50) {
          // Sort by timestamp and delete the oldest 10
          keys.sort((a, b) => headerCache[a].timestamp - headerCache[b].timestamp)
              .slice(0, 10)
              .forEach(oldKey => delete headerCache[oldKey]);
        }
      } catch (e) {
        console.error("Invalid URL in webRequest header listener", e);
      }
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

chrome.runtime.onInstalled.addListener(() => {
  console.log("SurfaceQ Passive Scanning engine loaded.");
});

// Listener for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scan_tab") {
    chrome.tabs.query({}, (tabs) => {
      // Search all tabs across all windows for the active web page
      let activeTab = tabs.find(t => t.active && t.url && !t.url.startsWith("chrome-extension://") && !t.url.startsWith("chrome://"));
      if (!activeTab) {
        activeTab = tabs.find(t => t.url && !t.url.startsWith("chrome-extension://") && !t.url.startsWith("chrome://"));
      }
      if (!activeTab) activeTab = tabs[0];
      if (!activeTab) {
        sendResponse({ status: "error", message: "No active tab found" });
        return;
      }

      let hostname = "";
      try {
        hostname = new URL(activeTab.url).hostname;
      } catch (e) {
        sendResponse({ status: "error", message: "Invalid URL protocol (cannot scan standard chrome:// pages)" });
        return;
      }

      const runScan = (headers) => {
        // Send message to content script to collect DOM-based metrics
        chrome.tabs.sendMessage(activeTab.id, { action: "collect_metadata" }, (response) => {
          if (chrome.runtime.lastError) {
            console.log("Content script not reachable. Falling back to passive data.", chrome.runtime.lastError.message);
          }
          const payload = response || {
            title: activeTab.title,
            url: activeTab.url,
            domain: hostname,
            technologies: [],
            forms: [],
            scripts: [],
            externalResources: { stylesheets: [], images: [], iframes: [] },
            mixedContent: []
          };
          
          payload.securityHeaders = evaluateHeaders(headers);
          payload.rawHeaders = headers;

          // Sync scan details to the local dashboard server cache
          fetch("http://localhost:3000/api/scans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }).catch((err) => console.warn("Dashboard sync failed", err));

          try {
            sendResponse({ status: "success", data: payload });
          } catch (e) {
            // Suppress error if popup was already closed
            console.log("Popup closed before response could be sent.");
          }
        });
      };

      if (headerCache[hostname]) {
        runScan(headerCache[hostname].headers);
      } else {
        // Passive fallback: request headers dynamically
        fetch(activeTab.url, { method: "HEAD" })
          .then((res) => {
            const headers = {};
            res.headers.forEach((value, name) => {
              headers[name.toLowerCase()] = value;
            });
            headerCache[hostname] = {
              timestamp: Date.now(),
              headers: headers
            };
            runScan(headers);
          })
          .catch((err) => {
            console.warn("Passive header fetch failed, using empty cache", err);
            runScan({});
          });
      }
    });
    return true; // Keep message channel open for async response
  }
});

// Helper to check security headers
function evaluateHeaders(headers) {
  const securityKeys = [
    { name: "content-security-policy", required: true, label: "Content Security Policy (CSP)" },
    { name: "strict-transport-security", required: true, label: "Strict Transport Security (HSTS)" },
    { name: "x-frame-options", required: true, label: "X-Frame-Options" },
    { name: "x-content-type-options", required: true, label: "X-Content-Type-Options" },
    { name: "referrer-policy", required: false, label: "Referrer-Policy" },
    { name: "permissions-policy", required: false, label: "Permissions-Policy" }
  ];

  return securityKeys.map((item) => {
    const value = headers[item.name] || null;
    let status = "missing";
    let recommendation = "";

    if (value) {
      status = "present";
      // Basic configuration checks
      if (item.name === "x-frame-options" && !["deny", "sameorigin"].includes(value.toLowerCase())) {
        status = "misconfigured";
        recommendation = "Restrict embedding using DENY or SAMEORIGIN.";
      }
    } else {
      recommendation = `Enable ${item.label} to harden defenses.`;
    }

    return {
      header: item.label,
      key: item.name,
      value: value,
      status: status,
      recommendation: recommendation
    };
  });
}
