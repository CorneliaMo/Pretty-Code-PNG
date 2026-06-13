#!/usr/bin/env node

import type { Readable, Writable } from "node:stream";
import { pathToFileURL } from "node:url";

import { loadCode } from "./input.js";
import { defaultOutputPath, parseCliOptions } from "./options.js";
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
): Promise<number> {
  try {
    await runCli(argv, stdin);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    stderr.write(`code-render: ${message}\n`);
    return 1;
  }
}

const isDirectRun =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  process.exitCode = await main();
}
