document.getElementById("scan-btn").addEventListener("click", () => {
  const statusDiv = document.getElementById("status");
  const resultBox = document.getElementById("result-box");

  statusDiv.textContent = "Scanning active tab...";
  resultBox.style.display = "none";

  chrome.runtime.sendMessage({ action: "scan_tab" }, (response) => {
    if (chrome.runtime.lastError) {
      statusDiv.textContent = "Scan failed.";
      resultBox.style.display = "block";
      resultBox.textContent = `Error: ${chrome.runtime.lastError.message}`;
      return;
    }

    if (response && response.status === "success") {
      statusDiv.textContent = "Scan complete!";
      resultBox.style.display = "block";
      resultBox.textContent = JSON.stringify(response.data, null, 2);
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
