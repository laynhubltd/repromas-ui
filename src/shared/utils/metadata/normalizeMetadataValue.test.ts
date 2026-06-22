import { describe, expect, it } from "vitest";
import { normalizeMetadataValue } from "./normalizeMetadataValue";

describe("normalizeMetadataValue", () => {
  it("returns empty for null and undefined", () => {
    expect(normalizeMetadataValue(null).kind).toBe("empty");
    expect(normalizeMetadataValue(undefined).kind).toBe("empty");
    expect(normalizeMetadataValue("   ").kind).toBe("empty");
  });

  it("parses valid JSON strings", () => {
    const result = normalizeMetadataValue('{"a":1}');
    expect(result.kind).toBe("object");
    if (result.kind === "object") {
      expect(result.value).toEqual({ a: 1 });
    }
  });

  it("returns invalid for malformed JSON strings", () => {
    const result = normalizeMetadataValue("{bad");
    expect(result).toEqual({ kind: "invalid", raw: "{bad" });
  });

  it("classifies arrays and objects", () => {
    expect(normalizeMetadataValue([1, 2]).kind).toBe("array");
    expect(normalizeMetadataValue({ x: true }).kind).toBe("object");
  });

  it("classifies scalar values", () => {
    expect(normalizeMetadataValue('"hello"').kind).toBe("scalar");
    expect(normalizeMetadataValue(42).kind).toBe("scalar");
    expect(normalizeMetadataValue(false).kind).toBe("scalar");
  });

  it("returns invalid for non-JSON plain strings", () => {
    expect(normalizeMetadataValue("hello").kind).toBe("invalid");
  });
});
