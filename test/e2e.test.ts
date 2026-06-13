import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

interface ProcessResult {
  code: number | null;
  signal: NodeJS.Signals | null;
}

function runBuiltCli(args: string[]): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("node", ["dist/cli.js", ...args], {
      cwd: process.cwd(),
      env: {
        PATH: process.env.PATH,
        XDG_CACHE_HOME: join(tmpdir(), "code-renderer-cache"),
      },
      stdio: ["ignore", "ignore", "inherit"],
    });
    child.on("error", reject);
    child.on("close", (code, signal) => resolve({ code, signal }));
  });
}

describe("built CLI", () => {
  it("renders a code file with highlighting, line numbers, and a target width", async () => {
    const directory = await mkdtemp(join(tmpdir(), "code-renderer-e2e-"));
    const input = join(directory, "example.py");
    const output = join(directory, "report-code.png");
    await writeFile(input, 'def greeting(name):\n    return f"你好, {name}"\n', "utf8");

    const result = await runBuiltCli(
      [input, "--line-numbers", "--width", "900", "-o", output],
    );

    expect(result).toEqual({ code: 0, signal: null });
    const metadata = await sharp(output).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(900);
    expect(metadata.height).toBeGreaterThan(0);
  });

  it("reports invalid options with a non-zero exit code", async () => {
    const result = await runBuiltCli(["--width", "100", "--height", "100"]);

    expect(result.code).toBe(1);
    expect(result.signal).toBeNull();
  });
});
