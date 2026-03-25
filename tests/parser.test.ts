// tests/parser.test.ts

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";
import { parseModules, parseCourse } from "../src/scrapers/parser";

const fixtureHtml = fs.readFileSync(
  path.join(__dirname, "fixtures/course.html"),
  "utf8"
);

// ── parseModules ──────────────────────────────────────────────────────────────

describe("parseModules", () => {
  const $ = cheerio.load(fixtureHtml);
  const modules = parseModules($);

  // Fixture: 2 weeks with content + 1 empty accordion → 2 modules
  it("returns one module per week, skipping empty accordions", () => {
    expect(modules).toHaveLength(2);
  });

  it("uses the accordion h3 as the module title", () => {
    expect(modules[0].title).toBe("Introduction to Machine Learning");
    expect(modules[1].title).toBe("Supervised Learning");
  });

  it("collects all lessons across content-type groups within a module", () => {
    // Week 1: 2 videos + 1 reading = 3 lessons
    expect(modules[0].lessons).toHaveLength(3);
    // Week 2: 1 video + 2 assignments = 3 lessons
    expect(modules[1].lessons).toHaveLength(3);
  });

  it("preserves lesson order: type groups appear in document order", () => {
    const titles = modules[0].lessons.map((l) => l.title);
    expect(titles).toEqual([
      "Welcome to the Course",
      "What is Machine Learning?",
      "Course Overview",
    ]);
  });

  it("assigns the correct type from the group header to each lesson", () => {
    expect(modules[0].lessons[0].type).toBe("Video");
    expect(modules[0].lessons[1].type).toBe("Video");
    expect(modules[0].lessons[2].type).toBe("Reading");
    expect(modules[1].lessons[0].type).toBe("Video");
    expect(modules[1].lessons[1].type).toBe("Assignment");
    expect(modules[1].lessons[2].type).toBe("Assignment");
  });

  it("parses lesson durations correctly", () => {
    expect(modules[0].lessons[0].duration).toBe("4 min");
    expect(modules[0].lessons[2].duration).toBe("10 min");
    expect(modules[1].lessons[2].duration).toBe("60 min");
  });

  it("parses lesson titles correctly", () => {
    expect(modules[1].lessons[0].title).toBe("Linear Regression");
    expect(modules[1].lessons[1].title).toBe("Lab: Linear Regression");
  });
});

// ── parseCourse ───────────────────────────────────────────────────────────────

describe("parseCourse", () => {
  const url = "https://www.coursera.org/learn/machine-learning";

  it("extracts the course title from h1", () => {
    const course = parseCourse(fixtureHtml, url);
    expect(course.title).toBe("Machine Learning Specialization");
  });

  it("includes the original URL", () => {
    const course = parseCourse(fixtureHtml, url);
    expect(course.url).toBe(url);
  });

  it("throws when no content groups are found", () => {
    const emptyHtml = "<html><body><h1>Some Course</h1></body></html>";
    expect(() => parseCourse(emptyHtml, url)).toThrow("No content groups found");
  });

  it("falls back to 'Untitled Course' when h1 is missing", () => {
    const noTitleHtml = `
      <html><body>
        <div data-testid="accordion-item">
          <h3>Week 1</h3>
          <div>
            <div><h5><span><span>1 video</span></span></h5></div>
            <ul><li>A Lesson • 5 min</li></ul>
          </div>
        </div>
      </body></html>
    `;
    const course = parseCourse(noTitleHtml, url);
    expect(course.title).toBe("Untitled Course");
  });
});
