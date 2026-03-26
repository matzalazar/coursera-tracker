# Coursera Tracker

> Import Coursera courses into your Obsidian vault — structured, linked, and ready to annotate.

![Version](https://img.shields.io/badge/version-0.1.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Obsidian%20Desktop-purple)

---

## Overview

**Course Tracker** is an Obsidian plugin that fetches a Coursera course's public syllabus and generates a fully linked folder structure inside your vault — one note per lesson, a master index with wiki-links, and YAML frontmatter ready for progress tracking.

Everything runs locally inside Obsidian. No login, no cookies, no external tools required.

---

## How It Works

```
User pastes Coursera URL
         │
         ▼
Fetches public course syllabus (no auth required)
         │
         ▼
Parses modules, content types, and lessons
         │
         ▼
Creates vault folder structure + .md files
```

---

## Prerequisites

| Requirement | Notes |
|---|---|
| [Obsidian Desktop](https://obsidian.md/) | Web version is not supported |
| Node.js ≥ 20.0.0 | Only needed to build from source |

---

## Installation

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/matzalazar/coursera-tracker
   cd coursera-tracker
   npm install
   ```

2. Build the plugin:

   ```bash
   npm run build
   ```

3. Copy the built artifacts into your vault:

   ```bash
   PLUGIN_DIR="/path/to/your/vault/.obsidian/plugins/coursera-tracker"
   mkdir -p "$PLUGIN_DIR"
   cp dist/main.js manifest.json "$PLUGIN_DIR/"
   ```

4. Restart Obsidian and enable **Coursera Tracker** under **Settings → Community Plugins**.

---

## Usage

1. Open the command palette (`Ctrl/Cmd + P`).
2. Run **Coursera Tracker: Create Course from URL**.
3. Paste the full URL of a Coursera course and click **Import**.
4. The plugin fetches the public syllabus and builds the vault structure automatically.

---

## Output Structure

Given a course titled *"Machine Learning Specialization"*, the plugin generates:

```
Courses/
└── Coursera/
    └── Machine Learning Specialization/
        ├── _index.md
        ├── 00 Introduction To Machine Learning/
        │   ├── Video/
        │   │   ├── 00 Welcome To The Course.md
        │   │   └── 01 What Is Machine Learning.md
        │   └── Reading/
        │       └── 00 Course Overview.md
        └── 01 Supervised Learning/
            ├── Video/
            │   └── 00 Linear Regression.md
            └── Assignment/
                └── 00 Lab Linear Regression.md
```

### `_index.md`

```markdown
# Machine Learning Specialization

**Course link:** [Go to course](https://www.coursera.org/learn/...)

---

## Introduction to Machine Learning

### Video

- [[00 Introduction To Machine Learning/Video/00 Welcome To The Course]] · _4 min_
- [[00 Introduction To Machine Learning/Video/01 What Is Machine Learning]] · _12 min_

### Reading

- [[00 Introduction To Machine Learning/Reading/00 Course Overview]] · _10 min_
```

### Lesson note

```markdown
---
title: "Welcome to the Course"
type: "Video"
duration: "4 min"
completed: false
date: null
---

# Welcome to the Course

Type: Video
Duration: 4 min
```

---

## Disclaimer

This plugin fetches **publicly available** Coursera syllabus pages. No login or credentials are required or stored.

It is intended for **personal use only**. Use it to organize courses you are enrolled in. Please respect the [Coursera Terms of Service](https://www.coursera.org/about/terms).

> **Note:** This plugin relies on Coursera's current HTML structure. If Coursera updates their frontend, parsing may break until the selectors in `src/scrapers/parser.ts` are updated.

All processing happens locally on your machine. No data is collected, stored remotely, or transmitted to any third party.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

[MIT](./LICENSE)
