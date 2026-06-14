import { describe, expect, it } from "vitest";

import {
  AVAILABLE_THEMES,
  DEFAULT_THEME,
  normalizeTheme,
} from "../src/theme.js";

describe("themes", () => {
  it("includes well-known bundled themes", () => {
    expect(DEFAULT_THEME).toBe("github-light");
    expect(AVAILABLE_THEMES).toEqual(
      expect.arrayContaining([
        "catppuccin-latte",
        "catppuccin-mocha",
        "dracula",
        "nord",
        "one-dark-pro",
        "tokyo-night",
      ]),
    );
  });

  it("normalizes theme names and rejects unknown themes", () => {
    expect(normalizeTheme("CATPPUCCIN-MOCHA")).toBe("catppuccin-mocha");
    expect(() => normalizeTheme("not-real")).toThrow("Unknown theme");
  });
});
