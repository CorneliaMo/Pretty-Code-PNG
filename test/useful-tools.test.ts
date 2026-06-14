import { spawn } from "node:child_process";
import { chmod, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

interface ToolResult {
  code: number | null;
  stderr: string;
  stdout: string;
}

function runTool(args: string[], path: string, renderLog?: string): Promise<ToolResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["useful-tools/markdown-code-images.mjs", ...args],
      {
        cwd: process.cwd(),
        env: { ...process.env, PATH: path, ...(renderLog ? { RENDER_LOG: renderLog } : {}) },
      },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

async function createFakeCodeRender(directory: string): Promise<void> {
  const executable = join(directory, "code-render");
  await writeFile(
    executable,
    `#!${process.execPath}
import { appendFile, writeFile } from "node:fs/promises";
const chunks = [];
const args = process.argv.slice(2);
const code = await (await import("node:fs/promises")).readFile(args[0], "utf8");
const output = args[args.indexOf("--output") + 1];
const languageIndex = args.indexOf("--language");
await writeFile(output, Buffer.from("fake png"));
await appendFile(process.env.RENDER_LOG, JSON.stringify({
  code,
  language: languageIndex >= 0 ? args[languageIndex + 1] : null,
  output,
}) + "\\n");
`,
    "utf8",
  );
  await chmod(executable, 0o755);
}

describe("markdown-code-images useful tool", () => {
  it("replaces fenced code blocks with relative image references", async () => {
    const directory = await mkdtemp(join(tmpdir(), "markdown-code-images-"));
    const binDirectory = join(directory, "bin");
    const input = join(directory, "report.md");
    const log = join(directory, "render.log");
    await mkdir(binDirectory);
    await createFakeCodeRender(binDirectory);
    await writeFile(
      input,
      `# Report

\`\`\`rust
fn main() {
    println!("分析过程");
}
\`\`\`

Text between blocks.

\`\`\`\`
plain text
\`\`\`\`

\`\`\`
\`\`\`
`,
      "utf8",
    );

    const result = await runTool([input], binDirectory, log);

    expect(result.code).toBe(0);
    expect(result.stderr).toBe("");
    const output = await readFile(join(directory, "report.with-code-images.md"), "utf8");
    expect(output).toContain("![Rendered code block 1](code-images/report-code-001.png)");
    expect(output).toContain("![Rendered code block 2](code-images/report-code-002.png)");
    expect(output).toContain("```\n```");
    expect(output).not.toContain("fn main()");
    await expect(readFile(join(directory, "code-images/report-code-001.png"))).resolves.toBeTruthy();

    const calls = (await readFile(log, "utf8"))
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    expect(calls).toMatchObject([
      { language: "rust", code: 'fn main() {\n    println!("分析过程");\n}' },
      { language: null, code: "plain text" },
    ]);
  });

  it("reports when code-render is unavailable", async () => {
    const directory = await mkdtemp(join(tmpdir(), "markdown-code-images-missing-"));
    const input = join(directory, "report.md");
    await writeFile(input, "```js\nconsole.log(1)\n```\n", "utf8");

    const result = await runTool([input], directory);

    expect(result.code).toBe(1);
    expect(result.stdout).toBe("");
  });
});
