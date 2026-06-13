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
    expect(result.svg).toContain("white-space: pre");
    expect(result.svg).toContain('font-family: "CodePrimary"');
    expect(result.svg).toContain("中文注释");
    expect(result.svg).not.toContain("<foreignObject");
    expect(result.width).toBeGreaterThan(200);
  });

  it("optionally renders line numbers", async () => {
    const result = await renderSvg({
      code: "one\ntwo",
      language: "text",
      lineNumbers: true,
    });

    expect(result.svg).toContain('text-anchor="end" fill="#6e7781">1</text>');
    expect(result.svg).toContain('text-anchor="end" fill="#6e7781">2</text>');
  });

  it("right-aligns multi-digit line numbers against a fixed code start", async () => {
    const result = await renderSvg({
      code: Array.from({ length: 12 }, (_, index) => `line ${index + 1}`).join("\n"),
      language: "text",
      lineNumbers: true,
    });
    const lineNumbers = [...result.svg.matchAll(/<text x="([^"]+)" y="[^"]+" text-anchor="end"/g)];
    const codeStarts = [...result.svg.matchAll(/<text xml:space="preserve" x="([^"]+)"/g)];

    expect(lineNumbers).toHaveLength(12);
    expect(new Set(lineNumbers.map((match) => match[1])).size).toBe(1);
    expect(new Set(codeStarts.map((match) => match[1])).size).toBe(1);
    expect(result.svg).toContain('text-anchor="end" fill="#6e7781">9</text>');
    expect(result.svg).toContain('text-anchor="end" fill="#6e7781">10</text>');
  });

  it("preserves indentation, consecutive spaces, and expanded tabs", async () => {
    const result = await renderSvg({
      code: "root\n    indented  value\n\tTabbed",
      language: "text",
    });

    expect(result.svg).toContain('<text xml:space="preserve"');
    expect(result.svg).toContain(">    indented  value</tspan>");
    expect(result.svg).toContain(">    Tabbed</tspan>");
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
});
