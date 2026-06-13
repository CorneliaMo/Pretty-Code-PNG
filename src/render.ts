import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

import sharp from "sharp";
import {
  codeToTokens,
  type BundledLanguage,
  type ThemedToken,
} from "shiki";

import { fontCss, loadFontSet, measureText } from "./fonts.js";

const PADDING = 20;
const BORDER = 1;
const MAX_DIMENSION = 32_768;

export interface RenderOptions {
  code: string;
  language: string;
  fontSize?: number;
  fontPath?: string;
  lineNumbers?: boolean;
  width?: number;
  height?: number;
}

export interface SvgResult {
  svg: string;
  width: number;
  height: number;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function expandTabs(value: string): string {
  return value.replaceAll("\t", "    ");
}

function renderToken(token: ThemedToken): string {
  const color = token.color ? ` fill="${escapeXml(token.color)}"` : "";
  return `<tspan${color}>${escapeXml(expandTabs(token.content))}</tspan>`;
}

function validateDimension(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0 || value > MAX_DIMENSION) {
    throw new Error(`${label} must be a positive integer no greater than ${MAX_DIMENSION}`);
  }
}

export async function renderSvg(options: RenderOptions): Promise<SvgResult> {
  const fontSize = options.fontSize ?? 16;
  validateDimension(fontSize, "Font size");
  if (options.width !== undefined && options.height !== undefined) {
    throw new Error("Width and height cannot be used together");
  }
  if (options.width !== undefined) validateDimension(options.width, "Width");
  if (options.height !== undefined) validateDimension(options.height, "Height");

  const fonts = await loadFontSet(options.fontPath);
  const highlighted = await codeToTokens(options.code, {
    lang: options.language as BundledLanguage,
    theme: "github-light",
  });
  const lines = highlighted.tokens;
  const lineHeight = fontSize * 1.5;
  const digits = String(lines.length).length;
  const plainLines = options.code.split("\n").map(expandTabs);
  const codeWidth = Math.max(
    ...plainLines.map((line) => measureText(line, fonts, fontSize)),
    fontSize,
  );
  const lineNumberWidth = options.lineNumbers
    ? measureText("9".repeat(digits), fonts, fontSize)
    : 0;
  const lineNumberGap = options.lineNumbers ? measureText("  ", fonts, fontSize) : 0;
  const contentWidth = lineNumberWidth + lineNumberGap + codeWidth;
  const naturalWidth = Math.ceil(contentWidth + PADDING * 2 + BORDER * 2);
  const naturalHeight = Math.ceil(lines.length * lineHeight + PADDING * 2 + BORDER * 2);
  validateDimension(naturalWidth, "Natural width");
  validateDimension(naturalHeight, "Natural height");

  const text = lines
    .map((tokens, index) => {
      const y = BORDER + PADDING + fontSize + index * lineHeight;
      const contentStart = BORDER + PADDING + lineNumberWidth + lineNumberGap;
      const lineNumber = options.lineNumbers
        ? `<text x="${BORDER + PADDING + lineNumberWidth}" y="${y}" text-anchor="end" fill="#6e7781">${index + 1}</text>\n`
        : "";
      return `${lineNumber}<text xml:space="preserve" x="${contentStart}" y="${y}">${tokens.map(renderToken).join("")}</text>`;
    })
    .join("\n");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${naturalWidth}" height="${naturalHeight}" viewBox="0 0 ${naturalWidth} ${naturalHeight}">
<style>
${fontCss(fonts, options.code)}
text { font-family: "CodePrimary", "CodeFallback"; font-size: ${fontSize}px; font-variant-ligatures: none; white-space: pre; }
</style>
<rect x="0.5" y="0.5" width="${naturalWidth - 1}" height="${naturalHeight - 1}" fill="#ffffff" stroke="#000000" stroke-width="1"/>
${text}
</svg>`;

  return { svg, width: naturalWidth, height: naturalHeight };
}

export async function renderPng(
  outputPath: string,
  options: RenderOptions,
): Promise<void> {
  const result = await renderSvg(options);
  let image = sharp(Buffer.from(result.svg));
  if (options.width !== undefined) {
    image = image.resize({ width: options.width });
  } else if (options.height !== undefined) {
    image = image.resize({ height: options.height });
  }
  await mkdir(dirname(outputPath), { recursive: true });
  await image.png().toFile(outputPath);
}
