# AI Tools Disclosure & Privacy 🤖

Surface-Q relies on Large Language Models (LLMs) to power its automated risk scoring and recommendation engine.

## Models Used
- **Primary:** Google Gemini (`gemini-2.5-flash` or similar)
- **Fallback:** Groq (`llama-3.1-8b-instant`)

## What Data is Shared?
When a user clicks "Scan Website" via the Chrome Extension, the following passive telemetry is packaged into a JSON payload and sent to the LLM:
- Target Domain URL
- Detected Frontend Technologies (e.g., React, jQuery, Tailwind)
- Form Configuration Metadata (Action URLs, Method, Input types)
- Security Headers (CSP, HSTS, X-Frame-Options)
- Inline / External Scripts and Stylesheets

**NO PII (Personally Identifiable Information) or sensitive DOM contents (e.g., user passwords, session tokens) are collected or sent to the AI.**

## Security & Privacy
1. **Local Bridge:** Telemetry flows from your browser -> your local Node.js server -> directly to the AI provider via API. Surface-Q does not route your data through a central proprietary server.
2. **Opt-in Only:** Scans only occur when manually triggered by the user via the extension popup.
3. **No Training Guarantee:** We recommend using Enterprise API keys or checking the AI provider's data retention policies to ensure your telemetry is not used for model training.

## Limitations
- **Hallucinations:** The AI may occasionally misinterpret a stack trace or recommend a security header that breaks a specific legacy application.
- **Context Window:** Extremely large websites with thousands of inline scripts may be truncated before being processed by the AI.

Always verify AI-generated security recommendations before applying them to production environments.
