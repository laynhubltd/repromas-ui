import { describe, expect, it } from "vitest";
import { FALLBACK_BUILDER_CONTRACT } from "@/shared/constants/dynamicFormOptions";
import { LGA_OPTIONS_RESOLVER } from "@/shared/constants/dynamicFormOptions";
import type { FormField, FormSection } from "@/features/dynamic-form/types";
import { evaluatePublishIssues } from "./evaluatePublishIssues";

const baseSection = (
  overrides: Partial<FormSection> & Pick<FormSection, "id" | "targetEntity" | "title">,
): FormSection => ({
  formId: 1,
  description: null,
  stepOrder: 1,
  saveStrategy: "MERGE",
  handlerKey: null,
  hydrateOrder: 10,
  isRequired: true,
  createdAt: "",
  updatedAt: "",
  ...overrides,
});

const baseField = (overrides: Partial<FormField> & Pick<FormField, "id" | "fieldKey" | "label" | "fieldType">): FormField => ({
  sectionId: 1,
  helpText: null,
  displayOrder: 1,
  mappingConfig: { type: "META_DATA", json_key: "x" },
  validationConfig: { type: "string" },
  visibilityConfig: null,
  optionsConfig: null,
  isRequired: true,
  isReadOnly: false,
  createdAt: "",
  updatedAt: "",
  ...overrides,
});

describe("evaluatePublishIssues", () => {
  it("flags empty widget section", () => {
    const sections = [
      baseSection({
        id: 1,
        title: "O-Level",
        targetEntity: "AdmissionCandidateOlevelSitting",
        saveStrategy: "CUSTOM_HANDLER",
        handlerKey: "OlevelWidgetFormHydrator",
        hydrateOrder: 30,
      }),
    ];
    const issues = evaluatePublishIssues({
      sections,
      fieldsBySectionId: { 1: [] },
      contract: FALLBACK_BUILDER_CONTRACT,
      hydrateOrderConflicts: [],
    });
    expect(issues.some((i) => i.includes("no fields"))).toBe(true);
    expect(issues.some((i) => i.includes("WIDGET_OLEVEL"))).toBe(true);
  });

  it("flags missing apply_program on application section", () => {
    const sections = [
      baseSection({
        id: 2,
        title: "Application",
        targetEntity: "AdmissionApplication",
        hydrateOrder: 20,
      }),
    ];
    const fields: FormField[] = [
      baseField({
        id: 10,
        fieldKey: "field1",
        label: "Program",
        fieldType: "SELECT",
        mappingConfig: { type: "META_DATA", json_key: "field1" },
        optionsConfig: null,
      }),
    ];
    const issues = evaluatePublishIssues({
      sections,
      fieldsBySectionId: { 2: fields },
      contract: FALLBACK_BUILDER_CONTRACT,
      hydrateOrderConflicts: [],
    });
    expect(issues.some((i) => i.includes("apply_program"))).toBe(true);
    expect(issues.some((i) => i.includes("no options source"))).toBe(true);
  });

  it("flags JAMB hydrate order after O-Level", () => {
    const sections = [
      baseSection({
        id: 3,
        title: "JAMB",
        targetEntity: "AdmissionCandidateJambScore",
        saveStrategy: "CUSTOM_HANDLER",
        handlerKey: "JambWidgetFormHydrator",
        hydrateOrder: 35,
      }),
      baseSection({
        id: 4,
        title: "O-Level",
        targetEntity: "AdmissionCandidateOlevelSitting",
        saveStrategy: "CUSTOM_HANDLER",
        handlerKey: "OlevelWidgetFormHydrator",
        hydrateOrder: 30,
      }),
    ];
    const issues = evaluatePublishIssues({
      sections,
      fieldsBySectionId: {},
      contract: FALLBACK_BUILDER_CONTRACT,
      hydrateOrderConflicts: [],
    });
    expect(issues.some((i) => i.includes("JAMB section hydrate order"))).toBe(
      true,
    );
  });

  it("flags LGA field missing dependsOn field key", () => {
    const sections = [
      baseSection({
        id: 5,
        title: "Personal",
        targetEntity: "AdmissionCandidate",
        hydrateOrder: 10,
      }),
    ];
    const fields: FormField[] = [
      baseField({
        id: 11,
        fieldKey: "stateId",
        label: "State",
        fieldType: "SELECT",
        mappingConfig: { type: "COLUMN", column_name: "stateId" },
        optionsConfig: { source: "StateOptionsResolver", params: {} },
      }),
      baseField({
        id: 12,
        fieldKey: "lgaId",
        label: "LGA",
        fieldType: "SELECT",
        mappingConfig: { type: "COLUMN", column_name: "lgaId" },
        optionsConfig: { source: LGA_OPTIONS_RESOLVER, params: {} },
      }),
    ];
    const issues = evaluatePublishIssues({
      sections,
      fieldsBySectionId: { 5: fields },
      contract: FALLBACK_BUILDER_CONTRACT,
      hydrateOrderConflicts: [],
    });
    expect(
      issues.some((i) => i.includes("missing params.dependsOn.fieldKey")),
    ).toBe(true);
  });

  it("flags LGA dependsOn referencing missing sibling field", () => {
    const sections = [
      baseSection({
        id: 6,
        title: "Personal",
        targetEntity: "AdmissionCandidate",
        hydrateOrder: 10,
      }),
    ];
    const fields: FormField[] = [
      baseField({
        id: 13,
        fieldKey: "lgaId",
        label: "LGA",
        fieldType: "SELECT",
        mappingConfig: { type: "COLUMN", column_name: "lgaId" },
        optionsConfig: {
          source: LGA_OPTIONS_RESOLVER,
          params: { dependsOn: { fieldKey: "missingState", sectionId: null } },
        },
      }),
    ];
    const issues = evaluatePublishIssues({
      sections,
      fieldsBySectionId: { 6: fields },
      contract: FALLBACK_BUILDER_CONTRACT,
      hydrateOrderConflicts: [],
    });
    expect(
      issues.some((i) => i.includes('depends on "missingState"')),
    ).toBe(true);
  });

  it("flags STATIC field with enum mismatch", () => {
    const sections = [
      baseSection({
        id: 7,
        title: "Personal",
        targetEntity: "AdmissionCandidate",
        hydrateOrder: 10,
      }),
    ];
    const fields: FormField[] = [
      baseField({
        id: 14,
        fieldKey: "gender",
        label: "Gender",
        fieldType: "SELECT",
        mappingConfig: { type: "COLUMN", column_name: "gender" },
        optionsConfig: {
          source: "STATIC",
          options: [
            { value: "MALE", label: "Male" },
            { value: "FEMALE", label: "Female" },
          ],
        },
        validationConfig: { type: "string", enum: ["M", "F"] },
      }),
    ];
    const issues = evaluatePublishIssues({
      sections,
      fieldsBySectionId: { 7: fields },
      contract: FALLBACK_BUILDER_CONTRACT,
      hydrateOrderConflicts: [],
    });
    expect(
      issues.some((i) => i.includes("validationConfig.enum does not match")),
    ).toBe(true);
  });

  it("flags STATIC field with duplicate option values", () => {
    const sections = [
      baseSection({
        id: 8,
        title: "Personal",
        targetEntity: "AdmissionCandidate",
        hydrateOrder: 10,
      }),
    ];
    const fields: FormField[] = [
      baseField({
        id: 15,
        fieldKey: "blood_group",
        label: "Blood group",
        fieldType: "SELECT",
        mappingConfig: { type: "META_DATA", json_key: "blood_group" },
        optionsConfig: {
          source: "STATIC",
          options: [
            { value: "A", label: "A" },
            { value: "A", label: "A duplicate" },
          ],
        },
      }),
    ];
    const issues = evaluatePublishIssues({
      sections,
      fieldsBySectionId: { 8: fields },
      contract: FALLBACK_BUILDER_CONTRACT,
      hydrateOrderConflicts: [],
    });
    expect(
      issues.some((i) => i.includes("invalid STATIC options")),
    ).toBe(true);
  });

  it("flags META_DATA field with empty json_key", () => {
    const sections = [
      baseSection({
        id: 9,
        title: "Parent Guardian",
        targetEntity: "AdmissionCandidate",
        hydrateOrder: 10,
      }),
    ];
    const fields: FormField[] = [
      baseField({
        id: 20,
        fieldKey: "meta1",
        label: "Email",
        fieldType: "TEXT",
        mappingConfig: { type: "META_DATA", json_key: "   " },
      }),
    ];
    const issues = evaluatePublishIssues({
      sections,
      fieldsBySectionId: { 9: fields },
      contract: FALLBACK_BUILDER_CONTRACT,
      hydrateOrderConflicts: [],
    });
    expect(
      issues.some((i) => i.includes("no metadata path (json_key)")),
    ).toBe(true);
  });
});
