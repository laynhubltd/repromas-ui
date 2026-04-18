import {
  UI_KIT_ACCESSIBILITY_BASELINE,
  UI_KIT_PROP_CONVENTIONS,
  UI_KIT_STYLING_RULE,
  getInteractiveTabIndex,
  getSharedSizeProps,
  getSharedSpacingStyle,
  resolveUIKitStyleStrategy,
  toAntdSize,
  toSpacingUnit,
} from "@/components/ui-kit";

describe("ui-kit foundation", () => {
  it("maps canonical size tokens to AntD sizes", () => {
    expect(toAntdSize("sm")).toBe("small");
    expect(toAntdSize("md")).toBe("middle");
    expect(toAntdSize("lg")).toBe("large");
    expect(getSharedSizeProps("lg")).toEqual({ size: "large" });
  });

  it("maps density tokens to shared spacing helpers", () => {
    expect(toSpacingUnit("compact")).toBe(8);
    expect(toSpacingUnit("comfortable")).toBe(12);
    expect(toSpacingUnit("spacious")).toBe(16);
    expect(getSharedSpacingStyle("comfortable")).toMatchObject({
      gap: 12,
      paddingBlock: 12,
      paddingInline: 12,
    });
  });

  it("resolves style strategy with AntD-first priority and css fallback only when needed", () => {
    expect(resolveUIKitStyleStrategy({ usesAntdToken: true })).toBe("antd-token");
    expect(resolveUIKitStyleStrategy({ usesAntdProp: true })).toBe("antd-prop");
    expect(
      resolveUIKitStyleStrategy({
        usesAntdToken: true,
        requiresUnsupportedBehavior: true,
      }),
    ).toBe("css-fallback");
  });

  it("keeps accessibility baseline and disabled interaction defaults", () => {
    expect(UI_KIT_ACCESSIBILITY_BASELINE.keyboard).toContain("Tab");
    expect(UI_KIT_ACCESSIBILITY_BASELINE.focusVisible).toContain("focus");
    expect(getInteractiveTabIndex("disabled")).toBe(-1);
    expect(getInteractiveTabIndex("readonly")).toBe(-1);
    expect(getInteractiveTabIndex("default")).toBeUndefined();
  });

  it("documents typed prop conventions and styling rule", () => {
    expect(UI_KIT_PROP_CONVENTIONS.size).toContain("sm | md | lg");
    expect(UI_KIT_PROP_CONVENTIONS.responsive).toContain("xs|sm|md|lg|xl");
    expect(UI_KIT_STYLING_RULE).toContain("Ant Design tokens");
    expect(UI_KIT_STYLING_RULE).toContain("pure CSS only");
  });
});
