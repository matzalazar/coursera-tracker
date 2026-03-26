// src/writer.ts

import { TFile, Vault, normalizePath } from "obsidian";
import { sanitize } from "./utils";
import type { Course } from "./types";

function quoteYaml(value: string): string {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n");

  return `"${escaped}"`;
}

/**
 * Ensures all folders in the given path exist, then creates or overwrites a file.
 * Folder segments are created one by one to satisfy Obsidian's vault API.
 */
async function writeToVault(
  vault: Vault,
  folderPath: string,
  fileName: string,
  content: string
): Promise<void> {
  let currentPath = "";
  for (const part of folderPath.split("/")) {
    currentPath = normalizePath(currentPath ? `${currentPath}/${part}` : part);
    if (!vault.getAbstractFileByPath(currentPath)) {
      await vault.createFolder(currentPath);
    }
  }

  const fullPath = normalizePath(`${folderPath}/${fileName}`);
  const existing = vault.getAbstractFileByPath(fullPath);
  if (existing instanceof TFile) {
    await vault.modify(existing, content);
  } else {
    await vault.create(fullPath, content);
  }
}

/**
 * Generates the full vault folder structure and markdown files for a course.
 *
 * Output layout:
 *
 *   {baseFolder}/
 *     _index.md
 *     00 Module Title/
 *       Videos/
 *         00 Lesson Title.md
 *         01 Another Lesson.md
 *       Readings/
 *         00 Some Reading.md
 *     01 Another Module/
 *       ...
 *
 * @param vault      - The active Obsidian vault.
 * @param baseFolder - Root folder path for this course (e.g. "Courses/Coursera/My Course").
 * @param course     - Parsed course data from the scraper.
 */
export async function saveCourse(vault: Vault, baseFolder: string, course: Course): Promise<void> {
  const indexLines: string[] = [
    `# ${course.title}\n`,
    `**Course link:** [Go to course](${course.url})\n`,
    `---\n`,
  ];

  for (let i = 0; i < course.modules.length; i++) {
    const mod = course.modules[i];
    if (!mod.lessons?.length) continue;

    const modSlug = `${String(i).padStart(2, "0")} ${sanitize(mod.title)}`;
    indexLines.push(`## ${mod.title}\n`);

    // Group lessons by content type, preserving encounter order.
    const typeOrder: string[] = [];
    const byType = new Map<string, typeof mod.lessons>();
    for (const lesson of mod.lessons) {
      if (!byType.has(lesson.type)) {
        typeOrder.push(lesson.type);
        byType.set(lesson.type, []);
      }
      byType.get(lesson.type)!.push(lesson);
    }

    for (const type of typeOrder) {
      const typeLessons = byType.get(type)!;
      const typeSlug = sanitize(type);
      indexLines.push(`### ${type}\n`);

      for (let j = 0; j < typeLessons.length; j++) {
        const lesson = typeLessons[j];
        const lessonSlug = `${String(j).padStart(2, "0")} ${sanitize(lesson.title)}`;

        indexLines.push(`- [[${modSlug}/${typeSlug}/${lessonSlug}]] · _${lesson.duration}_`);

        const frontmatter = [
          `---`,
          `title: ${quoteYaml(lesson.title)}`,
          `type: ${quoteYaml(lesson.type)}`,
          `duration: ${quoteYaml(lesson.duration)}`,
          `completed: false`,
          `date: null`,
          `---`,
        ].join("\n");

        const body = `# ${lesson.title}\n\nType: ${lesson.type}\nDuration: ${lesson.duration}\n`;

        await writeToVault(
          vault,
          `${baseFolder}/${modSlug}/${typeSlug}`,
          `${lessonSlug}.md`,
          `${frontmatter}\n\n${body}`
        );
      }

      indexLines.push("");
    }
  }

  await writeToVault(vault, baseFolder, "_index.md", indexLines.join("\n"));
}
