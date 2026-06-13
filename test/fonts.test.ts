import { describe, expect, it } from "vitest";

import { fontCss, loadFontSet, measureText } from "../src/fonts.js";

describe("bundled fonts", () => {
  it("loads JetBrains Mono with a Chinese monospace fallback", async () => {
    const fonts = await loadFontSet();

    expect(fonts.primary.font.hasGlyphForCodePoint("A".codePointAt(0)!)).toBe(true);
    expect(fonts.fallback.font.hasGlyphForCodePoint("中".codePointAt(0)!)).toBe(true);
  });

  it("embeds both fonts in CSS", async () => {
    const css = fontCss(await loadFontSet());

    expect(css).toContain('font-family: "CodePrimary"');
    expect(css).toContain('font-family: "CodeFallback"');
    expect(css).toContain("data:font/woff2;base64,");
    expect(css).toContain("data:font/ttf;base64,");
  });

  it("measures Latin and Chinese text", async () => {
    const fonts = await loadFontSet();

    expect(measureText("const value", fonts, 16)).toBeGreaterThan(0);
    expect(measureText("中文注释", fonts, 16)).toBeGreaterThan(0);
  });
});
