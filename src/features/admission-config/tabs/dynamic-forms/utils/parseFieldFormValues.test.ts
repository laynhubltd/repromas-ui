import { describe, expect, it } from "vitest";
import {
  buildMappingConfigFromForm,
  parseOptionsConfigFromForm,
  parseValidationConfigFromForm,
  parseVisibilityConfigFromForm,
  serializeOptionsConfigForForm,
  serializeVisibilityConfigForForm,
} from "./parseFieldFormValues";

describe("parseFieldFormValues", () => {
  it("builds COLUMN mapping from form values", () => {
    const mapping = buildMappingConfigFromForm({
      label: "Email",
      fieldType: "EMAIL",
      mappingType: "COLUMN",
      columnName: "email",
      isRequired: true,
      isReadOnly: false,
    });
    expect(mapping).toEqual({ type: "COLUMN", column_name: "email" });
  });

  it("parses resolver options config", () => {
    const options = parseOptionsConfigFromForm({
      label: "Program",
      fieldType: "SELECT",
      mappingType: "COLUMN",
      optionsSource: "ProgramOptionsResolver",
      isRequired: true,
      isReadOnly: false,
    });
    expect(options).toEqual({
      source: "ProgramOptionsResolver",
      params: {},
    });
  });

  it("parses LGA resolver with dependsOn field key", () => {
    const options = parseOptionsConfigFromForm({
      label: "LGA",
      fieldType: "SELECT",
      mappingType: "COLUMN",
      optionsSource: "LgaOptionsResolver",
      dependsOnFieldKey: "state_of_origin",
      isRequired: false,
      isReadOnly: false,
    });
    expect(options).toEqual({
      source: "LgaOptionsResolver",
      params: {
        dependsOn: { fieldKey: "state_of_origin", sectionId: null },
      },
    });
  });

  it("serializes STATIC options for form", () => {
    const serialized = serializeOptionsConfigForForm({
      source: "STATIC",
      options: [{ value: 1, label: "A" }],
    });
    expect(serialized.optionsSource).toBe("STATIC");
    expect(JSON.parse(serialized.staticOptionsJson!)).toEqual([
      { value: 1, label: "A" },
    ]);
  });

  it("falls back when validation JSON is invalid", () => {
    const result = parseValidationConfigFromForm(
      {
        label: "X",
        fieldType: "TEXT",
        mappingType: "META_DATA",
        validationConfigJson: "not-json",
        isRequired: false,
        isReadOnly: false,
      },
      { type: "string" },
    );
    expect(result).toEqual({ type: "string" });
  });

  it("parses visibility in operator with array values", () => {
    const config = parseVisibilityConfigFromForm({
      label: "Sponsor name",
      fieldType: "TEXT",
      mappingType: "META_DATA",
      visibilityEnabled: true,
      visibilityField: "sponsorType",
      visibilityOperator: "in",
      visibilityInValues: ["parent", "guardian"],
      isRequired: false,
      isReadOnly: false,
    });
    expect(config).toEqual({
      "x-condition": {
        field: "sponsorType",
        operator: "in",
        value: ["parent", "guardian"],
      },
    });
  });

  it("clears visibility when disabled", () => {
    const config = parseVisibilityConfigFromForm({
      label: "X",
      fieldType: "TEXT",
      mappingType: "META_DATA",
      visibilityEnabled: false,
      visibilityField: "otherField",
      isRequired: false,
      isReadOnly: false,
    });
    expect(config).toBeNull();
  });

  it("serializes visibility in values for form", () => {
    const serialized = serializeVisibilityConfigForForm({
      "x-condition": {
        field: "state",
        operator: "in",
        value: ["LA", "OG"],
      },
    });
    expect(serialized.visibilityEnabled).toBe(true);
    expect(serialized.visibilityInValues).toEqual(["LA", "OG"]);
  });
});
