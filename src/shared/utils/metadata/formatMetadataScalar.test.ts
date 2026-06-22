import { describe, expect, it } from "vitest";
import {
  formatMetadataScalar,
  metadataSummaryForValue,
} from "./formatMetadataScalar";

describe("formatMetadataScalar", () => {
  it("formats booleans", () => {
    expect(formatMetadataScalar(true)).toEqual({ type: "boolean", value: true });
    expect(formatMetadataScalar(false)).toEqual({ type: "boolean", value: false });
  });

  it("formats null values", () => {
    expect(formatMetadataScalar(null)).toEqual({ type: "null" });
  });

  it("truncates long strings", () => {
    const long = "a".repeat(200);
    const formatted = formatMetadataScalar(long);
    expect(formatted.type).toBe("string");
    if (formatted.type === "string") {
      expect(formatted.truncated).toBe(true);
      expect(formatted.value.endsWith("…")).toBe(true);
    }
  });

  it("formats ISO dates", () => {
    const formatted = formatMetadataScalar("2024-06-12T10:00:00.000Z");
    expect(formatted.type).toBe("date");
  });

  it("summarizes nested structures", () => {
    expect(metadataSummaryForValue({ a: 1 })).toBe("{1 keys}");
    expect(metadataSummaryForValue([1, 2, 3])).toBe("[3 items]");
  });
});
