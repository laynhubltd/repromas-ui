import { describe, expect, it } from "vitest";
import { FALLBACK_BUILDER_CONTRACT } from "@/shared/constants/dynamicFormOptions";
import {
  LGA_OPTIONS_RESOLVER,
  STATE_OPTIONS_RESOLVER,
} from "@/shared/constants/dynamicFormOptions";
import {
  buildColumnFieldRequest,
  buildMetadataFieldRequest,
  buildPresetFieldRequest,
  getEntityFieldCreationMode,
  getUnusedAllowlistedColumns,
} from "./buildFieldPayload";

describe("buildFieldPayload", () => {
  const candidateEntity = FALLBACK_BUILDER_CONTRACT.targetEntities.find(
    (e) => e.key === "AdmissionCandidate",
  )!;

  it("builds email column field with COLUMN mapping and validation", () => {
    const payload = buildColumnFieldRequest("email", 1, []);
    expect(payload).toMatchObject({
      fieldKey: "email",
      fieldType: "EMAIL",
      mappingConfig: { type: "COLUMN", column_name: "email" },
      validationConfig: { type: "string", format: "email" },
    });
  });

  it("builds stateId column as SELECT with StateOptionsResolver", () => {
    const payload = buildColumnFieldRequest("stateId", 2, []);
    expect(payload).toMatchObject({
      fieldKey: "stateId",
      fieldType: "SELECT",
      mappingConfig: { type: "COLUMN", column_name: "stateId" },
      optionsConfig: { source: STATE_OPTIONS_RESOLVER, params: {} },
      validationConfig: { type: "integer", minimum: 1 },
    });
  });

  it("builds lgaId column as SELECT with LgaOptionsResolver dependsOn", () => {
    const payload = buildColumnFieldRequest("lgaId", 3, []);
    expect(payload).toMatchObject({
      fieldKey: "lgaId",
      fieldType: "SELECT",
      mappingConfig: { type: "COLUMN", column_name: "lgaId" },
      optionsConfig: {
        source: LGA_OPTIONS_RESOLVER,
        params: { dependsOn: { fieldKey: "stateId", sectionId: null } },
      },
    });
  });

  it("builds gender column as SELECT with STATIC options and enum validation", () => {
    const payload = buildColumnFieldRequest("gender", 4, []);
    expect(payload).toMatchObject({
      fieldKey: "gender",
      fieldType: "SELECT",
      mappingConfig: { type: "COLUMN", column_name: "gender" },
      optionsConfig: {
        source: "STATIC",
        options: expect.arrayContaining([
          { value: "MALE", label: "Male" },
        ]),
      },
      validationConfig: {
        type: "string",
        enum: ["MALE", "FEMALE", "OTHER"],
      },
    });
  });

  it("builds apply_program preset for application entity", () => {
    const appEntity = FALLBACK_BUILDER_CONTRACT.targetEntities.find(
      (e) => e.key === "AdmissionApplication",
    )!;
    const preset = appEntity.fieldPresets![0];
    const payload = buildPresetFieldRequest(preset, 1);
    expect(payload.fieldKey).toBe("apply_program");
    expect(payload.optionsConfig).toEqual({
      source: "ProgramOptionsResolver",
      params: {},
    });
    expect(payload.mappingConfig).toEqual({
      type: "COLUMN",
      column_name: "appliedProgramId",
    });
  });

  it("returns widget-preset mode for O-Level entity", () => {
    const olevel = FALLBACK_BUILDER_CONTRACT.targetEntities.find(
      (e) => e.key === "AdmissionCandidateOlevelSitting",
    )!;
    expect(
      getEntityFieldCreationMode(
        "AdmissionCandidateOlevelSitting",
        olevel,
        true,
      ),
    ).toBe("widget-preset");
  });

  it("builds metadata field with auto json_key and meta fieldKey", () => {
    const payload = buildMetadataFieldRequest("TEXT", 1, "Parent Guardian", []);
    expect(payload).toMatchObject({
      fieldKey: "meta1",
      label: "Metadata field 1",
      fieldType: "TEXT",
      mappingConfig: {
        type: "META_DATA",
        json_key: "parent_guardian.metadata_field_1",
      },
    });
  });

  it("lists unused allowlisted columns", () => {
    const unused = getUnusedAllowlistedColumns(candidateEntity, [
      {
        id: 1,
        sectionId: 1,
        fieldKey: "email",
        label: "Email",
        helpText: null,
        fieldType: "EMAIL",
        displayOrder: 1,
        mappingConfig: { type: "COLUMN", column_name: "email" },
        validationConfig: {},
        visibilityConfig: null,
        optionsConfig: null,
        isRequired: true,
        isReadOnly: false,
        createdAt: "",
        updatedAt: "",
      },
    ]);
    expect(unused).toContain("phone");
    expect(unused).not.toContain("email");
  });
});
