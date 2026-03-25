// src/types.ts

/** Supported scraping platforms. Extend this union as new platforms are added. */
export type Platform = "coursera" | "unknown";

/** A single lesson within a course module. */
export interface Lesson {
  title: string;
  /** Content type derived from the syllabus group header: "Video", "Reading", "Assignment", etc. */
  type: string;
  duration: string;
}

/** A course module containing an ordered list of lessons. */
export interface Module {
  title: string;
  lessons: Lesson[];
}

/** Full course data as returned by the scraper. */
export interface Course {
  title: string;
  url: string;
  modules: Module[];
}
