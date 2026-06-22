import { describe, expect, it } from "vitest";
import type { FormField } from "@/features/dynamic-form/types";
import {
  buildMetadataJsonKey,
  buildMetadataMappingConfig,
  ensureUniqueJsonKey,
  recomputeMetadataJsonKeysForSection,
  slugifySegment,
} from "./metadataJsonKey";

const metaField = (
  overrides: Partial<FormField> & Pick<FormField, "id" | "label">,
): FormField => ({
  sectionId: 1,
  fieldKey: `meta${overrides.id}`,
  helpText: null,
  fieldType: "TEXT",
  displayOrder: overrides.id,
  mappingConfig: {
    type: "META_DATA",
    json_key: "section.field",
  },
  validationConfig: { type: "string" },
  visibilityConfig: null,
  optionsConfig: null,
  isRequired: false,
  isReadOnly: false,
  createdAt: "",
  updatedAt: "",
  ...overrides,
});

describe("slugifySegment", () => {
  it("lowercases and replaces spaces with underscores", () => {
    expect(slugifySegment("Parent Guardian")).toBe("parent_guardian");
  });

  it("collapses punctuation and repeated separators", () => {
    expect(slugifySegment("Email---Address!!")).toBe("email_address");
  });

  it("trims edges and collapses internal spaces", () => {
    expect(slugifySegment("  Multiple   Spaces  ")).toBe("multiple_spaces");
  });

  it("returns empty string for symbols-only input", () => {
    expect(slugifySegment("!!!")).toBe("");
  });
});

describe("buildMetadataJsonKey", () => {
  it("joins section and field slugs with a dot", () => {
    expect(buildMetadataJsonKey("Parent Guardian", "Email")).toBe(
      "parent_guardian.email",
    );
  });

  it("uses fallbacks when slugs are empty", () => {
    expect(buildMetadataJsonKey("!!!", "!!!")).toBe("section.field");
  });
});

describe("ensureUniqueJsonKey", () => {
  it("returns base key when unused", () => {
    expect(ensureUniqueJsonKey("parent_guardian.email", new Set())).toBe(
      "parent_guardian.email",
    );
  });

  it("appends numeric suffix on collision", () => {
    const used = new Set(["parent_guardian.email"]);
    expect(ensureUniqueJsonKey("parent_guardian.email", used)).toBe(
      "parent_guardian.email_2",
    );
  });

  it("skips excludeKey when checking collisions", () => {
    const used = new Set(["parent_guardian.email"]);
    expect(
      ensureUniqueJsonKey("parent_guardian.email", used, "parent_guardian.email"),
    ).toBe("parent_guardian.email");
  });
});

describe("buildMetadataMappingConfig", () => {
  it("assigns unique keys across the form", () => {
    const fields = [
      metaField({
        id: 1,
        label: "Email",
        mappingConfig: { type: "META_DATA", json_key: "parent_guardian.email" },
      }),
    ];
    const config = buildMetadataMappingConfig(
      "Parent Guardian",
      "Email",
      fields,
      2,
    );
    expect(config).toEqual({
      type: "META_DATA",
      json_key: "parent_guardian.email_2",
    });
  });
});

describe("recomputeMetadataJsonKeysForSection", () => {
  it("recomputes keys for all metadata fields in section order", () => {
    const sectionFields = [
      metaField({
        id: 1,
        label: "Email",
        displayOrder: 1,
        mappingConfig: { type: "META_DATA", json_key: "old.email" },
      }),
      metaField({
        id: 2,
        label: "Email",
        displayOrder: 2,
        mappingConfig: { type: "META_DATA", json_key: "old.email_2" },
      }),
    ];

    const updates = recomputeMetadataJsonKeysForSection(
      "Guardian Details",
      sectionFields,
      sectionFields,
    );

    expect(updates).toEqual([
      { fieldId: 1, json_key: "guardian_details.email" },
      { fieldId: 2, json_key: "guardian_details.email_2" },
    ]);
  });

  it("returns empty when keys are already correct", () => {
    const sectionFields = [
      metaField({
        id: 1,
        label: "Email",
        mappingConfig: { type: "META_DATA", json_key: "parent_guardian.email" },
      }),
    ];

    const updates = recomputeMetadataJsonKeysForSection(
      "Parent Guardian",
      sectionFields,
      sectionFields,
    );

    expect(updates).toEqual([]);
  });
});
