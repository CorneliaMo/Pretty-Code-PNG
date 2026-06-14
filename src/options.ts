import { dirname, extname, join, parse } from "node:path";

import { Command, CommanderError, Option } from "commander";

import { DEFAULT_THEME, normalizeTheme } from "./theme.js";

export const PACKAGE_VERSION = "0.1.0";

export interface CliOptions {
  inputPath?: string;
  outputPath?: string;
  language?: string;
  theme: string;
  fontSize: number;
  fontPath?: string;
  width?: number;
  height?: number;
  lineNumbers: boolean;
}

function positiveInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Expected a positive integer, received: ${value}`);
  }
  return parsed;
}

function createCommand(): Command {
  return new Command()
    .name("code-render")
    .version(PACKAGE_VERSION)
    .description("Render syntax-highlighted source code to a PNG image.")
    .argument("[input-file]", "code file to render; reads stdin when omitted")
    .option("-o, --output <path>", "output PNG path")
    .option("-l, --language <language>", "syntax language override")
    .option("-t, --theme <theme>", "Shiki color theme", DEFAULT_THEME)
    .addOption(
      new Option("--font-size <pixels>", "font size in pixels")
        .default(16)
        .argParser(positiveInteger),
    )
    .option("--font <path>", "external font file")
    .addOption(new Option("--width <pixels>", "output width").argParser(positiveInteger))
    .addOption(new Option("--height <pixels>", "output height").argParser(positiveInteger))
    .option("--line-numbers", "show line numbers", false);
}

export function helpText(): string {
  return createCommand().helpInformation();
}

export function defaultOutputPath(inputPath: string | undefined): string {
  if (!inputPath) {
    return join(process.cwd(), "code.png");
  }

  const extension = extname(inputPath);
  const basename = parse(inputPath).name;
  return join(dirname(inputPath), `${basename || inputPath.slice(0, -extension.length)}.png`);
}

export function parseCliOptions(argv: readonly string[]): CliOptions {
  const program = createCommand()
    .exitOverride()
    .configureOutput({
      writeErr: () => undefined,
      writeOut: () => undefined,
    });

  try {
    program.parse([...argv], { from: "user" });
  } catch (error) {
    if (error instanceof CommanderError) {
      throw new Error(error.message);
    }
    throw error;
  }

  const raw = program.opts<{
    output?: string;
    language?: string;
    theme: string;
    fontSize: number;
    font?: string;
    width?: number;
    height?: number;
    lineNumbers: boolean;
  }>();

  if (raw.width !== undefined && raw.height !== undefined) {
    throw new Error("--width and --height cannot be used together");
  }

  const inputPath = program.args[0];
  return {
    ...(inputPath ? { inputPath } : {}),
    ...(raw.output ? { outputPath: raw.output } : {}),
    ...(raw.language ? { language: raw.language } : {}),
    theme: normalizeTheme(raw.theme),
    fontSize: raw.fontSize,
    ...(raw.font ? { fontPath: raw.font } : {}),
    ...(raw.width !== undefined ? { width: raw.width } : {}),
    ...(raw.height !== undefined ? { height: raw.height } : {}),
    lineNumbers: raw.lineNumbers,
  };
}
