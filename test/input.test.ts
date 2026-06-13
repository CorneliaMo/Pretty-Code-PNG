import { Readable } from "node:stream";

import { describe, expect, it } from "vitest";

import { loadCode } from "../src/input.js";

describe("loadCode", () => {
  it("reads stdin, removes only trailing newlines, and honors language override", async () => {
    const input = Readable.from(["  const value = 1;\n\n"]);

    await expect(loadCode(undefined, "ts", input)).resolves.toEqual({
      code: "  const value = 1;",
      language: "typescript",
    });
  });

  it("detects stdin language when no override is supplied", async () => {
    const input = Readable.from(["fn main() { println!(\"hello\"); }\n"]);

    const result = await loadCode(undefined, undefined, input);

    expect(result.code).toBe('fn main() { println!("hello"); }');
    expect(["rust", "text"]).toContain(result.language);
  });

  it("rejects empty input", async () => {
    await expect(
      loadCode(undefined, undefined, Readable.from(["\n\n"])),
    ).rejects.toThrow("Input code is empty");
  });

  it("rejects an unknown explicit language", async () => {
    await expect(
      loadCode(undefined, "not-a-language", Readable.from(["code"])),
    ).rejects.toThrow("Unknown language");
  });
});
