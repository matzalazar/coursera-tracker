// src/scrapers/parser.ts

import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import type { Course, Module, Lesson } from "../types";

// ── Selectors ─────────────────────────────────────────────────────────────────

/**
 * CSS / attribute selectors for the Coursera public syllabus page.
 * Update these if Coursera changes its HTML structure.
 */
const SELECTORS = {
  /** Each week/module accordion panel. */
  accordionItem: "div[data-testid='accordion-item']",
  /** Module title within an accordion panel. */
  moduleTitle: "h3",
  /** Course title. */
  courseTitle: "h1",
  /** Lesson list within a content-type group. */
  lessonList: "ul",
  /** Individual lesson item. */
  lessonItem: "li",
  /**
   * Content-type count label inside a group header.
   * Pattern: h5 > span.icon-wrapper > span  →  "8 videos", "4 readings", …
   */
  contentTypeLabel: "h5 span span",
} as const;

// ── Type normalization ─────────────────────────────────────────────────────────

const CONTENT_TYPE_MAP: Record<string, string> = {
  videos: "Video",
  readings: "Reading",
  assignments: "Assignment",
  quizzes: "Quiz",
  discussions: "Discussion",
  projects: "Project",
  labs: "Lab",
  plugins: "Plugin",
};

/**
 * Parses the content type from a syllabus group header.
 *
 * Coursera group headers follow the pattern "N <type>s", e.g.:
 *   "8 videos"  → "Video"
 *   "4 readings" → "Reading"
 *   "5 assignments" → "Assignment"
 */
function parseContentType(headerText: string): string {
  const word = headerText.trim().toLowerCase().split(/\s+/).pop() ?? "";
  return CONTENT_TYPE_MAP[word] ?? (word ? word.charAt(0).toUpperCase() + word.slice(1) : "");
}

// ── Lesson parsing ─────────────────────────────────────────────────────────────

/**
 * Extracts a lesson from a Coursera syllabus list item.
 *
 * Public syllabus items follow this text pattern:
 *   "Lesson Title • Duration"
 *
 * The type is NOT in the <li> text — it is inherited from the parent group header.
 */
function parseLesson(
  $: cheerio.CheerioAPI,
  li: AnyNode,
  type: string
): Lesson | null {
  const parts = $(li)
    .text()
    .split("•")
    .map((s) => s.trim())
    .filter(Boolean);

  const title = parts[0];
  if (!title) return null;

  const duration = parts.length >= 2 ? parts[parts.length - 1] : "?";

  return { title, type, duration };
}

// ── Module parsing ─────────────────────────────────────────────────────────────

/**
 * Extracts all modules from a parsed Coursera public syllabus page.
 *
 * Each `div[data-testid="accordion-item"]` maps to one module (week).
 * Within each module, lessons are grouped by content type via container divs
 * that each hold an h5 header ("N videos", "4 readings", …) and a sibling ul.
 * The type is read from the header and assigned to every lesson in that ul.
 *
 * Modules with no parseable lessons are skipped.
 */
export function parseModules($: cheerio.CheerioAPI): Module[] {
  const modules: Module[] = [];

  $(SELECTORS.accordionItem).each((_, modEl) => {
    const title = $(modEl).find(SELECTORS.moduleTitle).first().text().trim();
    if (!title) return;

    const lessons: Lesson[] = [];

    // Anchor to each ul in the module. The content-type header (h5) lives in
    // the same parent container as the ul: container > { h5 wrapper, ul }.
    $(modEl)
      .find(SELECTORS.lessonList)
      .each((_, ulEl) => {
        const container = $(ulEl).parent();
        const headerText = container.find(SELECTORS.contentTypeLabel).first().text().trim();
        const contentType = parseContentType(headerText);
        if (!contentType) return;

        $(ulEl)
          .find(SELECTORS.lessonItem)
          .each((_, li) => {
            const lesson = parseLesson($, li, contentType);
            if (lesson) lessons.push(lesson);
          });
      });

    if (lessons.length > 0) {
      modules.push({ title, lessons });
    }
  });

  return modules;
}

// ── Course parsing ─────────────────────────────────────────────────────────────

/**
 * Extracts the full course structure from a parsed Coursera HTML page.
 *
 * @param html - Raw HTML string of the course page.
 * @param url  - Original course URL, included in the returned object.
 * @throws if no content groups are found (likely page structure changed).
 */
export function parseCourse(html: string, url: string): Course {
  const $ = cheerio.load(html);

  const title = $(SELECTORS.courseTitle).first().text().trim() || "Untitled Course";
  const modules = parseModules($);

  if (modules.length === 0) {
    throw new Error(
      "No content groups found. The page structure may have changed, or the URL is not a valid Coursera course page."
    );
  }

  return { title, url, modules };
}
