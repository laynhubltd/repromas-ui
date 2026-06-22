import { describe, expect, it } from "vitest";
import {
  buildValidationSchemaFromRuleForm,
  getDefaultRuleFormValues,
  parseValidationSchemaToRuleForm,
  summarizeValidationConfig,
} from "./validationRuleForm";

describe("validationRuleForm", () => {
  it("round-trips string min/max length", () => {
    const schema = { type: "string", minLength: 2, maxLength: 50 };
    const form = parseValidationSchemaToRuleForm(schema, "TEXT");
    const rebuilt = buildValidationSchemaFromRuleForm({ ...form, valueType: "string" });
    expect(rebuilt).toEqual({ type: "string", minLength: 2, maxLength: 50 });
  });

  it("builds email format schema from UI values", () => {
    const schema = buildValidationSchemaFromRuleForm({
      valueType: "string",
      format: "email",
      maxLength: 100,
    });
    expect(schema).toEqual({
      type: "string",
      format: "email",
      maxLength: 100,
    });
  });

  it("builds integer schema with range", () => {
    const schema = buildValidationSchemaFromRuleForm({
      valueType: "integer",
      minimum: 1,
      maximum: 100,
    });
    expect(schema).toEqual({ type: "integer", minimum: 1, maximum: 100 });
  });

  it("builds string enum from tag values", () => {
    const schema = buildValidationSchemaFromRuleForm({
      valueType: "string",
      enumValues: ["A", "B", "1"],
    });
    expect(schema).toEqual({ type: "string", enum: ["A", "B", 1] });
  });

  it("parses schema with exclusive bounds and multipleOf", () => {
    const form = parseValidationSchemaToRuleForm(
      {
        type: "number",
        minimum: 0,
        exclusiveMaximum: 100,
        multipleOf: 0.5,
      },
      "NUMBER",
    );
    expect(form.valueType).toBe("number");
    expect(form.minimum).toBe(0);
    expect(form.exclusiveMaximum).toBe(100);
    expect(form.multipleOf).toBe(0.5);
  });

  it("provides field-type defaults", () => {
    const defaults = getDefaultRuleFormValues("EMAIL", true);
    expect(defaults.valueType).toBe("string");
    expect(defaults.format).toBe("email");
    expect(defaults.required).toBe(true);
  });

  it("summarizes validation with required flag", () => {
    const summary = summarizeValidationConfig(
      { type: "string", format: "email", maxLength: 255 },
      "EMAIL",
      true,
    );
    expect(summary).toContain("Required");
    expect(summary).toContain("email format");
    expect(summary).toContain("max 255");
  });

  it("summarizes enum and pattern", () => {
    const summary = summarizeValidationConfig(
      { type: "string", minLength: 1, maxLength: 20, pattern: "^[A-Z]+$", enum: ["A", "B"] },
      "TEXT",
    );
    expect(summary).toContain("pattern set");
    expect(summary).toContain("2 allowed values");
  });
});
