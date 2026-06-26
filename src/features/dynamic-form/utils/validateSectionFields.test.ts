import { describe, expect, it } from "vitest";
import type { RenderSection } from "../types";
import { isEmptyFieldValue } from "./fieldValueEmptiness";
import {
  sanitizeSectionDataForSchemaValidation,
  validateDynamicFormSection,
  validateSectionFields,
} from "./validateSectionFields";

const biodataSection: RenderSection = {
  id: 15,
  title: "Admission Candidate",
  stepOrder: 2,
  fields: [
    {
      fieldKey: "firstName",
      label: "First Name",
      helpText: null,
      fieldType: "TEXT",
      isRequired: false,
      isReadOnly: false,
      displayOrder: 1,
      options: null,
      ui: null,
    },
    {
      fieldKey: "email",
      label: "Email",
      helpText: null,
      fieldType: "EMAIL",
      isRequired: false,
      isReadOnly: false,
      displayOrder: 2,
      options: null,
      ui: null,
    },
    {
      fieldKey: "stateId",
      label: "State",
      helpText: null,
      fieldType: "SELECT",
      isRequired: true,
      isReadOnly: false,
      displayOrder: 3,
      options: [{ value: 15, label: "FCT" }],
      ui: null,
    },
  ],
};

const biodataJsonSchema = {
  type: "object",
  properties: {
    "15": {
      type: "object",
      properties: {
        firstName: { type: "string", maxLength: 100 },
        email: { type: "string", format: "email", maxLength: 255 },
        stateId: { type: "integer", minimum: 1 },
      },
      required: ["stateId"],
    },
  },
};

describe("isEmptyFieldValue", () => {
  it("treats null, undefined, and blank strings as empty", () => {
    expect(isEmptyFieldValue(null)).toBe(true);
    expect(isEmptyFieldValue(undefined)).toBe(true);
    expect(isEmptyFieldValue("")).toBe(true);
    expect(isEmptyFieldValue("   ")).toBe(true);
  });

  it("treats false and zero as non-empty", () => {
    expect(isEmptyFieldValue(false)).toBe(false);
    expect(isEmptyFieldValue(0)).toBe(false);
  });
});

describe("validateSectionFields", () => {
  it("allows optional fields to be empty", () => {
    const errors = validateSectionFields(
      biodataSection,
      { firstName: "", email: null, stateId: 15 },
      biodataJsonSchema,
    );
    expect(errors).toEqual({});
  });

  it("requires fields marked isRequired", () => {
    const errors = validateSectionFields(
      biodataSection,
      { firstName: "Ada", email: "ada@example.com" },
      biodataJsonSchema,
    );
    expect(errors.stateId).toMatch(/required/i);
  });

  it("validates format only when optional field has a value", () => {
    const errors = validateSectionFields(
      biodataSection,
      { firstName: "Ada", email: "not-an-email", stateId: 15 },
      biodataJsonSchema,
    );
    expect(errors.email).toBeTruthy();
    expect(errors.firstName).toBeUndefined();
  });
});

describe("sanitizeSectionDataForSchemaValidation", () => {
  it("omits empty optional fields from schema validation payload", () => {
    const sanitized = sanitizeSectionDataForSchemaValidation(biodataSection, {
      firstName: "",
      email: null,
      stateId: 15,
    });
    expect(sanitized).toEqual({ stateId: 15 });
  });
});

describe("validateDynamicFormSection", () => {
  const jambSection: RenderSection = {
    id: 17,
    title: "JAMB Scores",
    stepOrder: 3,
    fields: [
      {
        fieldKey: "jamb_scores",
        label: "JAMB Scores",
        helpText: null,
        fieldType: "WIDGET_JAMB",
        isRequired: true,
        isReadOnly: false,
        displayOrder: 1,
        options: null,
        ui: null,
      },
    ],
  };

  it("still enforces required widgets", () => {
    const errors = validateDynamicFormSection(
      jambSection,
      { jamb_scores: { scores: [] } },
      {
        type: "object",
        properties: {
          "17": {
            type: "object",
            properties: { jamb_scores: { type: "object" } },
            required: ["jamb_scores"],
          },
        },
      },
    );
    expect(errors.jamb_scores).toMatch(/at least one JAMB score/i);
  });

  it("skips optional widgets when untouched", () => {
    const optionalJambSection: RenderSection = {
      ...jambSection,
      fields: [
        {
          ...jambSection.fields[0],
          isRequired: false,
        },
      ],
    };

    const errors = validateDynamicFormSection(
      optionalJambSection,
      { jamb_scores: { scores: [] } },
      {
        type: "object",
        properties: {
          "17": {
            type: "object",
            properties: { jamb_scores: { type: "object" } },
          },
        },
      },
    );
    expect(errors).toEqual({});
  });
});
