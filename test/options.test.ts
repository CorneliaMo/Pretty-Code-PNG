import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { defaultOutputPath, parseCliOptions } from "../src/options.js";

describe("parseCliOptions", () => {
  it("provides report-friendly defaults", () => {
    expect(parseCliOptions([])).toEqual({
      fontSize: 16,
      lineNumbers: false,
    });
  });

  it("parses supported options", () => {
    expect(
      parseCliOptions([
        "main.rs",
        "--output",
        "result.png",
        "--language",
        "rust",
        "--font-size",
        "20",
        "--font",
        "custom.ttf",
        "--width",
        "1200",
        "--line-numbers",
      ]),
    ).toEqual({
      inputPath: "main.rs",
      outputPath: "result.png",
      language: "rust",
      fontSize: 20,
      fontPath: "custom.ttf",
      width: 1200,
      lineNumbers: true,
    });
  });

  it("rejects simultaneous width and height", () => {
    expect(() => parseCliOptions(["--width", "800", "--height", "600"])).toThrow(
      "--width and --height cannot be used together",
    );
  });

  it.each(["0", "-1", "1.5", "invalid"])("rejects invalid dimensions: %s", (value) => {
    expect(() => parseCliOptions(["--width", value])).toThrow("positive integer");
  });

});

describe("defaultOutputPath", () => {
  it("uses code.png for stdin", () => {
    expect(defaultOutputPath(undefined)).toBe(resolve("code.png"));
  });

  it("places file output alongside the input", () => {
    expect(defaultOutputPath("/tmp/example/main.ts")).toBe("/tmp/example/main.png");
  });
});
