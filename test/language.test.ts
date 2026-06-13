import { describe, expect, it } from "vitest";

import {
  detectLanguage,
  languageFromFile,
  normalizeLanguage,
} from "../src/language.js";

describe("language helpers", () => {
  it("normalizes aliases", () => {
    expect(normalizeLanguage("ts")).toBe("typescript");
    expect(normalizeLanguage("plaintext")).toBe("text");
  });

  it("detects languages from filenames and falls back to text", () => {
    expect(languageFromFile("main.rs")).toBe("rust");
    expect(languageFromFile("unknown.custom-extension")).toBe("text");
    expect(languageFromFile("LICENSE")).toBe("text");
  });

  it("returns a supported language for automatic detection", () => {
    expect(detectLanguage("package main\nfunc main() {}")).toBe("go");
  });
});
