import { bundledThemesInfo, type BundledTheme } from "shiki";

export const DEFAULT_THEME: BundledTheme = "github-light";
export const AVAILABLE_THEMES = bundledThemesInfo.map((theme) => theme.id).sort();

const availableThemeSet = new Set<string>(AVAILABLE_THEMES);

export function normalizeTheme(theme: string): BundledTheme {
  const normalized = theme.toLowerCase();
  if (!availableThemeSet.has(normalized)) {
    throw new Error(`Unknown theme: ${theme}. See docs/themes.md for available themes.`);
  }
  return normalized as BundledTheme;
}
