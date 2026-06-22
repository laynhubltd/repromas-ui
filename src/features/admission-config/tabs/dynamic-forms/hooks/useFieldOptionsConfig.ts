import type {
  ContractOptionsResolver,
  FormField,
} from "@/features/dynamic-form/types";
import { LGA_OPTIONS_RESOLVER } from "@/shared/constants/dynamicFormOptions";
import { useMemo } from "react";
import {
  isGeographyColumn,
  listStateFieldKeysForDependsOn,
  serializeOptionsConfigForForm,
  suggestOptionsSourceForColumn,
} from "../utils/optionsConfigForm";

type UseFieldOptionsConfigInput = {
  selectedField: FormField;
  sectionFields: FormField[];
  optionsResolvers: ContractOptionsResolver[];
};

export function useFieldOptionsConfig({
  selectedField,
  sectionFields,
  optionsResolvers,
}: UseFieldOptionsConfigInput) {
  const columnName =
    selectedField.mappingConfig.type === "COLUMN"
      ? selectedField.mappingConfig.column_name
      : undefined;

  const suggestedResolver = useMemo(
    () => suggestOptionsSourceForColumn(columnName),
    [columnName],
  );

  const optionsFormSlice = useMemo(
    () => serializeOptionsConfigForForm(selectedField.optionsConfig),
    [selectedField.optionsConfig],
  );

  const dependsOnFieldOptions = useMemo(
    () =>
      listStateFieldKeysForDependsOn(sectionFields, selectedField.fieldKey).map(
        (key) => ({ value: key, label: key }),
      ),
    [sectionFields, selectedField.fieldKey],
  );

  const isLgaResolver =
    optionsFormSlice.optionsSource === LGA_OPTIONS_RESOLVER ||
    selectedField.optionsConfig?.source === LGA_OPTIONS_RESOLVER;

  const isGeographyColumnField = isGeographyColumn(columnName);

  const resolverLabels = useMemo(
    () => Object.fromEntries(optionsResolvers.map((r) => [r.key, r.label])),
    [optionsResolvers],
  );

  return {
    columnName,
    suggestedResolver,
    optionsFormSlice,
    dependsOnFieldOptions,
    isLgaResolver,
    isGeographyColumnField,
    resolverLabels,
  };
}
