import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable, Writable } from "node:stream";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { main, runCli } from "../src/cli.js";

describe("runCli", () => {
  it("renders stdin to an explicitly selected PNG", async () => {
    const directory = await mkdtemp(join(tmpdir(), "code-renderer-cli-"));
    const output = join(directory, "stdin.png");

    await expect(
      runCli(
        ["--language", "javascript", "--height", "240", "--output", output],
        Readable.from(["console.log('hello');\n"]),
      ),
    ).resolves.toBe(output);

    const metadata = await sharp(output).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.height).toBe(240);
  });

  it("derives the output path from a file and overwrites it", async () => {
    const directory = await mkdtemp(join(tmpdir(), "code-renderer-cli-"));
    const input = join(directory, "main.py");
    const output = join(directory, "main.png");
    await writeFile(input, "print('hello')\n", "utf8");
    await writeFile(output, "old content", "utf8");

    await expect(runCli([input])).resolves.toBe(output);

    expect((await readFile(output)).subarray(1, 4).toString()).toBe("PNG");
  });
});

describe("main", () => {
  it("returns a failure code and useful error message", async () => {
    let errorOutput = "";
    const stderr = new Writable({
      write(chunk, _encoding, callback) {
        errorOutput += chunk.toString();
        callback();
      },
    });

    await expect(
      main(["--width", "100", "--height", "100"], Readable.from([]), stderr),
    ).resolves.toBe(1);
    expect(errorOutput).toContain("--width and --height cannot be used together");
  });
});
