import { describe, expect, it } from "vitest";
import {
  buildEnumFromStaticOptions,
  buildStaticOptionsConfig,
  mergeValidationEnumFromStaticOptions,
  parseStaticOptionsJson,
  serializeStaticOptionsJson,
  summarizeStaticOptions,
  validateStaticOptionRows,
} from "./staticOptionsForm";

describe("staticOptionsForm", () => {
  it("round-trips rows through JSON", () => {
    const rows = [
      { value: "MALE", label: "Male" },
      { value: "FEMALE", label: "Female" },
    ];
    const json = serializeStaticOptionsJson(rows);
    expect(parseStaticOptionsJson(json)).toEqual(rows);
  });

  it("builds STATIC options config", () => {
    const config = buildStaticOptionsConfig([
      { value: "AA", label: "AA" },
    ]);
    expect(config).toEqual({
      source: "STATIC",
      options: [{ value: "AA", label: "AA" }],
    });
  });

  it("summarizes options for panel display", () => {
    expect(
      summarizeStaticOptions([
        { value: "MALE", label: "Male" },
        { value: "FEMALE", label: "Female" },
      ]),
    ).toBe("2 options: Male, Female");
  });

  it("validates duplicate values", () => {
    expect(
      validateStaticOptionRows([
        { value: "A", label: "One" },
        { value: "A", label: "Two" },
      ]),
    ).toBe("Option values must be unique.");
  });

  it("builds enum from static options", () => {
    expect(
      buildEnumFromStaticOptions([
        { value: "MALE", label: "Male" },
        { value: 1, label: "One" },
      ]),
    ).toEqual(["MALE", "1"]);
  });

  it("merges enum into string validation when missing", () => {
    const merged = mergeValidationEnumFromStaticOptions(
      '{"type":"string"}',
      { type: "string" },
      ["MALE", "FEMALE"],
    );
    expect(JSON.parse(merged!)).toEqual({
      type: "string",
      enum: ["MALE", "FEMALE"],
    });
  });

  it("skips enum merge when enum already set", () => {
    const merged = mergeValidationEnumFromStaticOptions(
      '{"type":"string","enum":["X"]}',
      { type: "string" },
      ["MALE"],
    );
    expect(merged).toBeUndefined();
  });
});
