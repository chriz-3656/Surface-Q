let userMode = "simple";

// Load persisted user mode state on open
chrome.storage.local.get("userMode", (res) => {
  if (res.userMode) {
    userMode = res.userMode;
  }
  updateToggleUI();
});

function updateToggleUI() {
  const modeBtn = document.getElementById("toggle-mode-btn");
  if (modeBtn) {
    modeBtn.textContent = userMode === "simple" ? "Simple Mode" : "Expert Mode";
    modeBtn.style.borderColor = userMode === "simple" ? "#27272a" : "#7c4dff";
    modeBtn.style.color = userMode === "simple" ? "#a1a1aa" : "#e4e4e7";
  }
}

// Toggle mode click handler
document.getElementById("toggle-mode-btn").addEventListener("click", () => {
  userMode = userMode === "simple" ? "expert" : "simple";
  chrome.storage.local.set({ userMode: userMode });
  updateToggleUI();
  
  // Refresh visible boxes if results are present
  const resultBox = document.getElementById("result-box");
  const simpleBox = document.getElementById("simple-box");
  if (resultBox.style.display === "block" || simpleBox.style.display === "block") {
    // If we have active data inside result-box text, refresh views
    try {
      const data = JSON.parse(resultBox.textContent);
      renderView(data);
    } catch(e) {}
  }
});

function renderView(data) {
  const resultBox = document.getElementById("result-box");
  const simpleBox = document.getElementById("simple-box");

  if (userMode === "expert") {
    simpleBox.style.display = "none";
    resultBox.style.display = "block";
    resultBox.textContent = JSON.stringify(data, null, 2);
  } else {
    resultBox.style.display = "none";
    simpleBox.style.display = "block";

    // Simple view parser
    const missingCount = (data.securityHeaders || []).filter(h => h.status !== 'present').length;
    const score = Math.max(10, 100 - (missingCount * 18));
    const isSecure = data.isHttps;

    let badge = "🟢 Safe";
    let badgeColor = "#10b981";
    if (missingCount > 3) {
      badge = "🔴 Dangerous";
      badgeColor = "#ef4444";
    } else if (missingCount > 0) {
      badge = "🟡 Warning";
      badgeColor = "#f59e0b";
    }

    simpleBox.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #27272a;">
        <span style="font-size: 1rem; font-weight: 700; color: ${badgeColor};">${badge}</span>
        <span style="font-size: 0.95rem; font-weight: 800; color: #ffffff;">Score: ${score}/100</span>
      </div>
      <div style="font-size: 0.75rem; color: #a1a1aa; line-height: 1.4; margin-bottom: 10px;">
        ${data.domain || "Target website"} has been scanned. Basic network layers checked.
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.75rem;">
        <div>🔒 Connection secure: <strong style="color: #ffffff;">${isSecure ? 'Yes' : 'No'}</strong></div>
        <div>⚙️ Security Warnings: <strong style="color: #ffffff;">${missingCount} missing configurations</strong></div>
        <div>⚡ External assets loading: <strong style="color: #ffffff;">${(data.scripts || []).length} scripts</strong></div>
      </div>
    `;
  }
}

document.getElementById("scan-btn").addEventListener("click", () => {
  const statusDiv = document.getElementById("status");
  const resultBox = document.getElementById("result-box");
  const simpleBox = document.getElementById("simple-box");

  statusDiv.textContent = "Scanning active tab...";
  resultBox.style.display = "none";
  simpleBox.style.display = "none";

  chrome.runtime.sendMessage({ action: "scan_tab" }, (response) => {
    if (chrome.runtime.lastError) {
      statusDiv.textContent = "Scan failed.";
      resultBox.style.display = "block";
      resultBox.textContent = `Error: ${chrome.runtime.lastError.message}`;
      return;
    }

    if (response && response.status === "success") {
      statusDiv.textContent = "Scan complete!";
      renderView(response.data);
    } else {
      statusDiv.textContent = "Scan failed.";
      resultBox.style.display = "block";
      resultBox.textContent = response ? response.message : "Unknown error";
    }
  });
});

// Launch local web dashboard
document.getElementById("view-dashboard-link").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "http://localhost:3000/dashboard.html" });
});

// Launch official repository website
document.getElementById("view-repo-link").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "https://github.com/chriz-3656/Surface-Q" });
});
