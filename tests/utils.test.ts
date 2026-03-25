// tests/utils.test.ts

import { describe, it, expect } from "vitest";
import { detectPlatform } from "../src/utils";
import { sanitize } from "../src/utils";

// ── detectPlatform ────────────────────────────────────────────────────────────

describe("detectPlatform", () => {
  it("identifies Coursera URLs", () => {
    expect(detectPlatform("https://www.coursera.org/learn/machine-learning")).toBe("coursera");
    expect(detectPlatform("https://coursera.org/specializations/deep-learning")).toBe("coursera");
  });

  it("returns unknown for unsupported URLs", () => {
    expect(detectPlatform("https://www.udemy.com/course/python")).toBe("unknown");
    expect(detectPlatform("https://edx.org/learn/python")).toBe("unknown");
    expect(detectPlatform("")).toBe("unknown");
  });
});

// ── sanitize ──────────────────────────────────────────────────────────────────

describe("sanitize", () => {
  it("title-cases each word", () => {
    expect(sanitize("machine learning")).toBe("Machine Learning");
    expect(sanitize("DEEP LEARNING")).toBe("Deep Learning");
  });

  it("removes diacritics", () => {
    expect(sanitize("Introducción al aprendizaje")).toBe("Introduccion Al Aprendizaje");
    expect(sanitize("Réseaux de neurones")).toBe("Reseaux De Neurones");
  });

  it("strips forbidden path characters", () => {
    // Forbidden chars are removed; surrounding spaces are then collapsed
    expect(sanitize('Course: "Advanced" / Topics')).toBe("Course Advanced Topics");
    expect(sanitize("File|Name?Test")).toBe("Filenametest");
  });

  it("collapses multiple spaces", () => {
    expect(sanitize("too   many   spaces")).toBe("Too Many Spaces");
  });

  it("handles null and undefined gracefully", () => {
    expect(sanitize(null)).toBe("Untitled");
    expect(sanitize(undefined)).toBe("Untitled");
    expect(sanitize("")).toBe("Untitled");
  });
});
