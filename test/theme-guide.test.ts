import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { AVAILABLE_THEMES } from "../src/theme.js";

describe("theme guide", () => {
  it("lists every bundled theme and references existing example images", async () => {
    const guide = await readFile("docs/themes.md", "utf8");
    const completeList = guide.match(/## All Available Theme IDs\s+```text\n([\s\S]*?)\n```/);
    expect(completeList?.[1]?.split("\n")).toEqual(AVAILABLE_THEMES);

    const images = [...guide.matchAll(/!\[[^\]]+\]\((theme-examples\/[^)]+\.png)\)/g)];
    expect(images.length).toBeGreaterThanOrEqual(10);
    await Promise.all(
      images.map((match) => access(join("docs", match[1] ?? ""))),
    );
  });
});
