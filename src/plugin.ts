// src/plugin.ts

import { Plugin, FileSystemAdapter, Notice } from "obsidian";
import { UrlPromptModal } from "./ui";
import { saveCourse } from "./writer";
import { detectPlatform, sanitize } from "./utils";
import { scrapeCourse } from "./scrapers/coursera";

export default class CourseTrackerPlugin extends Plugin {
  private isImporting = false;

  onload() {
    this.addCommand({
      id: "create-course-from-url",
      name: "Create course from URL",
      callback: () => {
        new UrlPromptModal(this.app, async (url: string) => {
          if (!url) return;

          if (this.isImporting) {
            new Notice("An import is already in progress.");
            return;
          }

          if (detectPlatform(url) === "unknown") {
            new Notice("Unrecognized URL — only Coursera courses are supported.");
            return;
          }

          if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
            new Notice("This plugin only works on Obsidian desktop.");
            return;
          }

          this.isImporting = true;
          new Notice("Fetching course data…");

          try {
            const course = await scrapeCourse(url);
            const folder = `Courses/Coursera/${sanitize(course.title)}`;
            await saveCourse(this.app.vault, folder, course);
            new Notice(`Course imported: ${folder}`);
          } catch (err) {
            console.error("[CourseTracker]", err);
            const message = err instanceof Error ? err.message : "Unknown error.";
            new Notice(`Failed to import course: ${message}`);
          } finally {
            this.isImporting = false;
          }
        }).open();
      },
    });
  }

  onunload() {}
}
