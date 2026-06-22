import { describe, expect, it } from "vitest";
import {
  defaultStaticOptionsForColumn,
  suggestOptionsSourceForColumn,
} from "./optionsConfigForm";

describe("optionsConfigForm STATIC", () => {
  it("suggests STATIC for gender column", () => {
    expect(suggestOptionsSourceForColumn("gender")).toBe("STATIC");
  });

  it("returns gender defaults for gender column", () => {
    const defaults = defaultStaticOptionsForColumn("gender");
    expect(defaults).toEqual(
      expect.arrayContaining([{ value: "MALE", label: "Male" }]),
    );
  });
});
