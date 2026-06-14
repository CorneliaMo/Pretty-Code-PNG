import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { renderPng, renderSvg } from "../src/render.js";

describe("renderSvg", () => {
  it("renders highlighted code without wrapping inside a square black frame", async () => {
    const result = await renderSvg({
      code: "const veryLongName = 42;\n// 中文注释",
      language: "typescript",
    });

    expect(result.svg).toContain('stroke="#000000"');
    expect(result.svg).toContain("<path");
    expect(result.svg).not.toContain("@font-face");
    expect(result.svg).not.toContain("data:font/");
    expect(result.svg).not.toContain("中文注释");
    expect(result.svg).not.toContain("<foreignObject");
    expect(result.width).toBeGreaterThan(200);
  });

  it("optionally renders line numbers", async () => {
    const result = await renderSvg({
      code: "one\ntwo",
      language: "text",
      lineNumbers: true,
    });

    expect(result.svg.match(/opacity="0.65"/g)).toHaveLength(2);
  });

  it("right-aligns multi-digit line numbers against a fixed code start", async () => {
    const result = await renderSvg({
      code: Array.from({ length: 12 }, (_, index) => `line ${index + 1}`).join("\n"),
      language: "text",
      lineNumbers: true,
    });
    expect(result.svg.match(/opacity="0.65"/g)).toHaveLength(12);
  });

  it("applies the selected theme background and token colors", async () => {
    const result = await renderSvg({
      code: "const value = 42;",
      language: "typescript",
      theme: "catppuccin-mocha",
    });

    expect(result.svg).toContain('fill="#1e1e2e" stroke="#000000"');
    expect(result.svg).toContain('fill="#CBA6F7"');
  });

  it("preserves indentation, consecutive spaces, and expanded tabs", async () => {
    const result = await renderSvg({
      code: "root\n    indented  value\n\tTabbed",
      language: "text",
    });

    expect(result.width).toBeGreaterThan(150);
    expect(result.svg).not.toContain("indented");
    expect(result.svg).not.toContain("Tabbed");
  });

  it("rejects simultaneous target dimensions", async () => {
    await expect(
      renderSvg({ code: "code", language: "text", width: 100, height: 100 }),
    ).rejects.toThrow("cannot be used together");
  });
});

describe("renderPng", () => {
  it("exports PNG and preserves aspect ratio when width is specified", async () => {
    const directory = await mkdtemp(join(tmpdir(), "code-renderer-"));
    const output = join(directory, "result.png");
    await renderPng(output, {
      code: "fn main() {\n    println!(\"hello\");\n}",
      language: "rust",
      width: 640,
    });

    const metadata = await sharp(output).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(640);
    expect(metadata.height).toBeGreaterThan(0);
  });

  it("exports Chinese, punctuation, and mixed-language code without font subsetting", async () => {
    const directory = await mkdtemp(join(tmpdir(), "code-renderer-chinese-"));
    const output = join(directory, "chinese.png");

    await expect(
      renderPng(output, {
        code: 'fn main() { println!("分析过程与归约过程，mixed text。"); }',
        language: "rust",
      }),
    ).resolves.toBeUndefined();

    const metadata = await sharp(output).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBeGreaterThan(300);
  });
});
