#!/usr/bin/env node

import type { Readable, Writable } from "node:stream";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { loadCode } from "./input.js";
import {
  defaultOutputPath,
  helpText,
  PACKAGE_VERSION,
  parseCliOptions,
} from "./options.js";
import { renderPng } from "./render.js";

export async function runCli(
  argv: readonly string[],
  stdin: Readable = process.stdin,
): Promise<string> {
  const options = parseCliOptions(argv);
  const input = await loadCode(options.inputPath, options.language, stdin);
  const outputPath = options.outputPath ?? defaultOutputPath(options.inputPath);

  await renderPng(outputPath, {
    code: input.code,
    language: input.language,
    theme: options.theme,
    fontSize: options.fontSize,
    lineNumbers: options.lineNumbers,
    ...(options.fontPath ? { fontPath: options.fontPath } : {}),
    ...(options.width !== undefined ? { width: options.width } : {}),
    ...(options.height !== undefined ? { height: options.height } : {}),
  });
  return outputPath;
}

export async function main(
  argv: readonly string[] = process.argv.slice(2),
  stdin: Readable = process.stdin,
  stderr: Writable = process.stderr,
  stdout: Writable = process.stdout,
): Promise<number> {
  if (argv.includes("--version") || argv.includes("-V")) {
    stdout.write(`${PACKAGE_VERSION}\n`);
    return 0;
  }
  if (argv.includes("--help") || argv.includes("-h")) {
    stdout.write(helpText());
    return 0;
  }
  try {
    await runCli(argv, stdin);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    stderr.write(`code-render: ${message}\n`);
    return 1;
  }
}

function isDirectRun(): boolean {
  if (process.argv[1] === undefined) {
    return false;
  }
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isDirectRun()) {
  process.exitCode = await main();
}
