// src/utils.ts

import type { Platform } from "./types";

/**
 * Detects the course platform from a given URL.
 * Returns "unknown" if the platform is not yet supported.
 */
export function detectPlatform(url: string): Platform {
  try {
    const parsed = new URL(url.trim());
    const hostname = parsed.hostname.toLowerCase();

    if (parsed.protocol !== "https:") return "unknown";
    if (hostname === "coursera.org" || hostname.endsWith(".coursera.org")) {
      return "coursera";
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Sanitizes a string for safe use as a file or folder name in the vault.
 *
 * - Removes diacritics (accented characters)
 * - Removes characters forbidden in file paths
 * - Collapses multiple spaces into one
 * - Title-cases each word for consistency
 */
export function sanitize(input: string | undefined | null): string {
  if (!input || typeof input !== "string") return "Untitled";

  const sanitized = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")     // strip diacritics
    .replace(/[\u0000-\u001f\u007f]/g, "") // strip control characters
    .replace(/[/\\?%*:|"<>\[\]#^]/g, "") // strip forbidden path and wikilink chars
    .trim()
    .replace(/\s+/g, " ")                // collapse whitespace
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return sanitized || "Untitled";
}
