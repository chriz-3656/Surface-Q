# Testing Guide 🧪

Surface-Q utilizes **Playwright** for End-to-End (E2E) integration testing.

## Prerequisites
Make sure dependencies are installed:
```bash
npm install
```

Ensure Playwright browsers are installed:
```bash
npx playwright install
```

## Running Tests

### 1. Extension & Backend Integration Test
This test automatically loads the unpacked Chrome Extension, navigates to a target, triggers a scan, and verifies that the dashboard receives the JSON response from the local server.

**Ensure the Node.js server is RUNNING first!**
```bash
node server/index.js
```

Then, in a separate terminal:
```bash
node server/test_extension.js
```

### 2. Premium Landing Page UI Test
This test verifies that the GSAP orchestration, ScrollTrigger plugins, and WebP sequence frame canvases mount correctly without errors.

```bash
node server/test_landing.js
```

## Expected Outcomes
If successful, the terminal will output `✅ Success:` for individual steps and conclude with `🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!`.

## Troubleshooting
- **Timeout Errors:** Ensure the local server is running on `PORT=3000` before starting `test_extension.js`.
- **Browser Context Failed:** Make sure you have installed Playwright browsers via `npx playwright install`.
