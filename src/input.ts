import { readFile } from "node:fs/promises";
import type { Readable } from "node:stream";

import { detectLanguage, languageFromFile, normalizeLanguage } from "./language.js";

export interface CodeInput {
  code: string;
  language: string;
  sourcePath?: string;
}

async function readStream(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function normalizeCode(code: string): string {
  const normalized = code.replace(/(?:\r?\n)+$/, "");
  if (normalized.length === 0) {
    throw new Error("Input code is empty");
  }
  return normalized;
}

export async function loadCode(
  inputPath: string | undefined,
  languageOverride: string | undefined,
  stdin: Readable = process.stdin,
): Promise<CodeInput> {
  const rawCode = inputPath
    ? await readFile(inputPath, "utf8")
    : await readStream(stdin);
  const code = normalizeCode(rawCode);
  const language = languageOverride
    ? normalizeLanguage(languageOverride)
    : inputPath
      ? languageFromFile(inputPath)
      : detectLanguage(code);

  return inputPath ? { code, language, sourcePath: inputPath } : { code, language };
}
