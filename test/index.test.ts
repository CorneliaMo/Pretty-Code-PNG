import { describe, expect, it } from "vitest";

import { packageName } from "../src/index.js";

describe("project", () => {
  it("exports its package name", () => {
    expect(packageName).toBe("code-renderer");
  });
});
