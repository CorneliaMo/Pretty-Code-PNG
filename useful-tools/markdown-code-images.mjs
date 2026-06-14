#!/usr/bin/env node
/* global process */

import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

function usage() {
  return `Usage: node markdown-code-images.mjs <input.md> [output.md] [-- <code-render options...>]

Render fenced code blocks with the globally installed code-render command.

Defaults:
  output.md    <input-name>.with-code-images.md
  images      code-images/<input-name>-code-001.png

Example:
  node markdown-code-images.mjs report.md -- --theme catppuccin-mocha --line-numbers

The script manages code-render input, output, and language options itself.
`;
}

function markdownPath(path) {
  return path.split(sep).join("/");
}

function outputPathFor(inputPath) {
  const extension = extname(inputPath);
  const name = basename(inputPath, extension);
  return join(dirname(inputPath), `${name}.with-code-images${extension || ".md"}`);
}

function languageFromInfo(info) {
  const value = info.trim().split(/\s+/, 1)[0] ?? "";
  return value.replace(/^\{?\.?/, "").replace(/\}?$/, "") || undefined;
}

function validateForwardedOptions(options) {
  const reserved = new Set([
    "--help",
    "-h",
    "--language",
    "-l",
    "--output",
    "-o",
    "--version",
    "-V",
  ]);
  const conflict = options.find(
    (option) =>
      reserved.has(option) ||
      option.startsWith("--language=") ||
      option.startsWith("--output="),
  );
  if (conflict) {
    throw new Error(`Cannot forward reserved code-render option: ${conflict}`);
  }
}

function parseArguments(argv) {
  const separator = argv.indexOf("--");
  const scriptArguments = separator >= 0 ? argv.slice(0, separator) : argv;
  const forwardedOptions = separator >= 0 ? argv.slice(separator + 1) : [];
  validateForwardedOptions(forwardedOptions);
  return { scriptArguments, forwardedOptions };
}

async function runCodeRender(code, outputPath, language, forwardedOptions) {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "markdown-code-images-"));
  const temporaryCode = join(temporaryDirectory, "code.txt");
  await writeFile(temporaryCode, code, "utf8");
  try {
    await new Promise((resolvePromise, reject) => {
      const args = [temporaryCode, ...forwardedOptions, "--output", outputPath];
      if (language) {
        args.push("--language", language);
      }
      const child = spawn("code-render", args, {
        stdio: ["ignore", "ignore", "pipe"],
      });
      let stderr = "";
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
      child.on("error", (error) => {
        reject(
          error.code === "ENOENT"
            ? new Error("code-render was not found in PATH; install it globally first")
            : error,
        );
      });
      child.on("close", (codeValue) => {
        if (codeValue === 0) {
          resolvePromise();
        } else {
          reject(new Error(stderr.trim() || `code-render exited with code ${codeValue}`));
        }
      });
    });
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

export async function convertMarkdown(input, output, forwardedOptions = []) {
  validateForwardedOptions(forwardedOptions);
  const inputPath = resolve(input);
  const outputPath = resolve(output ?? outputPathFor(inputPath));
  if (inputPath === outputPath) {
    throw new Error("Output Markdown path must differ from input path");
  }

  const markdown = await readFile(inputPath, "utf8");
  const inputName = basename(inputPath, extname(inputPath));
  const imageDirectory = join(dirname(inputPath), "code-images");
  const lines = markdown.match(/.*(?:\r?\n|$)/g)?.filter(Boolean) ?? [];
  const rendered = [];
  let index = 0;
  let cursor = 0;

  while (cursor < lines.length) {
    const opening = lines[cursor];
    const match = opening?.match(/^ {0,3}(`{3,})([^\r\n]*)\r?\n?$/);
    if (!match) {
      rendered.push(opening ?? "");
      cursor += 1;
      continue;
    }

    const fence = match[1];
    const language = languageFromInfo(match[2] ?? "");
    let closingIndex = cursor + 1;
    while (closingIndex < lines.length) {
      const closing = lines[closingIndex]?.match(/^ {0,3}(`{3,})\s*\r?\n?$/);
      if (closing?.[1] && closing[1].length >= fence.length) {
        break;
      }
      closingIndex += 1;
    }
    if (closingIndex >= lines.length) {
      rendered.push(opening ?? "");
      cursor += 1;
      continue;
    }

    const code = lines.slice(cursor + 1, closingIndex).join("").replace(/(?:\r?\n)+$/, "");
    if (code.length === 0) {
      rendered.push(...lines.slice(cursor, closingIndex + 1));
      cursor = closingIndex + 1;
      continue;
    }

    index += 1;
    await mkdir(imageDirectory, { recursive: true });
    const imagePath = join(
      imageDirectory,
      `${inputName}-code-${String(index).padStart(3, "0")}.png`,
    );
    await runCodeRender(code, imagePath, language, forwardedOptions);
    const imageReference = markdownPath(relative(dirname(outputPath), imagePath));
    rendered.push(`![Rendered code block ${index}](${imageReference})\n`);
    cursor = closingIndex + 1;
  }

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, rendered.join(""), "utf8");
  return { outputPath, imageCount: index };
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const { scriptArguments, forwardedOptions } = parseArguments(argv);
    if (scriptArguments.includes("--help") || scriptArguments.includes("-h")) {
      process.stdout.write(usage());
      return 0;
    }
    if (scriptArguments.length < 1 || scriptArguments.length > 2) {
      process.stderr.write(usage());
      return 1;
    }
    const result = await convertMarkdown(
      scriptArguments[0],
      scriptArguments[1],
      forwardedOptions,
    );
    process.stdout.write(`Rendered ${result.imageCount} code block(s) to ${result.outputPath}\n`);
    return 0;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

const directRun =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (directRun) {
  process.exitCode = await main();
}
