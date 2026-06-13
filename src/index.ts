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
  fontCss,
  loadFontSet,
  measureText,
  type FontFace,
  type FontSet,
} from "./fonts.js";
export {
  renderPng,
  renderSvg,
  type RenderOptions,
  type SvgResult,
} from "./render.js";
export { main, runCli } from "./cli.js";
