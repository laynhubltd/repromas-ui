import type { FormField, OptionsConfig } from "@/features/dynamic-form/types";
import {
  LGA_OPTIONS_RESOLVER,
  PROGRAM_OPTIONS_RESOLVER,
  STATE_OPTIONS_RESOLVER,
} from "@/shared/constants/dynamicFormOptions";
import {
  buildStaticOptionsConfig,
  defaultStaticOptionsForColumn,
  parseStaticOptionsJson,
  serializeStaticOptionsJson,
} from "./staticOptionsForm";

export type LgaDependsOnParams = {
  fieldKey: string;
  sectionId: number | null;
};

export const STATIC_OPTIONS_SOURCE = "STATIC";

export function suggestOptionsSourceForColumn(
  columnName: string | undefined,
): string | undefined {
  if (columnName === "gender") return STATIC_OPTIONS_SOURCE;
  if (columnName === "stateId") return STATE_OPTIONS_RESOLVER;
  if (columnName === "lgaId") return LGA_OPTIONS_RESOLVER;
  if (columnName === "appliedProgramId") return PROGRAM_OPTIONS_RESOLVER;
  return undefined;
}

export { defaultStaticOptionsForColumn };

export function readLgaDependsOn(
  optionsConfig: OptionsConfig | null | undefined,
): LgaDependsOnParams | null {
  if (!optionsConfig || optionsConfig.source !== LGA_OPTIONS_RESOLVER) return null;
  const params = optionsConfig.params as { dependsOn?: LgaDependsOnParams } | undefined;
  return params?.dependsOn ?? null;
}

export function buildResolverOptionsConfig(
  source: string,
  dependsOnFieldKey?: string,
): OptionsConfig {
  if (source === LGA_OPTIONS_RESOLVER) {
    return {
      source: LGA_OPTIONS_RESOLVER,
      params: {
        dependsOn: {
          fieldKey: dependsOnFieldKey ?? "stateId",
          sectionId: null,
        },
      },
    };
  }
  return { source, params: {} };
}

export function serializeOptionsConfigForForm(
  optionsConfig: OptionsConfig | null | undefined,
): {
  optionsSource: string;
  staticOptionsJson?: string;
  dependsOnFieldKey?: string;
} {
  if (!optionsConfig) return { optionsSource: "NONE" };
  if (optionsConfig.source === STATIC_OPTIONS_SOURCE && "options" in optionsConfig) {
    return {
      optionsSource: STATIC_OPTIONS_SOURCE,
      staticOptionsJson: serializeStaticOptionsJson(
        optionsConfig.options.map((o) => ({
          value: String(o.value),
          label: o.label,
        })),
      ),
    };
  }
  const dependsOn = readLgaDependsOn(optionsConfig);
  return {
    optionsSource: optionsConfig.source,
    dependsOnFieldKey: dependsOn?.fieldKey,
  };
}

export function parseOptionsConfigFromFormValues(input: {
  optionsSource?: string;
  staticOptionsJson?: string;
  dependsOnFieldKey?: string;
}): OptionsConfig | null {
  if (input.optionsSource === STATIC_OPTIONS_SOURCE) {
    const rows = parseStaticOptionsJson(input.staticOptionsJson);
    if (rows.length === 0) return null;
    return buildStaticOptionsConfig(rows);
  }
  if (input.optionsSource && input.optionsSource !== "NONE") {
    if (input.optionsSource === LGA_OPTIONS_RESOLVER) {
      return buildResolverOptionsConfig(
        LGA_OPTIONS_RESOLVER,
        input.dependsOnFieldKey?.trim() || "stateId",
      );
    }
    return { source: input.optionsSource, params: {} };
  }
  return null;
}

export function listStateFieldKeysForDependsOn(
  sectionFields: FormField[],
  currentFieldKey: string,
): string[] {
  const keys = sectionFields
    .filter(
      (f) =>
        f.fieldKey !== currentFieldKey &&
        (f.fieldKey === "stateId" ||
          f.fieldKey === "state_of_origin" ||
          (f.mappingConfig.type === "COLUMN" &&
            f.mappingConfig.column_name === "stateId")),
    )
    .map((f) => f.fieldKey);
  if (keys.length === 0) return ["stateId"];
  return [...new Set(keys)];
}

export function isGeographyColumn(columnName: string | undefined): boolean {
  return columnName === "stateId" || columnName === "lgaId";
}
