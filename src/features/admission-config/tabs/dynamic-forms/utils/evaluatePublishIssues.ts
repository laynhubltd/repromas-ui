import type {
  BuilderContract,
  FormField,
  FormSection,
  TargetEntity,
} from "@/features/dynamic-form/types";
import {
  isSelectableFieldType,
  isWidgetFieldType,
} from "./fieldConfigDefaults";
import {
  ADMISSION_DOCUMENT_UPLOAD_HANDLER,
  DOCUMENT_TYPE_OPTIONS_RESOLVER,
  LGA_OPTIONS_RESOLVER,
  STATE_OPTIONS_RESOLVER,
} from "@/shared/constants/dynamicFormOptions";
import { readLgaDependsOn } from "./optionsConfigForm";
import {
  staticEnumMatchesValidation,
  validateStaticOptionRows,
} from "./staticOptionsForm";

type EvaluatePublishIssuesInput = {
  sections: FormSection[];
  fieldsBySectionId: Record<number, FormField[]>;
  contract: BuilderContract;
  hydrateOrderConflicts: Array<{ id: number; title: string; hydrateOrder: number }>;
};

const WIDGET_ENTITY_RULES: Partial<
  Record<
    TargetEntity,
    { widgetFieldType: string; handlerKey: string; presetFieldKey: string }
  >
> = {
  AdmissionCandidateOlevelSitting: {
    widgetFieldType: "WIDGET_OLEVEL",
    handlerKey: "OlevelWidgetFormHydrator",
    presetFieldKey: "olevel_results",
  },
  AdmissionCandidateJambScore: {
    widgetFieldType: "WIDGET_JAMB",
    handlerKey: "JambWidgetFormHydrator",
    presetFieldKey: "jamb_scores",
  },
};

export function evaluatePublishIssues({
  sections,
  fieldsBySectionId,
  contract,
  hydrateOrderConflicts,
}: EvaluatePublishIssuesInput): string[] {
  const issues: string[] = [];

  if (sections.length === 0) {
    issues.push("Add at least one section before publishing.");
    return issues;
  }

  const columnMappings = new Map<string, string>();
  const jsonKeyMappings = new Map<string, string>();

  for (const section of sections) {
    const entity = contract.targetEntities.find((e) => e.key === section.targetEntity);
    const fields = fieldsBySectionId[section.id] ?? [];

    if (section.saveStrategy === "CUSTOM_HANDLER" && !section.handlerKey) {
      issues.push(
        `Section "${section.title}" uses a custom handler but has no handler key.`,
      );
    }

    const handler = contract.handlers.find(
      (h) => h.targetEntity === section.targetEntity,
    );
    if (
      section.saveStrategy === "CUSTOM_HANDLER" &&
      section.handlerKey &&
      handler &&
      section.handlerKey !== handler.handlerKey
    ) {
      issues.push(
        `Section "${section.title}" handler key "${section.handlerKey}" does not match contract handler "${handler.handlerKey}".`,
      );
    }

    if (fields.length === 0) {
      issues.push(`Section "${section.title}" has no fields.`);
    }

    const widgetRule = WIDGET_ENTITY_RULES[section.targetEntity];
    if (widgetRule) {
      const widgetFields = fields.filter(
        (f) => f.fieldType === widgetRule.widgetFieldType,
      );
      if (widgetFields.length !== 1) {
        issues.push(
          `Section "${section.title}" must contain exactly one ${widgetRule.widgetFieldType} field.`,
        );
      } else {
        const widgetField = widgetFields[0];
        if (
          widgetField.mappingConfig.type !== "CUSTOM_HANDLER" ||
          widgetField.mappingConfig.handler_key !== widgetRule.handlerKey
        ) {
          issues.push(
            `Field "${widgetField.label}" in "${section.title}" must map to handler "${widgetRule.handlerKey}".`,
          );
        }
      }
    }

    if (section.targetEntity === "AdmissionApplication") {
      const hasProgramField = fields.some(
        (f) =>
          f.fieldKey === "apply_program" &&
          f.mappingConfig.type === "COLUMN" &&
          f.mappingConfig.column_name === "appliedProgramId",
      );
      if (!hasProgramField) {
        issues.push(
          `Section "${section.title}" is missing the program choice field (apply_program → appliedProgramId).`,
        );
      }
    }

    // ─── FILE / AdmissionDocumentUpload section rules ─────────────────────────
    if (section.targetEntity === "AdmissionDocumentUpload") {
      const nonFileFields = fields.filter((f) => f.fieldType !== "FILE");
      if (nonFileFields.length > 0) {
        issues.push(
          `Section "${section.title}" targets AdmissionDocumentUpload but contains non-FILE field(s): ${nonFileFields.map((f) => `"${f.label}"`).join(", ")}.`,
        );
      }

      for (const field of fields) {
        if (field.fieldType !== "FILE") continue;

        if (
          field.mappingConfig.type !== "CUSTOM_HANDLER" ||
          field.mappingConfig.handler_key !== ADMISSION_DOCUMENT_UPLOAD_HANDLER
        ) {
          issues.push(
            `FILE field "${field.label}" in "${section.title}" must use CUSTOM_HANDLER mapping with handler_key "${ADMISSION_DOCUMENT_UPLOAD_HANDLER}".`,
          );
        }

        if (field.optionsConfig?.source !== DOCUMENT_TYPE_OPTIONS_RESOLVER) {
          issues.push(
            `FILE field "${field.label}" in "${section.title}" must use optionsConfig.source "${DOCUMENT_TYPE_OPTIONS_RESOLVER}".`,
          );
        }
      }

      // Skip generic column/metadata field checks for this section
      continue;
    }

    for (const field of fields) {
      // FILE fields in non-document-upload sections are misconfigured
      if (field.fieldType === "FILE") {
        issues.push(
          `Field "${field.label}" in "${section.title}" has fieldType FILE but the section target is not AdmissionDocumentUpload. Move FILE fields to a dedicated Document Upload section.`,
        );
        continue;
      }

      if (field.mappingConfig.type === "COLUMN") {
        const column = field.mappingConfig.column_name;
        const allowed = entity?.allowedColumnNames ?? [];
        const system = entity?.systemColumnNames ?? [];
        if (system.includes(column)) {
          issues.push(
            `Field "${field.label}" in "${section.title}" maps to system-only column "${column}".`,
          );
        }
        if (allowed.length > 0 && !allowed.includes(column)) {
          issues.push(
            `Field "${field.label}" in "${section.title}" maps to disallowed column "${column}".`,
          );
        }
        const existing = columnMappings.get(column);
        if (existing) {
          issues.push(
            `Column "${column}" is mapped by both "${existing}" and "${field.label}".`,
          );
        } else {
          columnMappings.set(column, field.label);
        }
      }

      if (field.mappingConfig.type === "META_DATA") {
        const jsonKey = field.mappingConfig.json_key?.trim() ?? "";
        if (!jsonKey) {
          issues.push(
            `Field "${field.label}" in "${section.title}" has no metadata path (json_key).`,
          );
        } else {
          const existing = jsonKeyMappings.get(jsonKey);
          if (existing) {
            issues.push(
              `Metadata path "${jsonKey}" is mapped by both "${existing}" and "${field.label}".`,
            );
          } else {
            jsonKeyMappings.set(jsonKey, field.label);
          }
        }
      }

      if (isSelectableFieldType(field.fieldType)) {
        const hasOptions =
          field.optionsConfig != null &&
          (field.optionsConfig.source === "STATIC"
            ? "options" in field.optionsConfig &&
              field.optionsConfig.options.length > 0
            : Boolean(field.optionsConfig.source));
        if (!hasOptions) {
          issues.push(
            `Field "${field.label}" in "${section.title}" is ${field.fieldType} but has no options source configured.`,
          );
        }

        if (field.optionsConfig?.source === STATE_OPTIONS_RESOLVER) {
          if (field.fieldType !== "SELECT" && field.fieldType !== "RADIO") {
            issues.push(
              `Field "${field.label}" in "${section.title}" uses StateOptionsResolver but field type is ${field.fieldType}; use SELECT or RADIO.`,
            );
          }
        }

        if (field.optionsConfig?.source === LGA_OPTIONS_RESOLVER) {
          const dependsOn = readLgaDependsOn(field.optionsConfig);
          if (!dependsOn?.fieldKey?.trim()) {
            issues.push(
              `Field "${field.label}" in "${section.title}" uses LgaOptionsResolver but is missing params.dependsOn.fieldKey.`,
            );
          } else {
            const siblingKeys = new Set(fields.map((f) => f.fieldKey));
            if (!siblingKeys.has(dependsOn.fieldKey)) {
              issues.push(
                `Field "${field.label}" in "${section.title}" depends on "${dependsOn.fieldKey}" which is not in the same section.`,
              );
            }
          }
        }

        if (
          field.optionsConfig?.source === "STATIC" &&
          "options" in field.optionsConfig
        ) {
          const staticRows = field.optionsConfig.options.map((o) => ({
            value: String(o.value),
            label: o.label,
          }));
          const shapeError = validateStaticOptionRows(staticRows);
          if (shapeError) {
            issues.push(
              `Field "${field.label}" in "${section.title}" has invalid STATIC options: ${shapeError}`,
            );
          } else if (
            !staticEnumMatchesValidation(
              field.optionsConfig.options,
              field.validationConfig ?? {},
            )
          ) {
            issues.push(
              `Field "${field.label}" in "${section.title}" validationConfig.enum does not match STATIC option values.`,
            );
          }
        }
      }

      if (
        Object.keys(field.validationConfig ?? {}).length === 0 &&
        !isWidgetFieldType(field.fieldType)
      ) {
        issues.push(
          `Field "${field.label}" in "${section.title}" has empty validationConfig.`,
        );
      }
    }
  }

  if (hydrateOrderConflicts.length > 0) {
    issues.push(
      "Two or more sections share the same hydrate order. Give each a unique order.",
    );
  }

  const jamb = sections.find(
    (s) => s.targetEntity === "AdmissionCandidateJambScore",
  );
  const olevel = sections.find(
    (s) => s.targetEntity === "AdmissionCandidateOlevelSitting",
  );
  if (jamb && olevel && jamb.hydrateOrder >= olevel.hydrateOrder) {
    issues.push(
      "JAMB section hydrate order must be lower than O-Level (recommended: JAMB 25, O-Level 30).",
    );
  }

  return issues;
}
