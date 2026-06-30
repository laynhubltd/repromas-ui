import { describe, expect, it } from "vitest";
import type { ConfigTabGroupDefinition } from "./types";
import { resolveGroupedConfigSelection } from "./resolveGroupedConfigSelection";

const groups: ConfigTabGroupDefinition[] = [
  {
    key: "foundation",
    label: "Foundation",
    tabs: [{ key: "admission-cycle", label: "Admission Cycle", children: null }],
  },
  {
    key: "program-rules",
    label: "Program rules",
    tabs: [
      { key: "jamb-rule", label: "JAMB Rule", children: null },
      { key: "geography-rule", label: "Geography Rule", children: null },
    ],
  },
];

describe("resolveGroupedConfigSelection", () => {
  it("uses defaults when no URL params are present", () => {
    expect(
      resolveGroupedConfigSelection({
        groups,
        requestedGroup: null,
        requestedTab: null,
        defaultGroupKey: "foundation",
        defaultTabKey: "admission-cycle",
      }),
    ).toEqual({ groupKey: "foundation", tabKey: "admission-cycle" });
  });

  it("resolves group and tab from URL params", () => {
    expect(
      resolveGroupedConfigSelection({
        groups,
        requestedGroup: "program-rules",
        requestedTab: "geography-rule",
        defaultGroupKey: "foundation",
        defaultTabKey: "admission-cycle",
      }),
    ).toEqual({ groupKey: "program-rules", tabKey: "geography-rule" });
  });

  it("falls back to the first tab in a group when tab param is missing", () => {
    expect(
      resolveGroupedConfigSelection({
        groups,
        requestedGroup: "program-rules",
        requestedTab: null,
        defaultGroupKey: "foundation",
        defaultTabKey: "admission-cycle",
      }),
    ).toEqual({ groupKey: "program-rules", tabKey: "jamb-rule" });
  });

  it("finds a tab across groups when only tab param is provided", () => {
    expect(
      resolveGroupedConfigSelection({
        groups,
        requestedGroup: null,
        requestedTab: "geography-rule",
        defaultGroupKey: "foundation",
        defaultTabKey: "admission-cycle",
      }),
    ).toEqual({ groupKey: "program-rules", tabKey: "geography-rule" });
  });
});
