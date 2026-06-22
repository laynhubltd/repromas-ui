import type {
  ContractFieldPreset,
  FieldType,
  FormField,
  FormSection,
  MappingConfig,
  RenderField,
  RenderSection,
  TargetEntity,
} from "@/features/dynamic-form/types";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  useCreateFormFieldMutation,
  useCreateFormSectionMutation,
  useDeleteFormFieldMutation,
  useDeleteFormSectionMutation,
  useGetDynamicFormQuery,
  useGetFormSectionsQuery,
  useGetSectionFieldsQuery,
  usePublishDynamicFormMutation,
  useUpdateFormFieldMutation,
  useUpdateFormSectionMutation,
} from "../api/dynamicFormAdminApi";
import {
  FormBuilderActionType,
  formBuilderReducer,
  initialFormBuilderState,
} from "../state/formBuilderState";
import {
  buildColumnFieldRequest,
  buildFileFieldRequest,
  buildMetadataFieldRequest,
  buildPresetFieldRequest,
  getNextDisplayOrder,
  getUnusedAllowlistedColumns,
} from "../utils/buildFieldPayload";
import { evaluatePublishIssues } from "../utils/evaluatePublishIssues";
import { applyUniqueOrderUpdates } from "../utils/applyUniqueOrderUpdates";
import { isWidgetFieldType, isFileSection } from "../utils/fieldConfigDefaults";
import {
  buildMetadataMappingConfig,
  flattenFormFields,
  recomputeMetadataJsonKeysForSection,
} from "../utils/metadataJsonKey";
import {
  buildMappingConfigFromForm,
  parseOptionsConfigFromForm,
  parseValidationConfigFromForm,
  parseVisibilityConfigFromForm,
  serializeOptionsConfigForForm,
  serializeValidationConfigForForm,
  serializeVisibilityConfigForForm,
  type FieldFormValues,
} from "../utils/parseFieldFormValues";
import {
  ADMISSION_DOCUMENT_UPLOAD_HANDLER,
  DOCUMENT_TYPE_OPTIONS_RESOLVER,
} from "@/shared/constants/dynamicFormOptions";
import { useAllSectionFields } from "./useAllSectionFields";
import { useBuilderContract } from "./useBuilderContract";

function toRenderSection(
  section: FormSection,
  fields: FormField[],
): RenderSection {
  return {
    id: section.id,
    title: section.title,
    description: section.description,
    stepOrder: section.stepOrder,
    fields: fields.map((f) => ({
      fieldKey: f.fieldKey,
      label: f.label,
      helpText: f.helpText,
      fieldType: f.fieldType,
      isRequired: f.isRequired,
      isReadOnly: f.isReadOnly,
      displayOrder: f.displayOrder,
      options:
        f.optionsConfig && "options" in f.optionsConfig
          ? f.optionsConfig.options
          : null,
      ui: null,
      visibilityConfig: f.visibilityConfig,
    })),
  };
}

async function createFieldFromPreset(
  createField: ReturnType<typeof useCreateFormFieldMutation>[0],
  sectionId: number,
  preset: ContractFieldPreset,
  displayOrder: number,
) {
  return createField({
    sectionId,
    ...buildPresetFieldRequest(preset, displayOrder),
  }).unwrap();
}

export function useFormBuilder(formId: number) {
  const [builderState, dispatch] = useReducer(
    formBuilderReducer,
    initialFormBuilderState,
  );
  const [sectionForm] = Form.useForm();
  const [fieldForm] = Form.useForm();
  const handleApiError = useApiError();
  const contract = useBuilderContract();

  const {
    data: form,
    isLoading: isFormLoading,
    isError: isFormError,
    error: formError,
    refetch: refetchForm,
  } = useGetDynamicFormQuery(formId);
  const {
    data: sections = [],
    isLoading: isSectionsLoading,
    isError: isSectionsError,
    error: sectionsError,
    refetch: refetchSections,
  } = useGetFormSectionsQuery(formId);

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.stepOrder - b.stepOrder),
    [sections],
  );

  const sectionIds = useMemo(
    () => sortedSections.map((s) => s.id),
    [sortedSections],
  );
  const { fieldsBySectionId } = useAllSectionFields(sectionIds);

  const selectedSection = sortedSections.find(
    (s) => s.id === builderState.selectedSectionId,
  ) ?? sortedSections[0] ?? null;

  useEffect(() => {
    if (selectedSection && builderState.selectedSectionId === null) {
      dispatch({
        type: FormBuilderActionType.SetSelectedSection,
        section: selectedSection,
      });
    }
  }, [selectedSection, builderState.selectedSectionId]);

  const {
    data: fields = [],
    isLoading: isFieldsLoading,
    refetch: refetchFields,
  } = useGetSectionFieldsQuery(selectedSection?.id ?? 0, {
    skip: !selectedSection?.id,
  });

  const sortedFields = useMemo(
    () => [...fields].sort((a, b) => a.displayOrder - b.displayOrder),
    [fields],
  );

  const selectedField =
    sortedFields.find((f) => f.id === builderState.selectedFieldId) ?? null;

  const [createSection, { isLoading: isCreatingSection }] =
    useCreateFormSectionMutation();
  const [updateSection, { isLoading: isUpdatingSection }] =
    useUpdateFormSectionMutation();
  const [deleteSection] = useDeleteFormSectionMutation();
  const [createField, { isLoading: isCreatingField }] =
    useCreateFormFieldMutation();
  const [updateField, { isLoading: isUpdatingField }] =
    useUpdateFormFieldMutation();
  const [deleteField] = useDeleteFormFieldMutation();
  const [publishForm, { isLoading: isPublishing }] =
    usePublishDynamicFormMutation();

  const isDraft = form?.status === "DRAFT";
  const isStructureLocked = form != null && form.status !== "DRAFT";

  const loadError = useMemo(
    () =>
      deriveSectionErrorMessage(isFormError || isSectionsError, formError ?? sectionsError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isFormError, isSectionsError, formError, sectionsError],
  );

  const selectedEntityConfig = contract.getTargetEntity(
    selectedSection?.targetEntity,
  );

  const fieldCreationMode = contract.getFieldCreationMode(
    selectedSection?.targetEntity,
  );

  const unusedColumns = useMemo(
    () => getUnusedAllowlistedColumns(selectedEntityConfig, sortedFields),
    [selectedEntityConfig, sortedFields],
  );

  useEffect(() => {
    if (builderState.panelMode === "section" && selectedSection) {
      sectionForm.setFieldsValue({
        title: selectedSection.title,
        description: selectedSection.description ?? undefined,
        stepOrder: selectedSection.stepOrder,
        targetEntity: selectedSection.targetEntity,
        saveStrategy: selectedSection.saveStrategy,
        handlerKey: selectedSection.handlerKey ?? undefined,
        hydrateOrder: selectedSection.hydrateOrder,
        isRequired: selectedSection.isRequired,
      });
    }
  }, [builderState.panelMode, selectedSection, sectionForm]);

  useEffect(() => {
    if (builderState.panelMode === "field" && selectedField) {
      const mapping = selectedField.mappingConfig;
      const optionsForm = serializeOptionsConfigForForm(selectedField.optionsConfig);
      const visibilityForm = serializeVisibilityConfigForForm(
        selectedField.visibilityConfig,
      );
      fieldForm.setFieldsValue({
        fieldKey: selectedField.fieldKey,
        label: selectedField.label,
        helpText: selectedField.helpText ?? undefined,
        fieldType: selectedField.fieldType,
        displayOrder: selectedField.displayOrder,
        mappingType: mapping.type,
        columnName:
          mapping.type === "COLUMN" ? mapping.column_name : undefined,
        handlerKey:
          mapping.type === "CUSTOM_HANDLER" ? mapping.handler_key : undefined,
        optionsSource: optionsForm.optionsSource,
        staticOptionsJson: optionsForm.staticOptionsJson,
        dependsOnFieldKey: optionsForm.dependsOnFieldKey ?? "stateId",
        validationConfigJson: serializeValidationConfigForForm(
          selectedField.validationConfig,
        ),
        ...visibilityForm,
        isRequired: selectedField.isRequired,
        isReadOnly: selectedField.isReadOnly,
      });
    }
  }, [builderState.panelMode, selectedField, fieldForm]);

  const previewSections: RenderSection[] = useMemo(() => {
    if (!selectedSection) return [];
    return [toRenderSection(selectedSection, sortedFields)];
  }, [selectedSection, sortedFields]);

  const defaultPreviewValues = useMemo((): Record<string, unknown> => {
    const preset = selectedEntityConfig?.fieldPresets?.[0];
    if (!preset?.fieldKey || !selectedEntityConfig?.payloadContract) {
      return {};
    }
    return { [preset.fieldKey]: selectedEntityConfig.payloadContract };
  }, [selectedEntityConfig]);

  const widgetPreviewSection: RenderSection | null = useMemo(() => {
    if (!selectedSection || !contract.isWidgetEntity(selectedSection.targetEntity)) {
      return null;
    }
    if (sortedFields.length > 0) {
      return toRenderSection(selectedSection, sortedFields);
    }
    const preset = selectedEntityConfig?.fieldPresets?.[0];
    if (!preset) return null;
    const sampleField: RenderField = {
      fieldKey: preset.fieldKey,
      label: preset.label,
      helpText: preset.helpText ?? null,
      fieldType: preset.fieldType,
      isRequired: preset.isRequired ?? false,
      isReadOnly: true,
      displayOrder: 1,
      options: null,
      ui: null,
      visibilityConfig: null,
    };
    return {
      id: selectedSection.id,
      title: selectedSection.title,
      description: selectedSection.description,
      stepOrder: selectedSection.stepOrder,
      fields: [sampleField],
    };
  }, [selectedSection, sortedFields, selectedEntityConfig, contract]);

  const autoAddPresetFields = useCallback(
    async (section: FormSection, entityConfig: NonNullable<typeof selectedEntityConfig>) => {
      const presets = entityConfig.fieldPresets ?? [];
      if (presets.length === 0) return;
      const mode = contract.getFieldCreationMode(section.targetEntity);
      if (mode !== "widget-preset" && mode !== "preset-only") return;

      for (let i = 0; i < presets.length; i++) {
        await createFieldFromPreset(createField, section.id, presets[i], i + 1);
      }
      await refetchFields();
    },
    [contract, createField, refetchFields],
  );

  const handleAddSection = useCallback(
    async (targetEntity?: TargetEntity) => {
      if (!formId || isStructureLocked) return;
      const nextOrder =
        sortedSections.length > 0
          ? Math.max(...sortedSections.map((s) => s.stepOrder)) + 1
          : 1;
      const entityKey =
        targetEntity ?? contract.contract.targetEntities[0]?.key ?? "AdmissionCandidate";
      const entityConfig = contract.getTargetEntity(entityKey);
      try {
        const created = await createSection({
          formId,
          title: entityConfig?.label
            ? `${entityConfig.label} (Step ${nextOrder})`
            : `Section ${nextOrder}`,
          stepOrder: nextOrder,
          targetEntity: entityKey,
          saveStrategy: entityConfig?.defaultSaveStrategy ?? "MERGE",
          handlerKey: entityConfig?.handlerKey ?? null,
          hydrateOrder: entityConfig?.defaultHydrateOrder ?? nextOrder * 10,
          isRequired: true,
        }).unwrap();
        await refetchSections();
        dispatch({
          type: FormBuilderActionType.SetSelectedSection,
          section: created,
        });

        if (entityConfig) {
          await autoAddPresetFields(created, entityConfig);
        }

        notifyMutationSuccess(mutationSuccessMessage("Section", "created"));
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
      }
    },
    [
      formId,
      isStructureLocked,
      sortedSections,
      contract,
      createSection,
      refetchSections,
      autoAddPresetFields,
      handleApiError,
    ],
  );

  const handleTargetEntityChange = useCallback(
    (targetEntity: TargetEntity) => {
      const entityConfig = contract.getTargetEntity(targetEntity);
      if (!entityConfig) return;
      sectionForm.setFieldsValue({
        targetEntity,
        saveStrategy: entityConfig.defaultSaveStrategy,
        handlerKey: entityConfig.handlerKey ?? undefined,
        hydrateOrder: entityConfig.defaultHydrateOrder,
      });
    },
    [contract, sectionForm],
  );

  const handleSaveSection = async () => {
    if (!selectedSection || !formId || isStructureLocked) return;
    try {
      const values = await sectionForm.validateFields();
      const entityConfig = contract.getTargetEntity(values.targetEntity);
      const isWidget = contract.isWidgetEntity(values.targetEntity);
      const newTitle = values.title.trim();
      const titleChanged = newTitle !== selectedSection.title;

      await updateSection({
        id: selectedSection.id,
        formId,
        body: {
          title: newTitle,
          description: values.description?.trim() || null,
          stepOrder: values.stepOrder,
          targetEntity: values.targetEntity,
          saveStrategy: isWidget
            ? (entityConfig?.defaultSaveStrategy ?? "CUSTOM_HANDLER")
            : values.saveStrategy,
          handlerKey: isWidget
            ? (entityConfig?.handlerKey ?? null)
            : values.handlerKey?.trim() || null,
          hydrateOrder: values.hydrateOrder,
          isRequired: values.isRequired,
        },
      }).unwrap();

      if (titleChanged) {
        const sectionFields =
          fieldsBySectionId[selectedSection.id] ?? sortedFields;
        const allFormFields = flattenFormFields(fieldsBySectionId);
        const metadataUpdates = recomputeMetadataJsonKeysForSection(
          newTitle,
          sectionFields,
          allFormFields,
        );

        for (const update of metadataUpdates) {
          const field = sectionFields.find((f) => f.id === update.fieldId);
          if (!field) continue;
          await updateField({
            id: field.id,
            sectionId: selectedSection.id,
            body: {
              label: field.label,
              helpText: field.helpText,
              fieldType: field.fieldType,
              displayOrder: field.displayOrder,
              mappingConfig: { type: "META_DATA", json_key: update.json_key },
              validationConfig: field.validationConfig,
              visibilityConfig: field.visibilityConfig,
              optionsConfig: field.optionsConfig,
              isRequired: field.isRequired,
              isReadOnly: field.isReadOnly,
            },
          }).unwrap();
        }

        if (metadataUpdates.length > 0) {
          await refetchFields();
        }
      }

      await refetchSections();
      notifyMutationSuccess(mutationSuccessMessage("Section", "updated"));
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "PUT" },
        form: sectionForm,
      });
    }
  };

  const handleDeleteSection = async (section: FormSection) => {
    if (!formId || isStructureLocked) return;
    try {
      await deleteSection({ id: section.id, formId }).unwrap();
      await refetchSections();
      dispatch({ type: FormBuilderActionType.SetSelectedSection, section: null });
      notifyMutationSuccess(mutationSuccessMessage("Section", "deleted"));
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
    }
  };

  const handleAddMetadataField = async (fieldType: FieldType) => {
    if (!selectedSection || isStructureLocked) return;
    if (fieldCreationMode !== "column-or-metadata") return;
    const nextOrder = getNextDisplayOrder(sortedFields);
    try {
      const allFormFields = flattenFormFields(fieldsBySectionId);
      const payload = buildMetadataFieldRequest(
        fieldType,
        nextOrder,
        selectedSection.title,
        allFormFields,
      );
      const created = await createField({
        sectionId: selectedSection.id,
        ...payload,
      }).unwrap();
      await refetchFields();
      dispatch({ type: FormBuilderActionType.SetSelectedField, field: created });
      notifyMutationSuccess(mutationSuccessMessage("Field", "created"));
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  };

  const handleAddFileField = async (
    fieldKey: string,
    label: string,
    isRequired: boolean,
  ) => {
    if (!selectedSection || isStructureLocked) return;
    if (!isFileSection(selectedSection.targetEntity)) return;
    const nextOrder = getNextDisplayOrder(sortedFields);
    try {
      const payload = buildFileFieldRequest(fieldKey, label, nextOrder, isRequired);
      const created = await createField({
        sectionId: selectedSection.id,
        ...payload,
      }).unwrap();
      await refetchFields();
      dispatch({ type: FormBuilderActionType.SetSelectedField, field: created });
      notifyMutationSuccess(mutationSuccessMessage("Field", "created"));
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  };

  const handleAddColumnField = async (columnName: string) => {
    if (!selectedSection || isStructureLocked) return;
    const nextOrder = getNextDisplayOrder(sortedFields);
    const payload = buildColumnFieldRequest(columnName, nextOrder, sortedFields);
    if (!payload) return;
    try {
      const created = await createField({
        sectionId: selectedSection.id,
        ...payload,
      }).unwrap();
      await refetchFields();
      dispatch({ type: FormBuilderActionType.SetSelectedField, field: created });
      notifyMutationSuccess(mutationSuccessMessage("Field", "created"));
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  };

  const handleAddPresetField = useCallback(
    async (preset: ContractFieldPreset) => {
      if (!selectedSection || isStructureLocked) return;
      const nextOrder = getNextDisplayOrder(sortedFields);
      try {
        const created = await createFieldFromPreset(
          createField,
          selectedSection.id,
          preset,
          nextOrder,
        );
        await refetchFields();
        dispatch({ type: FormBuilderActionType.SetSelectedField, field: created });
        notifyMutationSuccess(mutationSuccessMessage("Field", "created"));
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
      }
    },
    [
      selectedSection,
      isStructureLocked,
      sortedFields,
      createField,
      refetchFields,
      handleApiError,
    ],
  );

  const handleSaveField = async () => {
    if (!selectedField || !selectedSection || isStructureLocked) return;
    try {
      const values = (await fieldForm.validateFields()) as FieldFormValues;
      const mergedFieldsBySectionId = { ...fieldsBySectionId };
      mergedFieldsBySectionId[selectedSection.id] = sortedFields;
      const allFormFields = flattenFormFields(mergedFieldsBySectionId);

      const isFile = (values.fieldType as FieldType) === "FILE";

      let mappingConfig: MappingConfig;
      if (isFile) {
        mappingConfig = {
          type: "CUSTOM_HANDLER",
          handler_key: ADMISSION_DOCUMENT_UPLOAD_HANDLER,
        };
      } else if (values.mappingType === "META_DATA") {
        mappingConfig = buildMetadataMappingConfig(
          selectedSection.title,
          values.label.trim(),
          allFormFields,
          selectedField.id,
        );
      } else {
        mappingConfig = buildMappingConfigFromForm(values);
      }

      const optionsConfig = isFile
        ? { source: DOCUMENT_TYPE_OPTIONS_RESOLVER, params: {} }
        : parseOptionsConfigFromForm(values);

      const validationConfig = parseValidationConfigFromForm(
        values,
        selectedField.validationConfig,
      );
      const visibilityConfig = isFile ? null : parseVisibilityConfigFromForm(values);

      await updateField({
        id: selectedField.id,
        sectionId: selectedSection.id,
        body: {
          label: values.label.trim(),
          helpText: values.helpText?.trim() || null,
          fieldType: values.fieldType as FieldType,
          displayOrder: values.displayOrder ?? selectedField.displayOrder,
          mappingConfig,
          validationConfig,
          visibilityConfig,
          optionsConfig,
          isRequired: values.isRequired,
          isReadOnly: values.isReadOnly,
        },
      }).unwrap();
      await refetchFields();
      notifyMutationSuccess(mutationSuccessMessage("Field", "updated"));
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "PUT" },
        form: fieldForm,
      });
    }
  };

  const handleDeleteField = async (field: FormField) => {
    if (!selectedSection || isStructureLocked) return;
    try {
      await deleteField({ id: field.id, sectionId: selectedSection.id }).unwrap();
      await refetchFields();
      dispatch({ type: FormBuilderActionType.SetSelectedField, field: null });
      notifyMutationSuccess(mutationSuccessMessage("Field", "deleted"));
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
    }
  };

  const handleReorderSections = async (reordered: FormSection[]) => {
    if (!formId || isStructureLocked) return;
    try {
      await applyUniqueOrderUpdates(reordered, async (section, stepOrder) => {
        await updateSection({
          id: section.id,
          formId,
          body: {
            title: section.title,
            description: section.description,
            stepOrder,
            targetEntity: section.targetEntity,
            saveStrategy: section.saveStrategy,
            handlerKey: section.handlerKey,
            hydrateOrder: section.hydrateOrder,
            isRequired: section.isRequired,
          },
        }).unwrap();
      });
      await refetchSections();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "PUT" },
      });
    }
  };

  const handleReorderFields = async (reordered: FormField[]) => {
    if (!selectedSection || isStructureLocked) return;
    try {
      await applyUniqueOrderUpdates(reordered, async (field, displayOrder) => {
        await updateField({
          id: field.id,
          sectionId: selectedSection.id,
          body: {
            label: field.label,
            helpText: field.helpText,
            fieldType: field.fieldType,
            displayOrder,
            mappingConfig: field.mappingConfig,
            validationConfig: field.validationConfig,
            visibilityConfig: field.visibilityConfig,
            optionsConfig: field.optionsConfig,
            isRequired: field.isRequired,
            isReadOnly: field.isReadOnly,
          },
        }).unwrap();
      });
      await refetchFields();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "PUT" },
      });
    }
  };

  const handleMoveSection = async (sectionId: number, direction: "up" | "down") => {
    const index = sortedSections.findIndex((s) => s.id === sectionId);
    if (index < 0) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedSections.length) return;
    const next = [...sortedSections];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    await handleReorderSections(next);
  };

  const handleMoveField = async (fieldId: number, direction: "up" | "down") => {
    const index = sortedFields.findIndex((f) => f.id === fieldId);
    if (index < 0) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedFields.length) return;
    const next = [...sortedFields];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    await handleReorderFields(next);
  };

  const handlePublish = async () => {
    if (!formId) return;
    try {
      await publishForm(formId).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Form template", "updated"));
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  };

  const hydrateOrderConflicts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const s of sortedSections) {
      counts.set(s.hydrateOrder, (counts.get(s.hydrateOrder) ?? 0) + 1);
    }
    return sortedSections
      .filter((s) => (counts.get(s.hydrateOrder) ?? 0) > 1)
      .map((s) => ({ id: s.id, title: s.title, hydrateOrder: s.hydrateOrder }));
  }, [sortedSections]);

  const hydrateOrderRows = useMemo(
    () =>
      [...sortedSections]
        .sort((a, b) => a.hydrateOrder - b.hydrateOrder)
        .map((s) => {
          const guide = contract.contract.hydrateOrderGuide.find(
            (g) => g.targetEntity === s.targetEntity,
          );
          return {
            id: s.id,
            title: s.title,
            targetEntity: s.targetEntity,
            hydrateOrder: s.hydrateOrder,
            recommendedOrder: guide?.hydrateOrder ?? null,
            conflict: hydrateOrderConflicts.some((c) => c.id === s.id),
            orderDeviation:
              guide != null && guide.hydrateOrder !== s.hydrateOrder,
          };
        }),
    [sortedSections, hydrateOrderConflicts, contract.contract.hydrateOrderGuide],
  );

  const hydrateOrderGuideRows = useMemo(
    () =>
      [...contract.contract.hydrateOrderGuide]
        .sort((a, b) => a.hydrateOrder - b.hydrateOrder)
        .map((g) => ({
          key: g.targetEntity,
          hydrateOrder: g.hydrateOrder,
          targetEntity: g.targetEntity,
          reason: g.reason ?? "—",
        })),
    [contract.contract.hydrateOrderGuide],
  );

  const mergedFieldsBySectionId = useMemo(() => {
    const merged = { ...fieldsBySectionId };
    if (selectedSection) {
      merged[selectedSection.id] = sortedFields;
    }
    return merged;
  }, [fieldsBySectionId, selectedSection, sortedFields]);

  const publishIssues = useMemo(
    () =>
      evaluatePublishIssues({
        sections: sortedSections,
        fieldsBySectionId: mergedFieldsBySectionId,
        contract: contract.contract,
        hydrateOrderConflicts,
      }),
    [sortedSections, mergedFieldsBySectionId, contract.contract, hydrateOrderConflicts],
  );

  const canPublish = isDraft && publishIssues.length === 0;

  const handleClose = useCallback(() => {
    dispatch({ type: FormBuilderActionType.Reset });
    sectionForm.resetFields();
    fieldForm.resetFields();
  }, [sectionForm, fieldForm]);

  const allowedMappingTypes = useMemo(() => {
    if (!selectedField || !selectedSection) return ["COLUMN", "META_DATA"] as const;
    return contract.getAllowedMappingTypes(
      selectedSection.targetEntity,
      isWidgetFieldType(selectedField.fieldType),
    );
  }, [contract, selectedField, selectedSection]);

  const columnOptionsForField = useMemo(() => {
    if (!selectedSection) return [];
    return contract
      .getSelectableColumns(selectedSection.targetEntity)
      .map((c) => ({ value: c, label: c }));
  }, [contract, selectedSection]);

  return {
    state: {
      form,
      sections: sortedSections,
      fields: sortedFields,
      selectedSection,
      selectedField,
      builderState,
      isFormLoading,
      isSectionsLoading,
      isFieldsLoading,
      isDraft,
      isStructureLocked,
      previewSections,
      widgetPreviewSection,
      defaultPreviewValues,
      isPublishing,
      isSavingSection: isUpdatingSection,
      isSavingField: isUpdatingField,
      isCreatingSection,
      isCreatingField,
      isFormError,
      isSectionsError,
      loadError,
      contract: contract.contract,
      contractHelpers: contract,
      isContractLive: contract.isLive,
      selectedEntityConfig,
      fieldCreationMode,
      unusedColumns,
      hydrateOrderRows,
      hydrateOrderGuideRows,
      hydrateOrderConflicts,
      publishIssues,
      canPublish,
      allowedMappingTypes,
      columnOptionsForField,
    },
    actions: {
      dispatch,
      handleAddSection,
      handleTargetEntityChange,
      handleSaveSection,
      handleDeleteSection,
      handleAddMetadataField,
      handleAddColumnField,
      handleAddFileField,
      handleAddPresetField,
      handleSaveField,
      handleDeleteField,
      handleReorderSections,
      handleReorderFields,
      handleMoveSection,
      handleMoveField,
      handlePublish,
      handleClose,
      refetchSections,
      refetchFields,
      refetchForm,
    },
    forms: { sectionForm, fieldForm },
  };
}
