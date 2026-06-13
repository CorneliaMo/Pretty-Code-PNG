import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";

import { create, type Font } from "fontkit";

export interface FontFace {
  family: string;
  data: Buffer;
  font: Font;
  mimeType: string;
}

export interface FontSet {
  primary: FontFace;
  fallback: FontFace;
}

const bundledPrimaryUrl = new URL(
  "../assets/fonts/JetBrainsMono-Regular.woff2",
  import.meta.url,
);
const bundledFallbackUrl = new URL(
  "../assets/fonts/SarasaGothicSC-Regular.ttf",
  import.meta.url,
);

function mimeTypeForPath(path: string): string {
  switch (extname(path).toLowerCase()) {
    case ".otf":
      return "font/otf";
    case ".ttf":
      return "font/ttf";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    default:
      throw new Error("Font must be a .ttf, .otf, .woff, or .woff2 file");
  }
}

async function loadFace(
  family: string,
  pathOrUrl: string | URL,
): Promise<FontFace> {
  const path = pathOrUrl instanceof URL ? fileURLToPath(pathOrUrl) : pathOrUrl;
  const data = await readFile(path);
  const font = create(data);
  if ("fonts" in font) {
    throw new Error(`Font collections are not supported: ${path}`);
  }
  return { family, data, font, mimeType: mimeTypeForPath(path) };
}

export async function loadFontSet(externalFontPath?: string): Promise<FontSet> {
  const [primary, fallback] = await Promise.all([
    loadFace("CodePrimary", externalFontPath ?? bundledPrimaryUrl),
    loadFace("CodeFallback", bundledFallbackUrl),
  ]);
  return { primary, fallback };
}

function subsetFace(face: FontFace, text: string): FontFace {
  const subset = face.font.createSubset();
  for (const character of new Set(text)) {
    const codePoint = character.codePointAt(0);
    if (codePoint !== undefined && face.font.hasGlyphForCodePoint(codePoint)) {
      subset.includeGlyph(face.font.glyphForCodePoint(codePoint));
    }
  }
  return {
    ...face,
    data: Buffer.from(subset.encode()),
    mimeType: "font/ttf",
  };
}

export function fontCss(fontSet: FontSet, text?: string): string {
  return [fontSet.primary, fontSet.fallback]
    .map((face) => (text === undefined ? face : subsetFace(face, text)))
    .map(
      (face) => `@font-face {
  font-family: "${face.family}";
  src: url(data:${face.mimeType};base64,${face.data.toString("base64")});
  font-style: normal;
  font-weight: 400;
}`,
    )
    .join("\n");
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
    const font = fontSet.primary.font.hasGlyphForCodePoint(codePoint)
      ? fontSet.primary.font
      : fontSet.fallback.font;
    advance += font.layout(character).advanceWidth / font.unitsPerEm;
  }
  return advance * fontSize;
}
