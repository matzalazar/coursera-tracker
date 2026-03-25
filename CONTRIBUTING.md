# Contributing to Coursera Tracker

Thank you for your interest in contributing. This document covers how to set up the project locally, the conventions in use, and how to submit changes.

---

## Development Setup

### Requirements

- Node.js ≥ 18.19.1
- npm ≥ 9.2.0
- An Obsidian Desktop vault for manual testing

### Getting started

```bash
git clone https://github.com/matzalazar/coursera-tracker
cd coursera-tracker
npm install
```

Build the plugin:

```bash
npm run build
```

This bundles `src/main.ts` into `dist/main.js` via esbuild.

Run the tests:

```bash
npm test
```

---

## Project Structure

```
coursera-tracker/
├── src/
│   ├── main.ts              # Entry point — re-exports the plugin class
│   ├── plugin.ts            # Plugin lifecycle, command registration, scraper invocation
│   ├── ui.ts                # UrlPromptModal
│   ├── writer.ts            # Vault file/folder creation logic
│   ├── utils.ts             # detectPlatform, sanitize
│   ├── types.ts             # Shared TypeScript types
│   └── scrapers/
│       ├── coursera.ts      # Coursera HTTP fetcher (uses Obsidian's requestUrl)
│       └── parser.ts        # HTML parser (cheerio)
├── scripts/
│   └── scrape.ts            # CLI tool for testing the scraper outside Obsidian
├── tests/
│   ├── parser.test.ts
│   ├── utils.test.ts
│   └── fixtures/
│       └── course.html
├── manifest.json
└── package.json
```

---

## Adding a New Platform

1. Add the platform name to the `Platform` union in `src/types.ts`:
   ```ts
   export type Platform = "coursera" | "<platform>" | "unknown";
   ```

2. Add detection logic in `src/utils.ts`:
   ```ts
   if (url.includes("<platform>.com")) return "<platform>";
   ```

3. Create `src/scrapers/<platform>.ts`. The scraper must return a `Course` object matching the type in `src/types.ts`. Use Obsidian's `requestUrl` for HTTP requests.

4. Add a branch in `src/plugin.ts` to call the new scraper when the platform is detected.

---

## Code Conventions

- **TypeScript**: strict mode, explicit return types on exported functions.
- **Comments**: only where logic is non-obvious. Avoid restating what the code does.
- **No new dependencies** without prior discussion in an issue.

---

## Submitting Changes

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feat/my-feature
   ```

2. Make your changes and test manually against a real Obsidian vault.

3. Open a pull request against `main` with a clear title and description of what changed and why.

---

## Reporting Issues

Open an issue and include:

- Plugin version
- OS and Obsidian version
- The course URL (if applicable)
- Full error message from the Obsidian developer console (`Ctrl/Cmd + Shift + I`)
