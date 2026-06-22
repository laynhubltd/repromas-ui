import type {
  BuilderContract,
  ContractTargetEntity,
  FieldType,
  MappingType,
  SaveStrategy,
  TargetEntity,
} from "@/features/dynamic-form/types";
import { FALLBACK_BUILDER_CONTRACT } from "@/shared/constants/dynamicFormOptions";
import { useMemo } from "react";
import { useGetBuilderContractQuery } from "../api/builderContractApi";
import { getEntityFieldCreationMode } from "../utils/buildFieldPayload";

export type BuilderContractHelpers = {
  contract: BuilderContract;
  isLoading: boolean;
  isError: boolean;
  /** True when the live contract loaded; false when the fallback is in use. */
  isLive: boolean;
  targetEntityOptions: { value: TargetEntity; label: string }[];
  fieldTypeOptions: { value: FieldType; label: string; disabled?: boolean }[];
  saveStrategyOptions: { value: SaveStrategy; label: string }[];
  mappingTypeOptions: { value: MappingType; label: string }[];
  optionsResolverOptions: { value: string; label: string }[];
  getTargetEntity: (key: TargetEntity | undefined) => ContractTargetEntity | null;
  getAllowedColumns: (key: TargetEntity | undefined) => string[];
  getSystemColumns: (key: TargetEntity | undefined) => string[];
  getSelectableColumns: (key: TargetEntity | undefined) => string[];
  isWidgetEntity: (key: TargetEntity | undefined) => boolean;
  getFieldCreationMode: (key: TargetEntity | undefined) => ReturnType<typeof getEntityFieldCreationMode>;
  getAllowedMappingTypes: (
    key: TargetEntity | undefined,
    isWidgetField: boolean,
  ) => MappingType[];
  getFieldTypeOptionsForEntity: (
    key: TargetEntity | undefined,
    currentFieldType?: FieldType,
  ) => { value: FieldType; label: string; disabled?: boolean }[];
};

export function useBuilderContract(skip = false): BuilderContractHelpers {
  const { data, isLoading, isError } = useGetBuilderContractQuery(undefined, {
    skip,
  });

  return useMemo(() => {
    const isLive = !!data && !isError;
    const contract: BuilderContract = data ?? FALLBACK_BUILDER_CONTRACT;

    const targetEntityMap = new Map<TargetEntity, ContractTargetEntity>();
    for (const entity of contract.targetEntities) {
      targetEntityMap.set(entity.key, entity);
    }

    const getTargetEntity = (key: TargetEntity | undefined) =>
      key ? (targetEntityMap.get(key) ?? null) : null;

    const isWidgetEntity = (key: TargetEntity | undefined) => {
      const entity = getTargetEntity(key);
      if (!entity) return false;
      // AdmissionDocumentUpload uses CUSTOM_HANDLER but is NOT a widget entity
      if (entity.key === "AdmissionDocumentUpload") return false;
      return (
        entity.defaultSaveStrategy === "CUSTOM_HANDLER" ||
        !!entity.widgetFieldType
      );
    };

    return {
      contract,
      isLoading,
      isError,
      isLive,
      targetEntityOptions: contract.targetEntities.map((e) => ({
        value: e.key,
        label: e.label ?? e.key,
      })),
      fieldTypeOptions: contract.fieldTypes
        .filter((f) => f.key != null && f.key.length > 0)
        .map((f) => ({
          value: f.key,
          label: f.label ?? f.key,
          disabled: f.disabled,
        })),
      saveStrategyOptions: contract.saveStrategies.map((s) => ({
        value: s.key,
        label: s.label,
      })),
      mappingTypeOptions: contract.mappingTypes.map((m) => ({
        value: m.key,
        label: m.label,
      })),
      optionsResolverOptions: contract.optionsResolvers.map((r) => ({
        value: r.key,
        label: r.label,
      })),
      getTargetEntity,
      getAllowedColumns: (key) => getTargetEntity(key)?.allowedColumnNames ?? [],
      getSystemColumns: (key) => getTargetEntity(key)?.systemColumnNames ?? [],
      getSelectableColumns: (key) => {
        const entity = getTargetEntity(key);
        if (!entity?.allowedColumnNames) return [];
        const system = new Set(entity.systemColumnNames ?? []);
        return entity.allowedColumnNames.filter((c) => !system.has(c));
      },
      isWidgetEntity,
      getFieldCreationMode: (key) => {
        const entity = getTargetEntity(key);
        return getEntityFieldCreationMode(
          key ?? "AdmissionCandidate",
          entity,
          isWidgetEntity(key),
        );
      },
      getAllowedMappingTypes: (key, isWidgetField) => {
        if (isWidgetField) return ["CUSTOM_HANDLER"];
        if (key === "AdmissionDocumentUpload") return ["CUSTOM_HANDLER"];
        if (key === "AdmissionApplication") return ["COLUMN"];
        if (isWidgetEntity(key)) return ["CUSTOM_HANDLER"];
        return ["COLUMN", "META_DATA"];
      },
      getFieldTypeOptionsForEntity: (key, currentFieldType) => {
        const entity = getTargetEntity(key);
        const all = contract.fieldTypes
          .filter((f) => f.key != null && f.key.length > 0 && !f.disabled)
          .map((f) => ({
            value: f.key,
            label: f.label ?? f.key,
            disabled: f.disabled,
          }));

        // FILE-only section: show only FILE (plus the current type to preserve it)
        if (entity?.key === "AdmissionDocumentUpload") {
          return all.filter(
            (f) => f.value === "FILE" || f.value === currentFieldType,
          );
        }

        if (entity?.widgetFieldType) {
          return all.filter(
            (f) =>
              f.value === entity.widgetFieldType ||
              f.value === currentFieldType,
          );
        }

        // All other sections: scalar types only — no WIDGET_* and no FILE
        return all.filter(
          (f) =>
            !String(f.value).startsWith("WIDGET_") && f.value !== "FILE",
        );
      },
    };
  }, [data, isError, isLoading]);
}
