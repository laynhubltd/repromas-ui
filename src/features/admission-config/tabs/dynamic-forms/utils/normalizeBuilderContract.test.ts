import { describe, expect, it } from "vitest";
import { normalizeBuilderContract } from "./normalizeBuilderContract";

describe("normalizeBuilderContract", () => {
  it("maps snake_case field_types with field_type key", () => {
    const contract = normalizeBuilderContract({
      target_entities: [
        {
          target_entity: "AdmissionCandidate",
          default_save_strategy: "MERGE",
          default_hydrate_order: 10,
          section_steps: ["Step one"],
        },
      ],
      field_types: [
        { field_type: "TEXT", label: "Text" },
        { field_type: "WIDGET_JAMB", label: "JAMB", disabled: true },
      ],
      mapping_types: [],
      save_strategies: [],
      handlers: [],
      options_resolvers: [],
      hydrate_order_guide: [],
    });

    expect(contract.targetEntities[0]?.key).toBe("AdmissionCandidate");
    expect(contract.fieldTypes.map((f) => f.key)).toEqual(["TEXT", "WIDGET_JAMB"]);
  });

  it("falls back when payload is empty", () => {
    const contract = normalizeBuilderContract(null);
    expect(contract.targetEntities.length).toBeGreaterThan(0);
    expect(contract.fieldTypes.some((f) => f.key === "WIDGET_JAMB")).toBe(true);
  });

  it("merges sparse O-Level entity with fallback presets and payload", () => {
    const contract = normalizeBuilderContract({
      target_entities: [
        {
          key: "AdmissionCandidateOlevelSitting",
          label: "O-Level Sittings",
          default_save_strategy: "CUSTOM_HANDLER",
          handler_key: "OlevelWidgetFormHydrator",
        },
      ],
      handlers: [
        {
          handlerKey: "OlevelWidgetFormHydrator",
          targetEntity: "AdmissionCandidateOlevelSitting",
          requiredSaveStrategy: "CUSTOM_HANDLER",
          widgetFieldType: "WIDGET_OLEVEL",
        },
      ],
      field_types: [],
      mapping_types: [],
      save_strategies: [],
      options_resolvers: [],
      hydrate_order_guide: [],
    });

    const olevel = contract.targetEntities.find(
      (entity) => entity.key === "AdmissionCandidateOlevelSitting",
    );
    expect(olevel?.widgetFieldType).toBe("WIDGET_OLEVEL");
    expect(olevel?.fieldPresets?.[0]?.fieldKey).toBe("olevel_results");
    expect(olevel?.payloadContract).toMatchObject({ sittings: expect.any(Array) });
  });
});
