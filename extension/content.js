// SurfaceQ Chrome Extension Content Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "collect_metadata") {
    const pageTitle = document.title;
    const pageUrl = window.location.href;

    // Detect forms
    const forms = Array.from(document.querySelectorAll("form")).map(form => ({
      action: form.action,
      method: form.method || "GET",
      inputs: Array.from(form.querySelectorAll("input")).map(input => ({
        type: input.type,
        name: input.name || ""
      }))
    }));

    // Detect external script domains
    const scripts = Array.from(document.querySelectorAll("script[src]")).map(script => script.src);

    // Detect stylesheets and external resources
    const links = Array.from(document.querySelectorAll("link[href]")).map(link => link.href);

    // Send collected data back to background worker
    sendResponse({
      title: pageTitle,
      url: pageUrl,
      forms: forms,
      scripts: scripts,
      links: links
    });
  }
});
