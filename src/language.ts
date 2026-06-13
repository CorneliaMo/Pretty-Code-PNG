import { extname } from "node:path";

import hljs from "highlight.js";
import { bundledLanguagesInfo } from "shiki";

const plainTextLanguages = new Set(["text", "txt", "plaintext", "plain"]);
const languageAliases = new Map<string, string>();

for (const language of bundledLanguagesInfo) {
  languageAliases.set(language.id.toLowerCase(), language.id);
  for (const alias of language.aliases ?? []) {
    languageAliases.set(alias.toLowerCase(), language.id);
  }
}

const extensionOverrides: Record<string, string> = {
  cjs: "javascript",
  h: "c",
  mjs: "javascript",
  pyw: "python",
  rs: "rust",
  tsx: "tsx",
};

export function normalizeLanguage(language: string): string {
  const normalized = language.toLowerCase().replace(/^\./, "");
  if (plainTextLanguages.has(normalized)) {
    return "text";
  }

  const resolved = languageAliases.get(normalized);
  if (!resolved) {
    throw new Error(`Unknown language: ${language}`);
  }
  return resolved;
}

export function languageFromFile(filePath: string): string {
  const extension = extname(filePath).slice(1).toLowerCase();
  if (!extension) {
    return "text";
  }

  const candidate = extensionOverrides[extension] ?? extension;
  try {
    return normalizeLanguage(candidate);
  } catch {
    return "text";
  }
}

export function detectLanguage(code: string): string {
  const detected = hljs.highlightAuto(code).language;
  if (!detected) {
    return "text";
  }

  try {
    return normalizeLanguage(detected);
  } catch {
    return "text";
  }
}
