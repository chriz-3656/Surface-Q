// SurfaceQ Content Script — Passive Metadata & DOM-based Fingerprinting
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "collect_metadata") {
    try {
      const pageTitle = document.title;
      const pageUrl = window.location.href;
      const parsedUrl = new URL(pageUrl);
      const isHttps = parsedUrl.protocol === "https:";

      // 1. Detect JavaScript Files and categorize
      const scripts = Array.from(document.querySelectorAll("script")).map(script => {
        const src = script.src || "";
        const type = script.type || "inline";
        let category = "custom";
        if (src) {
          if (src.includes("google-analytics") || src.includes("gtag") || src.includes("analytics.js")) {
            category = "analytics";
          } else if (src.includes("jquery")) {
            category = "library";
          } else if (src.includes("react") || src.includes("vue") || src.includes("angular")) {
            category = "framework";
          } else if (src.includes("cdn") || !src.includes(parsedUrl.hostname)) {
            category = "third-party";
          } else {
            category = "first-party";
          }
        }
        return { src, type, category };
      });

      // 2. Detect External Resources
      const stylesheets = Array.from(document.querySelectorAll("link[rel='stylesheet']")).map(link => link.href);
      const images = Array.from(document.querySelectorAll("img")).map(img => img.src);
      const iframes = Array.from(document.querySelectorAll("iframe")).map(iframe => iframe.src || "inline");

      // 3. Detect Mixed Content (HTTP resources on HTTPS page)
      const mixedContent = [];
      if (isHttps) {
        // Check scripts, styles, images, iframes for http://
        scripts.forEach(s => {
          if (s.src.startsWith("http://")) mixedContent.push({ type: "script", url: s.src });
        });
        stylesheets.forEach(href => {
          if (href.startsWith("http://")) mixedContent.push({ type: "stylesheet", url: href });
        });
        images.forEach(src => {
          if (src.startsWith("http://")) mixedContent.push({ type: "image", url: src });
        });
        iframes.forEach(src => {
          if (src.startsWith("http://")) mixedContent.push({ type: "iframe", url: src });
        });
      }

      // 4. Detect Forms (Metadata only)
      const forms = Array.from(document.querySelectorAll("form")).map((form, index) => {
        const action = form.getAttribute("action") || "";
        const method = (form.getAttribute("method") || "GET").toUpperCase();
        const inputs = Array.from(form.querySelectorAll("input, select, textarea")).map(input => {
          return {
            name: input.getAttribute("name") || "",
            type: input.getAttribute("type") || input.tagName.toLowerCase(),
            required: input.hasAttribute("required")
          };
        });

        // Heuristic detection of form purpose
        let purpose = "generic";
        const formText = (form.id + " " + form.className + " " + action).toLowerCase();
        if (inputs.some(i => i.type === "password")) {
          purpose = "login-or-register";
        } else if (formText.includes("search") || inputs.some(i => i.name.includes("query") || i.name.includes("search"))) {
          purpose = "search";
        } else if (formText.includes("subscribe") || formText.includes("newsletter") || inputs.some(i => i.name.includes("email"))) {
          purpose = "newsletter";
        }

        return { id: form.id || `form-${index}`, action, method, purpose, inputCount: inputs.length, inputs };
      });

      // 5. Technology Stack Detection (DOM-based)
      const detectedTech = new Set();
      
      // Frameworks & Libraries
      if (window.React || document.querySelector("[data-reactroot]")) detectedTech.add("React");
      if (window.Vue) detectedTech.add("Vue.js");
      if (window.angular || document.querySelector("[ng-version]")) detectedTech.add("Angular");
      if (window.jQuery || window.$) detectedTech.add("jQuery");
      if (document.querySelector("script[src*='alpine']")) detectedTech.add("Alpine.js");
      if (document.querySelector("script[src*='next']")) detectedTech.add("Next.js");

      // UI/Styling Systems
      if (document.querySelector("[class*='tailwind']") || document.querySelector("script[src*='tailwindcss']")) detectedTech.add("Tailwind CSS");
      if (document.querySelector("link[href*='bootstrap']") || document.querySelector("[class*='bootstrap']")) detectedTech.add("Bootstrap");

      // Analytics & CDNs
      if (window.ga || window.gtag || window.GoogleAnalyticsObject) detectedTech.add("Google Analytics");
      if (window.mixpanel) detectedTech.add("Mixpanel");
      if (window.Cloudflare || document.querySelector("link[href*='cloudflare']")) detectedTech.add("Cloudflare");

      // CMS
      if (document.querySelector("meta[name='generator']")) {
        const gen = document.querySelector("meta[name='generator']").content;
        if (gen.toLowerCase().includes("wordpress")) detectedTech.add("WordPress");
        if (gen.toLowerCase().includes("joomla")) detectedTech.add("Joomla");
        if (gen.toLowerCase().includes("drupal")) detectedTech.add("Drupal");
      }

      // Check document HTML for general keywords
      const htmlText = document.documentElement.innerHTML.substring(0, 10000).toLowerCase();
      if (htmlText.includes("wp-content") || htmlText.includes("wp-includes")) detectedTech.add("WordPress");

      sendResponse({
        title: pageTitle,
        url: pageUrl,
        isHttps,
        domain: parsedUrl.hostname,
        technologies: Array.from(detectedTech),
        forms: forms,
        scripts: scripts,
        externalResources: {
          stylesheets,
          images,
          iframes
        },
        mixedContent: mixedContent
      });
    } catch (error) {
      sendResponse({ error: error.message });
    }
  }
});
