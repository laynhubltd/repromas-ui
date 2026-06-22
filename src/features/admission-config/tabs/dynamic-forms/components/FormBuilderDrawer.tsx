import { ExplainerCallout } from "@/components/ui-kit";
import { DynamicFormSectionView } from "@/features/dynamic-form/components/field-renderers/DynamicFormSectionView";
import type {
  FieldType,
  FormField,
  FormSection,
  TargetEntity,
} from "@/features/dynamic-form/types";
import {
  DYNAMIC_FORM_DRAFT_ONLY_BANNER,
  DYNAMIC_FORM_OFFLINE_CONTRACT_WARNING,
  DYNAMIC_FORM_PUBLISH_WARNING,
} from "@/shared/constants/dynamicFormOptions";
import { useToken } from "@/shared/hooks/useToken";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EyeOutlined,
  HolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Button,
  Collapse,
  Drawer,
  Dropdown,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useState, useCallback } from "react";
import { FieldPropertiesPanel } from "./FieldPropertiesPanel";
import { AddFileFieldModal } from "./modals/AddFileFieldModal";
import { useFormBuilder } from "../hooks/useFormBuilder";
import { useFormBuilderPreviewOptions } from "../hooks/useFormBuilderPreviewOptions";
import { FormBuilderActionType } from "../state/formBuilderState";
import { isLgaGeographyFieldKey, isStateGeographyFieldKey } from "@/features/dynamic-form/utils/geographyFieldKeys";
import { sectionTitleRules } from "../utils/validators";

type FormBuilderDrawerProps = {
  formId: number;
  onClose: () => void;
};

const SCREEN_READER_INSTRUCTIONS =
  "To reorder, press Space or Enter to pick up an item, use the arrow keys to move, then Space or Enter to drop and Escape to cancel. You can also use the Move up and Move down buttons.";

function SortableSectionItem({
  section,
  isSelected,
  isLocked,
  isFirst,
  isLast,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  section: FormSection;
  isSelected: boolean;
  isLocked: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const token = useToken();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id, disabled: isLocked });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "8px 10px",
    marginBottom: 6,
    borderRadius: token.borderRadius,
    border: `${isSelected ? 2 : 1}px solid ${
      isSelected ? token.colorPrimary : token.colorBorder
    }`,
    background: isSelected ? token.colorPrimaryBg : token.colorBgContainer,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Flex justify="space-between" align="center" gap={4}>
        {!isLocked && (
          <Button
            type="text"
            size="small"
            aria-label={`Drag to reorder ${section.title}`}
            icon={<HolderOutlined />}
            style={{ cursor: "grab", touchAction: "none" }}
            {...attributes}
            {...listeners}
          />
        )}
        <div
          onClick={onSelect}
          style={{ flex: 1, cursor: "pointer", minWidth: 0 }}
        >
          <Typography.Text strong ellipsis>
            {section.stepOrder}. {section.title}
          </Typography.Text>
        </div>
        {!isLocked && (
          <Flex gap={0}>
            <Button
              type="text"
              size="small"
              aria-label={`Move ${section.title} up`}
              icon={<ArrowUpOutlined />}
              disabled={isFirst}
              onClick={onMoveUp}
            />
            <Button
              type="text"
              size="small"
              aria-label={`Move ${section.title} down`}
              icon={<ArrowDownOutlined />}
              disabled={isLast}
              onClick={onMoveDown}
            />
            <Button
              type="text"
              size="small"
              danger
              aria-label={`Delete ${section.title}`}
              icon={<DeleteOutlined />}
              onClick={onDelete}
            />
          </Flex>
        )}
      </Flex>
    </div>
  );
}

function SortableFieldItem({
  field,
  isSelected,
  isLocked,
  isFirst,
  isLast,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  field: FormField;
  isSelected: boolean;
  isLocked: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const token = useToken();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id, disabled: isLocked });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "6px 10px",
    marginBottom: 6,
    borderRadius: token.borderRadius,
    border: `${isSelected ? 2 : 1}px solid ${
      isSelected ? token.colorPrimary : token.colorBorderSecondary
    }`,
    background: isSelected ? token.colorPrimaryBg : token.colorBgLayout,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Flex justify="space-between" align="center" gap={4}>
        {!isLocked && (
          <Button
            type="text"
            size="small"
            aria-label={`Drag to reorder ${field.label}`}
            icon={<HolderOutlined />}
            style={{ cursor: "grab", touchAction: "none" }}
            {...attributes}
            {...listeners}
          />
        )}
        <div
          onClick={onSelect}
          style={{ flex: 1, cursor: "pointer", minWidth: 0 }}
        >
          <Typography.Text ellipsis>{field.label}</Typography.Text>
          <Tag style={{ marginLeft: 8 }}>{field.fieldType}</Tag>
        </div>
        {!isLocked && (
          <Flex gap={0}>
            <Button
              type="text"
              size="small"
              aria-label={`Move ${field.label} up`}
              icon={<ArrowUpOutlined />}
              disabled={isFirst}
              onClick={onMoveUp}
            />
            <Button
              type="text"
              size="small"
              aria-label={`Move ${field.label} down`}
              icon={<ArrowDownOutlined />}
              disabled={isLast}
              onClick={onMoveDown}
            />
            <Button
              type="text"
              size="small"
              danger
              aria-label={`Delete ${field.label}`}
              icon={<DeleteOutlined />}
              onClick={onDelete}
            />
          </Flex>
        )}
      </Flex>
    </div>
  );
}

export function FormBuilderDrawer({ formId, onClose }: FormBuilderDrawerProps) {
  const token = useToken();
  const { state, actions, forms } = useFormBuilder(formId);
  const [previewValues, setPreviewValues] = useState<Record<string, unknown>>({});
  const [addFileFieldOpen, setAddFileFieldOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleClose = () => {
    actions.handleClose();
    onClose();
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = state.sections.findIndex((s) => s.id === active.id);
    const newIndex = state.sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    actions.handleReorderSections(arrayMove(state.sections, oldIndex, newIndex));
  };

  const handleFieldDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = state.fields.findIndex((f) => f.id === active.id);
    const newIndex = state.fields.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    actions.handleReorderFields(arrayMove(state.fields, oldIndex, newIndex));
  };

  const selectedEntity = state.selectedEntityConfig;
  const isWidgetSection = state.contractHelpers.isWidgetEntity(
    state.selectedSection?.targetEntity,
  );
  const previewSection =
    state.previewSections[0] ?? state.widgetPreviewSection;
  const previewValuesForModal =
    Object.keys(previewValues).length > 0
      ? previewValues
      : state.defaultPreviewValues;
  const { stateOptions, lgaOptions } = useFormBuilderPreviewOptions(
    previewValuesForModal,
  );

  const handlePreviewFieldChange = useCallback(
    (key: string, value: unknown) => {
      setPreviewValues((prev) => {
        const next = { ...prev, [key]: value };
        if (isStateGeographyFieldKey(key)) {
          for (const field of previewSection?.fields ?? []) {
            if (isLgaGeographyFieldKey(field.fieldKey)) {
              next[field.fieldKey] = undefined;
            }
          }
          next.lgaId = undefined;
          next.lga_of_origin = undefined;
        }
        return next;
      });
    },
    [previewSection?.fields],
  );
  const metadataFieldTypes = state.selectedSection
    ? state.contractHelpers.getFieldTypeOptionsForEntity(
        state.selectedSection.targetEntity,
      )
    : [];

  const addSectionMenu = {
    items: state.contractHelpers.targetEntityOptions.map((opt) => ({
      key: opt.value,
      label: opt.label,
      onClick: () => actions.handleAddSection(opt.value),
    })),
  };

  const hydrateColumns = [
    { title: "Order", dataIndex: "hydrateOrder", key: "hydrateOrder", width: 80 },
    {
      title: "Recommended",
      dataIndex: "recommendedOrder",
      key: "recommendedOrder",
      width: 100,
      render: (value: number | null) => (value != null ? value : "—"),
    },
    { title: "Section", dataIndex: "title", key: "title" },
    { title: "Target entity", dataIndex: "targetEntity", key: "targetEntity" },
    {
      title: "",
      key: "status",
      width: 140,
      render: (_: unknown, row: (typeof state.hydrateOrderRows)[number]) => (
        <Flex gap={4}>
          {row.conflict && <Tag color="error">Conflict</Tag>}
          {row.orderDeviation && <Tag color="warning">Off guide</Tag>}
        </Flex>
      ),
    },
  ];

  const hydrateGuideColumns = [
    { title: "Order", dataIndex: "hydrateOrder", key: "hydrateOrder", width: 80 },
    { title: "Target entity", dataIndex: "targetEntity", key: "targetEntity" },
    { title: "Reason", dataIndex: "reason", key: "reason" },
  ];

  return (
    <Drawer
      title={state.form ? `Form Builder — ${state.form.name}` : "Form Builder"}
      open
      onClose={handleClose}
      destroyOnClose
      width="100%"
      styles={{ body: { padding: token.paddingSM } }}
      extra={
        <Flex gap={8}>
          <Button
            icon={<EyeOutlined />}
            onClick={() =>
              actions.dispatch({
                type: FormBuilderActionType.SetPreviewOpen,
                open: true,
              })
            }
            disabled={!previewSection}
          >
            Preview
          </Button>
          {state.isDraft && (
            <Tooltip
              title={
                state.canPublish ? undefined : state.publishIssues.join(" ")
              }
            >
              <Button
                type="primary"
                loading={state.isPublishing}
                disabled={!state.canPublish}
                onClick={actions.handlePublish}
              >
                Publish
              </Button>
            </Tooltip>
          )}
        </Flex>
      }
    >
      <DataLoader loading={state.isFormLoading || state.isSectionsLoading}>
        {(state.isFormError || state.isSectionsError) && (
          <ErrorAlert
            variant="section"
            error={state.loadError ?? "Failed to load form builder"}
            onRetry={() => {
              actions.refetchForm();
              actions.refetchSections();
            }}
          />
        )}

        {!state.isFormError && !state.isSectionsError && (
          <>
            {!state.isContractLive && (
              <ExplainerCallout
                intent="warning"
                title="Offline builder contract"
                body={DYNAMIC_FORM_OFFLINE_CONTRACT_WARNING}
                style={{ marginBottom: 16 }}
              />
            )}
            {state.isStructureLocked && (
              <ExplainerCallout
                intent="warning"
                title="Structure locked"
                body={DYNAMIC_FORM_DRAFT_ONLY_BANNER}
                style={{ marginBottom: 16 }}
              />
            )}
            {state.isDraft && (
              <ExplainerCallout
                intent="info"
                title="Draft mode"
                body={DYNAMIC_FORM_PUBLISH_WARNING}
                dismissible
                style={{ marginBottom: 16 }}
              />
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "260px 1fr 340px",
                gap: 16,
                minHeight: 480,
              }}
            >
              {/* Sections column */}
              <div
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadius,
                  padding: 12,
                }}
              >
                <Flex
                  justify="space-between"
                  align="center"
                  style={{ marginBottom: 12 }}
                >
                  <Typography.Text strong>Sections</Typography.Text>
                  <Dropdown
                    menu={addSectionMenu}
                    trigger={["click"]}
                    disabled={state.isStructureLocked}
                  >
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      disabled={state.isStructureLocked}
                    >
                      Add section
                    </Button>
                  </Dropdown>
                </Flex>

                <Typography.Paragraph
                  type="secondary"
                  style={{ fontSize: token.fontSizeSM }}
                >
                  Pick a target entity to add a step. Defaults are applied from
                  the builder contract.
                </Typography.Paragraph>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleSectionDragEnd}
                  accessibility={{
                    screenReaderInstructions: {
                      draggable: SCREEN_READER_INSTRUCTIONS,
                    },
                  }}
                >
                  <SortableContext
                    items={state.sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {state.sections.map((section, index) => (
                      <SortableSectionItem
                        key={section.id}
                        section={section}
                        isSelected={state.selectedSection?.id === section.id}
                        isLocked={state.isStructureLocked}
                        isFirst={index === 0}
                        isLast={index === state.sections.length - 1}
                        onSelect={() =>
                          actions.dispatch({
                            type: FormBuilderActionType.SetSelectedSection,
                            section,
                          })
                        }
                        onMoveUp={() => actions.handleMoveSection(section.id, "up")}
                        onMoveDown={() =>
                          actions.handleMoveSection(section.id, "down")
                        }
                        onDelete={() => actions.handleDeleteSection(section)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              {/* Canvas column */}
              <div
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadius,
                  padding: 12,
                }}
              >
                {!state.selectedSection ? (
                  <Typography.Text type="secondary">
                    Add or select a section to start adding fields.
                  </Typography.Text>
                ) : (
                  <>
                    {selectedEntity?.sectionSteps?.length ? (
                      <ExplainerCallout
                        intent="tip"
                        size="sm"
                        title={`Steps for ${selectedEntity.label ?? selectedEntity.key}`}
                        body={
                          <Flex vertical gap={2}>
                            {selectedEntity.sectionSteps.map((step) => (
                              <Typography.Text
                                key={step}
                                style={{ fontSize: token.fontSizeSM }}
                              >
                                • {step}
                              </Typography.Text>
                            ))}
                          </Flex>
                        }
                        style={{ marginBottom: 12 }}
                      />
                    ) : null}

                    <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
                      Fields in {state.selectedSection.title}
                    </Typography.Text>

                    {state.fieldCreationMode === "file-field" ? (
                      <Flex vertical gap={8} style={{ marginBottom: 12 }}>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: token.fontSizeSM }}
                        >
                          Each FILE field collects one document. Set the field
                          key to match the document type code (e.g.{" "}
                          <Typography.Text code>
                            birth_certificate
                          </Typography.Text>
                          ). Mapping and options resolver are applied
                          automatically.
                        </Typography.Text>
                        <Button
                          type="dashed"
                          size="small"
                          block
                          icon={<PlusOutlined />}
                          disabled={state.isStructureLocked}
                          onClick={() => setAddFileFieldOpen(true)}
                        >
                          Add document field
                        </Button>
                      </Flex>
                    ) : state.fieldCreationMode === "widget-preset" ||
                      state.fieldCreationMode === "preset-only" ? (
                      <Flex vertical gap={8} style={{ marginBottom: 12 }}>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: token.fontSizeSM }}
                        >
                          {state.fieldCreationMode === "widget-preset"
                            ? "Widget section: add exactly one contract preset field. Runtime renders the custom widget UI."
                            : "Application section: use the program choice preset so options resolve at render-package time."}
                        </Typography.Text>
                        {(selectedEntity?.fieldPresets ?? []).map((preset) => (
                          <Button
                            key={preset.fieldKey}
                            type="dashed"
                            size="small"
                            block
                            icon={<PlusOutlined />}
                            disabled={
                              state.isStructureLocked ||
                              (state.fieldCreationMode === "widget-preset" &&
                                state.fields.length > 0) ||
                              state.fields.some((f) => f.fieldKey === preset.fieldKey)
                            }
                            onClick={() => actions.handleAddPresetField(preset)}
                          >
                            Add {preset.label}
                          </Button>
                        ))}
                      </Flex>
                    ) : (
                      <Flex vertical gap={8} style={{ marginBottom: 12 }}>
                        {state.unusedColumns.length > 0 && (
                          <Flex wrap="wrap" gap={6}>
                            <Typography.Text
                              type="secondary"
                              style={{
                                width: "100%",
                                fontSize: token.fontSizeSM,
                              }}
                            >
                              Add from allowlisted column (recommended):
                            </Typography.Text>
                            {state.unusedColumns.map((col) => (
                              <Button
                                key={col}
                                size="small"
                                disabled={state.isStructureLocked}
                                onClick={() => actions.handleAddColumnField(col)}
                              >
                                + {col}
                              </Button>
                            ))}
                          </Flex>
                        )}
                        <Flex wrap="wrap" gap={6}>
                          <Typography.Text
                            type="secondary"
                            style={{
                              width: "100%",
                              fontSize: token.fontSizeSM,
                            }}
                          >
                            Or add metadata field:
                          </Typography.Text>
                          {metadataFieldTypes.map((opt) => (
                            <Button
                              key={opt.value}
                              size="small"
                              disabled={state.isStructureLocked}
                              onClick={() =>
                                actions.handleAddMetadataField(
                                  opt.value as FieldType,
                                )
                              }
                            >
                              + {opt.label}
                            </Button>
                          ))}
                        </Flex>
                      </Flex>
                    )}

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleFieldDragEnd}
                      accessibility={{
                        screenReaderInstructions: {
                          draggable: SCREEN_READER_INSTRUCTIONS,
                        },
                      }}
                    >
                      <SortableContext
                        items={state.fields.map((f) => f.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {state.fields.map((field, index) => (
                          <SortableFieldItem
                            key={field.id}
                            field={field}
                            isSelected={state.selectedField?.id === field.id}
                            isLocked={state.isStructureLocked}
                            isFirst={index === 0}
                            isLast={index === state.fields.length - 1}
                            onSelect={() =>
                              actions.dispatch({
                                type: FormBuilderActionType.SetSelectedField,
                                field,
                              })
                            }
                            onMoveUp={() =>
                              actions.handleMoveField(field.id, "up")
                            }
                            onMoveDown={() =>
                              actions.handleMoveField(field.id, "down")
                            }
                            onDelete={() => actions.handleDeleteField(field)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>

                    {isWidgetSection && state.widgetPreviewSection && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: 12,
                          borderRadius: token.borderRadius,
                          border: `1px dashed ${token.colorBorderSecondary}`,
                          background: token.colorBgLayout,
                        }}
                      >
                        <Typography.Text
                          type="secondary"
                          style={{
                            display: "block",
                            marginBottom: 8,
                            fontSize: token.fontSizeSM,
                          }}
                        >
                          Widget preview
                          {state.fields.length === 0
                            ? " (sample from contract — add the widget field to save)"
                            : ""}
                        </Typography.Text>
                        <DynamicFormSectionView
                          section={state.widgetPreviewSection}
                          values={state.defaultPreviewValues}
                          onFieldChange={() => undefined}
                          disabled
                        />
                      </div>
                    )}

                    {isWidgetSection && selectedEntity?.payloadContract && (
                      <Collapse
                        size="small"
                        style={{ marginTop: 12 }}
                        items={[
                          {
                            key: "payload",
                            label: "Submit payload contract (JSON)",
                            children: (
                              <pre
                                style={{
                                  margin: 0,
                                  fontSize: token.fontSizeSM,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {JSON.stringify(
                                  selectedEntity.payloadContract,
                                  null,
                                  2,
                                )}
                              </pre>
                            ),
                          },
                        ]}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Properties column */}
              <div
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadius,
                  padding: 12,
                  overflowY: "auto",
                }}
              >
                <Flex gap={8} style={{ marginBottom: 12 }}>
                  <Button
                    size="small"
                    type={
                      state.builderState.panelMode === "section"
                        ? "primary"
                        : "default"
                    }
                    onClick={() =>
                      actions.dispatch({
                        type: FormBuilderActionType.SetPanelMode,
                        mode: "section",
                      })
                    }
                  >
                    Section
                  </Button>
                  <Button
                    size="small"
                    type={
                      state.builderState.panelMode === "field"
                        ? "primary"
                        : "default"
                    }
                    disabled={!state.selectedField}
                    onClick={() =>
                      actions.dispatch({
                        type: FormBuilderActionType.SetPanelMode,
                        mode: "field",
                      })
                    }
                  >
                    Field
                  </Button>
                </Flex>

                {state.builderState.panelMode === "section" &&
                  state.selectedSection && (
                    <Form
                      form={forms.sectionForm}
                      layout="vertical"
                      disabled={state.isStructureLocked}
                    >
                      <Form.Item name="title" label="Title" rules={sectionTitleRules}>
                        <Input />
                      </Form.Item>
                      <Form.Item name="description" label="Description">
                        <Input.TextArea rows={2} />
                      </Form.Item>
                      <Form.Item name="stepOrder" label="Step order">
                        <InputNumber min={1} style={{ width: "100%" }} />
                      </Form.Item>
                      <Form.Item name="targetEntity" label="Target entity">
                        <Select
                          options={state.contractHelpers.targetEntityOptions}
                          onChange={(value) =>
                            actions.handleTargetEntityChange(value as TargetEntity)
                          }
                        />
                      </Form.Item>
                      <Form.Item name="saveStrategy" label="Save strategy">
                        <Select
                          options={state.contractHelpers.saveStrategyOptions}
                          disabled={isWidgetSection}
                        />
                      </Form.Item>
                      <Form.Item
                        name="handlerKey"
                        label="Handler key"
                        tooltip="Locked from builder contract for widget sections."
                      >
                        {isWidgetSection ? (
                          <Typography.Text>
                            {selectedEntity?.handlerKey ?? "—"}
                          </Typography.Text>
                        ) : (
                          <Input placeholder="Required for custom-handler sections" />
                        )}
                      </Form.Item>
                      <Form.Item name="hydrateOrder" label="Hydrate order">
                        <InputNumber min={1} style={{ width: "100%" }} />
                      </Form.Item>
                      <Form.Item
                        name="isRequired"
                        label="Required section"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Button
                        type="primary"
                        block
                        loading={state.isSavingSection}
                        disabled={state.isStructureLocked}
                        onClick={actions.handleSaveSection}
                      >
                        Save section
                      </Button>
                    </Form>
                  )}

                {state.builderState.panelMode === "field" &&
                  state.selectedField &&
                  state.selectedSection && (
                    <FieldPropertiesPanel
                      fieldForm={forms.fieldForm}
                      selectedField={state.selectedField}
                      sectionFields={state.fields}
                      sectionTitle={state.selectedSection.title}
                      isStructureLocked={state.isStructureLocked}
                      isSaving={state.isSavingField}
                      targetEntity={state.selectedSection.targetEntity}
                      fieldTypeOptions={state.contractHelpers.getFieldTypeOptionsForEntity(
                        state.selectedSection.targetEntity,
                        state.selectedField.fieldType,
                      )}
                      mappingTypeOptions={state.contractHelpers.mappingTypeOptions}
                      columnOptions={state.columnOptionsForField}
                      optionsResolvers={state.contract.optionsResolvers}
                      allowedMappingTypes={[...state.allowedMappingTypes]}
                      isWidgetFieldLocked={isWidgetSection}
                      onSave={actions.handleSaveField}
                    />
                  )}
              </div>
            </div>

            {/* Submit order & publish checklist */}
            <Collapse
              defaultActiveKey={state.publishIssues.length > 0 ? ["review"] : []}
              style={{ marginTop: 16 }}
              items={[
                {
                  key: "review",
                  label: (
                    <Flex gap={8} align="center">
                      <span>Submit order & publish checklist</span>
                      {state.publishIssues.length > 0 && (
                        <Tag color="error">
                          {state.publishIssues.length} to fix
                        </Tag>
                      )}
                      {state.canPublish && <Tag color="success">Ready</Tag>}
                    </Flex>
                  ),
                  children: (
                    <Flex vertical gap={16}>
                      {state.publishIssues.length > 0 && (
                        <Flex vertical gap={8}>
                          <Typography.Text strong>
                            Resolve before publishing
                          </Typography.Text>
                          {state.publishIssues.map((issue) => (
                            <Typography.Text key={issue} type="danger">
                              {issue}
                            </Typography.Text>
                          ))}
                        </Flex>
                      )}
                      <Typography.Text strong>Your sections</Typography.Text>
                      <Table
                        rowKey="id"
                        size="small"
                        pagination={false}
                        columns={hydrateColumns}
                        dataSource={state.hydrateOrderRows}
                      />
                      <Typography.Text strong style={{ marginTop: 8 }}>
                        Contract hydrate order guide
                      </Typography.Text>
                      <Table
                        rowKey="key"
                        size="small"
                        pagination={false}
                        columns={hydrateGuideColumns}
                        dataSource={state.hydrateOrderGuideRows}
                      />
                    </Flex>
                  ),
                },
              ]}
            />
          </>
        )}
      </DataLoader>

      <Modal
        title="Form Preview"
        open={state.builderState.previewOpen}
        onCancel={() =>
          actions.dispatch({
            type: FormBuilderActionType.SetPreviewOpen,
            open: false,
          })
        }
        footer={null}
        width={720}
      >
        {previewSection ? (
          <DynamicFormSectionView
            section={previewSection}
            values={previewValuesForModal}
            onFieldChange={handlePreviewFieldChange}
            disabled={state.fields.length === 0 && !!state.widgetPreviewSection}
            stateOptions={stateOptions}
            lgaOptions={lgaOptions}
          />
        ) : (
          <Typography.Text type="secondary">
            Add a widget field or select a section with fields to preview.
          </Typography.Text>
        )}
      </Modal>
      {state.selectedSection && (
        <AddFileFieldModal
          open={addFileFieldOpen}
          onClose={() => setAddFileFieldOpen(false)}
          onAdd={async (fieldKey, label, isRequired) => {
            await actions.handleAddFileField(fieldKey, label, isRequired);
            setAddFileFieldOpen(false);
          }}
          isAdding={state.isCreatingField}
        />
      )}
    </Drawer>
  );
}
