import { describe, expect, it } from "vitest";
import {
  getSegmentedOptionLabel,
  normalizeSegmentedOptions,
} from "./primarySegmentedOptions";
import { shouldUseMobilePicker } from "./PrimarySegmented";

describe("primarySegmentedOptions", () => {
  it("normalizes string options", () => {
    expect(normalizeSegmentedOptions(["Programs", "Credits"])).toEqual([
      { label: "Programs", value: "Programs" },
      { label: "Credits", value: "Credits" },
    ]);
  });

  it("normalizes object options", () => {
    expect(
      normalizeSegmentedOptions([
        { label: "Foundation", value: "foundation" },
        { label: "Screening", value: "screening", disabled: true },
      ]),
    ).toEqual([
      { label: "Foundation", value: "foundation" },
      { label: "Screening", value: "screening", disabled: true },
    ]);
  });

  it("resolves the selected label", () => {
    const options = normalizeSegmentedOptions([
      { label: "Foundation", value: "foundation" },
    ]);

    expect(getSegmentedOptionLabel(options, "foundation")).toBe("Foundation");
  });
});

describe("shouldUseMobilePicker", () => {
  it("uses mobile picker below the configured breakpoint", () => {
    expect(shouldUseMobilePicker({ md: false, sm: true }, "md")).toBe(true);
    expect(shouldUseMobilePicker({ md: true, sm: true }, "md")).toBe(false);
  });
});
