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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
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

      // Check if we have cached headers for this site
      const cached = headerCache[hostname] || { headers: {} };

      // Send message to content script to collect DOM-based metrics
      chrome.tabs.sendMessage(activeTab.id, { action: "collect_metadata" }, (response) => {
        if (chrome.runtime.lastError || !response) {
          // Fallback if content script cannot execute
          sendResponse({
            status: "success",
            data: {
              url: activeTab.url,
              domain: hostname,
              title: activeTab.title,
              technologies: [],
              forms: [],
              scripts: [],
              externalResources: { stylesheets: [], images: [], iframes: [] },
              mixedContent: [],
              securityHeaders: evaluateHeaders(cached.headers),
              rawHeaders: cached.headers
            }
          });
          return;
        }

        // Attach header results to the final payload
        response.securityHeaders = evaluateHeaders(cached.headers);
        response.rawHeaders = cached.headers;

        sendResponse({ status: "success", data: response });
      });
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
