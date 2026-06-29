// SurfaceQ Chrome Extension Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("SurfaceQ extension installed.");
});

// Listener for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scan_tab") {
    // Initiate scanner logic
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab) {
        sendResponse({ status: "error", message: "No active tab found" });
        return;
      }

      // Send message to content script to collect DOM details
      chrome.tabs.sendMessage(activeTab.id, { action: "collect_metadata" }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script might not be injected (e.g. chrome:// urls)
          sendResponse({
            status: "success",
            data: {
              url: activeTab.url,
              title: activeTab.title,
              headers: {},
              technologies: [],
              forms: [],
              securityHeaders: [],
              isLocalSkeleton: true
            }
          });
          return;
        }
        sendResponse({ status: "success", data: response });
      });
    });
    return true; // Keep message channel open for async response
  }
});
