import { spawn } from "node:child_process";
import { mkdtemp, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

interface ProcessResult {
  code: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
}

function runBuiltCli(args: string[], executable = "dist/cli.js"): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [executable, ...args], {
      cwd: process.cwd(),
      env: {
        PATH: process.env.PATH,
        XDG_CACHE_HOME: join(tmpdir(), "code-renderer-cache"),
      },
      stdio: ["ignore", "pipe", "inherit"],
    });
    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code, signal) => resolve({ code, signal, stdout }));
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

    expect(result).toEqual({ code: 0, signal: null, stdout: "" });
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

  it("runs through an npm-style symbolic link", async () => {
    const directory = await mkdtemp(join(tmpdir(), "code-renderer-link-"));
    const executable = join(directory, "code-render");
    await symlink(join(process.cwd(), "dist/cli.js"), executable);

    const result = await runBuiltCli(["--width", "100", "--height", "100"], executable);

    expect(result.code).toBe(1);
    expect(result.signal).toBeNull();
  });
});
