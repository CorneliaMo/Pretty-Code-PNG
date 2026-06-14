import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { create, type Font } from "fontkit";

export interface FontFace {
  font: Font;
}

export interface FontSet {
  primary: FontFace;
  fallback: FontFace;
}

export interface TextPathResult {
  paths: string;
  width: number;
}

const bundledPrimaryUrl = new URL(
  "../assets/fonts/JetBrainsMono-Regular.woff2",
  import.meta.url,
);
const bundledFallbackUrl = new URL(
  "../assets/fonts/SarasaGothicSC-Regular.ttf",
  import.meta.url,
);

async function loadFace(pathOrUrl: string | URL): Promise<FontFace> {
  const path = pathOrUrl instanceof URL ? fileURLToPath(pathOrUrl) : pathOrUrl;
  const data = await readFile(path);
  const font = create(data);
  if ("fonts" in font) {
    throw new Error(`Font collections are not supported: ${path}`);
  }
  return { font };
}

export async function loadFontSet(externalFontPath?: string): Promise<FontSet> {
  const [primary, fallback] = await Promise.all([
    loadFace(externalFontPath ?? bundledPrimaryUrl),
    loadFace(bundledFallbackUrl),
  ]);
  return { primary, fallback };
}

function fontForCodePoint(fontSet: FontSet, codePoint: number): Font {
  return fontSet.primary.font.hasGlyphForCodePoint(codePoint)
    ? fontSet.primary.font
    : fontSet.fallback.font;
}

export function measureText(
  text: string,
  fontSet: FontSet,
  fontSize: number,
): number {
  let advance = 0;
  for (const character of text) {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined) {
      continue;
    }
    const font = fontForCodePoint(fontSet, codePoint);
    advance += font.layout(character).advanceWidth / font.unitsPerEm;
  }
  return advance * fontSize;
}

export function textToSvgPaths(
  text: string,
  fontSet: FontSet,
  fontSize: number,
  startX: number,
  baselineY: number,
): TextPathResult {
  let x = startX;
  const paths: string[] = [];

  for (const character of text) {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined) {
      continue;
    }
    const font = fontForCodePoint(fontSet, codePoint);
    const run = font.layout(character);
    const scale = fontSize / font.unitsPerEm;
    for (let index = 0; index < run.glyphs.length; index += 1) {
      const glyph = run.glyphs[index];
      const position = run.positions[index];
      if (!glyph || !position) {
        continue;
      }
      const path = glyph.path.toSVG();
      if (path.length > 0) {
        const glyphX = x + position.xOffset * scale;
        const glyphY = baselineY - position.yOffset * scale;
        paths.push(
          `<path d="${path}" transform="translate(${glyphX} ${glyphY}) scale(${scale} ${-scale})"/>`,
        );
      }
      x += position.xAdvance * scale;
    }
  }

  return { paths: paths.join(""), width: x - startX };
}
