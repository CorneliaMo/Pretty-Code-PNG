export { loadCode, type CodeInput } from "./input.js";
export {
  detectLanguage,
  languageFromFile,
  normalizeLanguage,
} from "./language.js";
export {
  defaultOutputPath,
  helpText,
  PACKAGE_VERSION,
  parseCliOptions,
  type CliOptions,
} from "./options.js";
export {
  loadFontSet,
  measureText,
  textToSvgPaths,
  type FontFace,
  type FontSet,
  type TextPathResult,
} from "./fonts.js";
export {
  renderPng,
  renderSvg,
  type RenderOptions,
  type SvgResult,
} from "./render.js";
export { main, runCli } from "./cli.js";
export {
  AVAILABLE_THEMES,
  DEFAULT_THEME,
  normalizeTheme,
} from "./theme.js";
