# Contributing to SurfaceQ

First off, **thank you** for considering contributing to SurfaceQ! 🛡️ Every contribution helps make web security intelligence more accessible to everyone. Whether you're fixing a typo, reporting a bug, suggesting a feature, or submitting code, your involvement is valued and appreciated.

This document provides guidelines and information to help you contribute effectively.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Code Style Guide](#code-style-guide)
- [Testing Requirements](#testing-requirements)
- [Community Guidelines](#community-guidelines)

## 📜 Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code. Please report unacceptable behavior to [chrizmonsaji@gmail.com](mailto:chrizmonsaji@gmail.com).

We are committed to providing a welcoming and inclusive experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

## 🤝 How to Contribute

### 🐛 Reporting Bugs

Found a bug? Help us fix it by [opening an issue](https://github.com/chriz-3656/Surface-Q/issues/new) with:

1. **A clear, descriptive title** that summarizes the problem
2. **Steps to reproduce** the behavior, including specific URLs if applicable
3. **Expected behavior** — what you expected to happen
4. **Actual behavior** — what actually happened
5. **Environment details** — browser version, Node.js version, OS
6. **Screenshots or console output** if applicable
7. **Extension version** and **server version** from the popup/dashboard

### 💡 Suggesting Features

Have an idea for a new feature? We'd love to hear it!

1. Check the [ROADMAP.md](ROADMAP.md) to see if it's already planned
2. Search [existing issues](https://github.com/chriz-3656/Surface-Q/issues) to avoid duplicates
3. [Open a feature request](https://github.com/chriz-3656/Surface-Q/issues/new) with:
   - A clear description of the feature and its purpose
   - The problem it solves or the value it adds
   - Any mockups, diagrams, or examples that illustrate the idea
   - Consideration of how it fits with SurfaceQ's privacy-first philosophy

### 🔧 Submitting Pull Requests

Ready to contribute code? Here's the workflow:

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch from `main` (see [Branch Naming](#branch-naming-convention))
4. Make your changes with clear, atomic commits (see [Commit Messages](#commit-message-convention))
5. Test your changes thoroughly
6. Push your branch to your fork
7. Open a Pull Request against `main`

### 📝 Improving Documentation

Documentation improvements are always welcome! This includes:

- Fixing typos or grammatical errors
- Clarifying existing documentation
- Adding examples or code snippets
- Improving inline code comments and JSDoc annotations
- Translating documentation to other languages
- Adding tutorials or how-to guides

## 🛠️ Development Setup

### Prerequisites

Ensure you have the following installed:

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| **Node.js** | 18.0.0+ | Server runtime |
| **npm** | 9.0.0+ | Package management |
| **Google Chrome** | Latest stable | Extension development and testing |
| **Git** | 2.30.0+ | Version control |

### Step-by-Step Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/chriz-3656/Surface-Q.git
   cd Surface-Q
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Gemini API key:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   DB_PATH=./data/surfaceq.db
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000`.

5. **Load the browser extension**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in the top-right corner)
   - Click **Load unpacked**
   - Select the `extension/` directory from the project root

6. **Verify everything works**
   - Click the SurfaceQ icon in the Chrome toolbar
   - Navigate to any website and confirm analysis appears
   - Visit `http://localhost:3000/dashboard` to confirm the dashboard loads

### Project Structure

```
Surface-Q/
├── extension/          # Chrome extension source
│   ├── manifest.json   # Extension manifest (MV3)
│   ├── popup/          # Extension popup UI
│   ├── background/     # Service worker scripts
│   ├── content/        # Content scripts
│   └── assets/         # Icons, images, styles
├── server/             # Node.js backend
│   ├── src/            # Server source code
│   ├── data/           # SQLite database (auto-created)
│   ├── public/         # Dashboard static files
│   ├── package.json    # Server dependencies
│   └── .env.example    # Environment template
├── docs/               # Additional documentation
├── README.md           # Project overview
├── CONTRIBUTING.md     # This file
├── SECURITY.md         # Security policy
├── ROADMAP.md          # Development roadmap
├── CHANGELOG.md        # Version history
└── LICENSE             # MIT License
```

## 🌿 Branch Naming Convention

Use the following prefixes for your branch names:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features or enhancements | `feature/ssl-analysis` |
| `bugfix/` | Bug fixes | `bugfix/header-parsing-error` |
| `docs/` | Documentation changes | `docs/api-reference` |
| `refactor/` | Code refactoring (no behavior change) | `refactor/analysis-pipeline` |
| `test/` | Adding or updating tests | `test/risk-scoring-unit` |
| `chore/` | Maintenance tasks, dependencies | `chore/update-dependencies` |

Branch names should be lowercase, use hyphens as separators, and be descriptive but concise.

## 📝 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear, standardized commit messages.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or correcting tests |
| `chore` | Maintenance tasks, build changes, dependency updates |
| `perf` | Performance improvements |
| `ci` | CI/CD configuration changes |

### Examples

```bash
feat(extension): add SSL certificate chain analysis
fix(server): handle missing Content-Security-Policy header gracefully
docs(readme): update quick start instructions for Windows
style(popup): enforce consistent spacing in analysis panel
refactor(api): extract header parsing into dedicated module
test(risk): add unit tests for risk scoring algorithm
chore(deps): update better-sqlite3 to v11.0.0
```

### Guidelines

- Use the **imperative mood** in the description ("add" not "added" or "adds")
- Keep the first line under **72 characters**
- Reference issue numbers in the footer when applicable: `Closes #42`
- For breaking changes, add `BREAKING CHANGE:` in the footer

## 🔀 Pull Request Process

### Before Submitting

1. Ensure your code follows the [Code Style Guide](#code-style-guide)
2. Run all existing tests and confirm they pass
3. Add tests for any new functionality
4. Update documentation if your changes affect user-facing behavior
5. Rebase your branch on the latest `main` to resolve conflicts

### PR Checklist

When opening a PR, please confirm the following:

- [ ] My code follows the project's code style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have added JSDoc annotations to new functions and modules
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or my feature works
- [ ] New and existing tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
- [ ] I have checked that my changes respect user privacy (no new data collection)

### Review Process

1. A maintainer will review your PR within **48 hours**
2. Feedback may be provided as inline comments or general suggestions
3. Please address all review comments and push updates to the same branch
4. Once approved, a maintainer will merge your PR
5. Your contribution will be noted in the [CHANGELOG.md](CHANGELOG.md)

## 🎨 Code Style Guide

### General Rules

| Rule | Convention |
|------|-----------|
| Indentation | **2 spaces** (no tabs) |
| Quotes | **Single quotes** for strings |
| Semicolons | **Always** use semicolons |
| Line length | Maximum **100 characters** |
| Trailing commas | Use in multi-line arrays and objects |
| File encoding | **UTF-8** |
| Line endings | **LF** (Unix-style) |

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Variables | `camelCase` | `headerAnalysis` |
| Functions | `camelCase` | `calculateRiskScore()` |
| Classes | `PascalCase` | `SecurityAnalyzer` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| Files | `kebab-case` | `risk-scoring.js` |
| CSS classes | `kebab-case` | `.analysis-panel` |
| Database tables | `snake_case` | `scan_results` |

### JSDoc Annotations

All exported functions, classes, and modules must include JSDoc annotations:

```javascript
/**
 * Calculates a composite risk score based on security header analysis.
 *
 * @param {Object} headers - Parsed HTTP response headers
 * @param {string} headers.contentSecurityPolicy - The CSP header value
 * @param {string} headers.strictTransportSecurity - The HSTS header value
 * @param {Object} sslInfo - SSL/TLS certificate information
 * @returns {number} Risk score from 0 (critical) to 100 (excellent)
 * @throws {Error} If headers object is null or undefined
 */
function calculateRiskScore(headers, sslInfo) {
  // Implementation
}
```

### JavaScript Best Practices

- Use `const` by default; use `let` only when reassignment is necessary; never use `var`
- Use arrow functions for callbacks and anonymous functions
- Use template literals for string interpolation
- Use destructuring for object and array access where it improves readability
- Use `async/await` instead of raw Promises where possible
- Handle errors explicitly — never swallow exceptions silently

## 🧪 Testing Requirements

### What to Test

- **Unit tests** for all utility functions, analysis modules, and risk scoring logic
- **Integration tests** for API endpoints and database operations
- **Extension tests** for popup interactions and content script behavior

### Test Guidelines

- Place test files alongside source files with a `.test.js` suffix
- Each test should have a clear, descriptive name explaining what it validates
- Tests should be independent and not rely on execution order
- Mock external dependencies (Gemini API, network requests)
- Aim for meaningful coverage of critical paths rather than arbitrary coverage percentages

### Running Tests

```bash
cd server
npm test
```

## 🌍 Community Guidelines

### Be Respectful
Treat everyone with respect. Constructive criticism is welcome; personal attacks are not.

### Be Collaborative
Share knowledge, help others learn, and be open to feedback on your own contributions.

### Be Patient
Maintainers and reviewers are volunteers. Please allow reasonable time for responses.

### Ask Questions
There are no silly questions. If something is unclear, ask! Use GitHub Discussions or Issues.

### Stay On Topic
Keep discussions focused on SurfaceQ and its development. Off-topic conversations are best held elsewhere.

### Give Credit
If your contribution builds on someone else's work or idea, acknowledge it.

---

<div align="center">

**Thank you for helping make the web more secure! 🛡️**

</div>
