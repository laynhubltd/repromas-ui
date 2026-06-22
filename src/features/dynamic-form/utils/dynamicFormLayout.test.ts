import { describe, expect, it } from "vitest";
import type { RenderField } from "../types";
import {
  buildCompactStepLabel,
  buildDynamicFormLayoutFlags,
  groupFieldsForLayout,
  resolveFieldWidth,
  resolveGradeRowDirection,
  resolveStepProgressPercent,
} from "./dynamicFormLayout";

const baseField = (key: string, width?: "half" | "full"): RenderField => ({
  fieldKey: key,
  label: key,
  helpText: null,
  fieldType: "TEXT",
  isRequired: false,
  isReadOnly: false,
  displayOrder: 1,
  options: null,
  ui: width ? { width } : null,
});

describe("dynamicFormLayout", () => {
  it("forces full width on mobile", () => {
    expect(resolveFieldWidth("half", true)).toBe("100%");
    expect(resolveFieldWidth("half", false)).toBe("48%");
    expect(resolveFieldWidth(undefined, false)).toBe("100%");
  });

  it("builds compact step label and progress", () => {
    const sections = [{ title: "Personal" }, { title: "Academic" }];
    expect(buildCompactStepLabel(sections, 0)).toBe("Step 1 of 2 — Personal");
    expect(buildCompactStepLabel(sections, 1)).toBe("Step 2 of 2 — Academic");
    expect(resolveStepProgressPercent(sections, 1)).toBe(100);
  });

  it("sets mobile layout flags", () => {
    const mobile = buildDynamicFormLayoutFlags(true, true);
    expect(mobile.stepsVariant).toBe("compact");
    expect(mobile.stackWidgetRows).toBe(true);
    expect(mobile.navButtonsBlock).toBe(true);

    const desktop = buildDynamicFormLayoutFlags(false, false);
    expect(desktop.stepsVariant).toBe("horizontal");
    expect(desktop.fieldWidth).toBe("48%");
  });

  it("groups half-width fields in pairs on desktop", () => {
    const fields = [
      baseField("a", "half"),
      baseField("b", "half"),
      baseField("c", "full"),
    ];
    const groups = groupFieldsForLayout(fields, false);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toEqual({
      kind: "pair",
      fields: [fields[0], fields[1]],
    });
    expect(groups[1]).toEqual({ kind: "single", field: fields[2] });
  });

  it("stacks all fields on mobile", () => {
    const fields = [baseField("a", "half"), baseField("b", "half")];
    const groups = groupFieldsForLayout(fields, true);
    expect(groups).toEqual([
      { kind: "single", field: fields[0] },
      { kind: "single", field: fields[1] },
    ]);
  });

  it("uses vertical grade rows on xs", () => {
    expect(resolveGradeRowDirection(true)).toBe("vertical");
    expect(resolveGradeRowDirection(false)).toBe("horizontal");
  });
});
