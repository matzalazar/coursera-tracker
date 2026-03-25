// src/scrapers/coursera.ts

import { requestUrl } from "obsidian";
import { parseCourse } from "./parser";
import type { Course } from "../types";

/**
 * Fetches a Coursera course page and returns the parsed course structure.
 *
 * Uses Obsidian's requestUrl (bypasses CORS) with the public syllabus —
 * no authentication required.
 *
 * @param url - Full URL of the Coursera course.
 * @throws if the request fails or no content groups can be parsed.
 */
export async function scrapeCourse(url: string): Promise<Course> {
  const res = await requestUrl({
    url,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (res.status !== 200) {
    throw new Error(`HTTP ${res.status} — could not fetch the course page.`);
  }

  return parseCourse(res.text, url);
}
