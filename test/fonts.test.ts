import { describe, expect, it } from "vitest";

import {
  loadFontSet,
  measureText,
  textToSvgPaths,
} from "../src/fonts.js";

describe("bundled fonts", () => {
  it("loads JetBrains Mono with a Chinese monospace fallback", async () => {
    const fonts = await loadFontSet();

    expect(fonts.primary.font.hasGlyphForCodePoint("A".codePointAt(0)!)).toBe(true);
    expect(fonts.fallback.font.hasGlyphForCodePoint("中".codePointAt(0)!)).toBe(true);
  });

  it("measures Latin and Chinese text", async () => {
    const fonts = await loadFontSet();

    expect(measureText("const value", fonts, 16)).toBeGreaterThan(0);
    expect(measureText("中文注释", fonts, 16)).toBeGreaterThan(0);
  });

  it("converts mixed Chinese text and punctuation to glyph paths", async () => {
    const fonts = await loadFontSet();
    const rendered = textToSvgPaths("分析过程，与 reduction", fonts, 16, 20, 40);

    expect(rendered.width).toBeGreaterThan(0);
    expect(rendered.paths).toContain("<path");
    expect(rendered.paths).not.toContain("分析过程");
  });
});
