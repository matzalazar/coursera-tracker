// scripts/scrape.ts
// Integration test CLI — fetches a real Coursera course and prints its structure.
//
// Usage (after building):
//   npm run build:scrape
//   node dist/scrape.js https://www.coursera.org/learn/<course-slug>

import { parseCourse } from "../src/scrapers/parser";
import type { Course } from "../src/types";

// ── Formatting ────────────────────────────────────────────────────────────────

const DIVIDER = "─".repeat(60);

async function fetchCourseHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} — could not fetch the course page.`);
  }

  return res.text();
}

function padEnd(str: string, len: number): string {
  return str.length >= len ? str : str + " ".repeat(len - str.length);
}

function printCourse(course: Course): void {
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  console.log();
  console.log(`Course   : ${course.title}`);
  console.log(`URL      : ${course.url}`);
  console.log(`Modules  : ${course.modules.length}  |  Lessons: ${totalLessons}`);
  console.log();

  for (let i = 0; i < course.modules.length; i++) {
    const mod = course.modules[i];
    const num = String(i + 1).padStart(2, "0");
    console.log(DIVIDER);
    console.log(`Module ${num} — ${mod.title} (${mod.lessons.length} lessons)`);
    console.log();

    for (let j = 0; j < mod.lessons.length; j++) {
      const lesson = mod.lessons[j];
      const lessonNum = String(j + 1).padStart(2, "0");
      const typeLabel = `[${lesson.type}]`;
      console.log(
        `  ${lessonNum}.  ${padEnd(typeLabel, 22)}  ${padEnd(lesson.title, 44)}  ${lesson.duration}`
      );
    }

    console.log();
  }

  console.log(DIVIDER);
  console.log(`\nTotal: ${course.modules.length} modules, ${totalLessons} lessons.`);
  console.log();
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const url = process.argv[2];

  if (!url || !url.startsWith("http")) {
    console.error("Usage: node dist/scrape.js <coursera-url>");
    process.exit(1);
  }

  console.log(`\nFetching: ${url}`);

  try {
    const html = await fetchCourseHtml(url);
    const course = parseCourse(html, url);
    printCourse(course);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\nError: ${message}`);
    process.exit(1);
  }
}

main();
