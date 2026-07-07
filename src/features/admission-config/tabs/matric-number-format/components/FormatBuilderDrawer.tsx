import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useIsMobile } from "@/hooks/useBreakpoint";
import {
  MATRIC_NUMBER_FORMAT_UI_COPY,
  matricFormatStatusColorByValue,
  matricFormatStatusLabelByValue,
  matricSlotLabel,
} from "@/shared/constants/matricNumberFormatOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { Button, Drawer, Flex, Input, Tag, Typography } from "antd";
import { useMatricNumberFormatBuilder } from "../hooks/useMatricNumberFormatBuilder";
import { MatricNumberFormatBuilderActionType } from "../state/matricNumberFormatBuilderState";
import type {
  MatricFormatActiveSlot,
  MatricNumberFormatPrerequisites,
} from "../types/matric-number-format";
import { ActivateRequirementsChecklist } from "./ActivateRequirementsChecklist";
import { CounterPartitionFields } from "./CounterPartitionFields";
import { FormatPreviewPanel } from "./FormatPreviewPanel";
import { PrerequisitesBanner } from "./PrerequisitesBanner";
import { TemplateSegmentEditor } from "./TemplateSegmentEditor";
import { TemplateTokenPalette } from "./TemplateTokenPalette";

type FormatBuilderDrawerProps = {
  formatId: number | null;
  readOnly: boolean;
  open: boolean;
  onClose: () => void;
  prerequisites: MatricNumberFormatPrerequisites | undefined;
  activeSlots: MatricFormatActiveSlot[];
  onActivate: () => void;
  onDuplicate: () => void;
};

export function FormatBuilderDrawer({
  formatId,
  readOnly,
  open,
  onClose,
  prerequisites,
  activeSlots,
  onActivate,
  onDuplicate,
}: FormatBuilderDrawerProps) {
  const token = useToken();
  const isMobile = useIsMobile();

  const { state, actions, flags } = useMatricNumberFormatBuilder(
    formatId,
    readOnly,
    open,
    onClose,
    prerequisites,
    activeSlots,
  );

  const {
    builderState,
    format,
    template,
    isFormatLoading,
    isSaving,
    unknownTokens,
    needsSession,
    isLengthInvalid,
    isSessionMissing,
    canActivate,
    activationBlockers,
    slotLockedTitle,
  } = state;

  const {
    dispatch,
    handleClose,
    handleSave,
    handleInsertToken,
    handleInsertLiteral,
    handleSegmentsChange,
    handleAdvancedTemplateChange,
  } = actions;

  return (
    <Drawer
      title={
        <Flex align="center" gap={8} wrap="wrap">
          <span>{readOnly ? "View Matric Format" : "Edit Matric Format"}</span>
          {format && (
            <Tag color={matricFormatStatusColorByValue[format.status]}>
              {matricFormatStatusLabelByValue[format.status]}
            </Tag>
          )}
          {format && <Tag>{matricSlotLabel(format.entryMode)}</Tag>}
        </Flex>
      }
      open={open}
      onClose={handleClose}
      size={isMobile ? "100%" : 1200}
      destroyOnHidden
      footer={
        <Flex vertical gap={12}>
          <ConditionalRenderer when={!readOnly && flags.isDraft && !canActivate}>
            <ActivateRequirementsChecklist blockers={activationBlockers} />
          </ConditionalRenderer>
          <Flex justify="flex-end" gap={8} wrap="wrap">
          <Button onClick={handleClose}>Close</Button>
          <ConditionalRenderer when={readOnly && format !== undefined && format !== null}>
            <PermissionGuard permission={Permission.MatricNumberFormatsCreate}>
              <Button onClick={onDuplicate}>Duplicate</Button>
            </PermissionGuard>
          </ConditionalRenderer>
          <ConditionalRenderer when={!readOnly && flags.isDraft}>
            <PermissionGuard permission={Permission.MatricNumberFormatsUpdate}>
              <Button loading={isSaving} onClick={() => void handleSave()}>
                Save Draft
              </Button>
            </PermissionGuard>
            <PermissionGuard permission={Permission.MatricNumberFormatsActivate}>
              <Button
                type="primary"
                disabled={!canActivate}
                onClick={onActivate}
                title={
                  !canActivate
                    ? slotLockedTitle ?? "Fix prerequisites, preview errors, or template issues before activating"
                    : undefined
                }
              >
                Activate
              </Button>
            </PermissionGuard>
          </ConditionalRenderer>
          </Flex>
        </Flex>
      }
    >
      <Flex vertical gap={24}>
        <PrerequisitesBanner prerequisites={prerequisites} compact />

        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {MATRIC_NUMBER_FORMAT_UI_COPY.forwardOnlyNote}
        </Typography.Text>

        <DataLoader loading={isFormatLoading}>
          <Flex vertical={isMobile} gap={24}>
            <ConditionalRenderer when={!readOnly}>
              <div style={{ flex: isMobile ? undefined : "0 0 220px" }}>
                <TemplateTokenPalette
                  onInsertToken={handleInsertToken}
                  onInsertLiteral={handleInsertLiteral}
                  disabled={readOnly}
                />
              </div>
            </ConditionalRenderer>

            <Flex vertical gap={24} style={{ flex: 1, minWidth: 0 }}>
              <Flex vertical gap={8}>
                <Typography.Text strong>Format code</Typography.Text>
                <Input
                  value={builderState.code}
                  disabled={readOnly}
                  maxLength={50}
                  onChange={(e) =>
                    dispatch({
                      type: MatricNumberFormatBuilderActionType.SetCode,
                      value: e.target.value,
                    })
                  }
                  style={{ maxWidth: 320 }}
                />
              </Flex>

              <TemplateSegmentEditor
                segments={builderState.segments}
                editorMode={builderState.editorMode}
                template={template}
                readOnly={readOnly}
                onEditorModeChange={(mode) =>
                  dispatch({
                    type: MatricNumberFormatBuilderActionType.SetEditorMode,
                    mode,
                  })
                }
                onSegmentsChange={handleSegmentsChange}
                onAdvancedTemplateChange={handleAdvancedTemplateChange}
              />

              <ConditionalRenderer when={unknownTokens.length > 0}>
                <Typography.Text type="danger" style={{ fontSize: token.fontSizeSM }}>
                  Unknown tokens: {unknownTokens.join(", ")}
                </Typography.Text>
              </ConditionalRenderer>

              <CounterPartitionFields
                counterPartition={builderState.counterPartition}
                sequencePadding={builderState.sequencePadding}
                initialValue={builderState.initialValue}
                readOnly={readOnly}
                onCounterPartitionChange={(value) =>
                  dispatch({
                    type: MatricNumberFormatBuilderActionType.SetCounterPartition,
                    value,
                  })
                }
                onSequencePaddingChange={(value) =>
                  dispatch({
                    type: MatricNumberFormatBuilderActionType.SetSequencePadding,
                    value,
                  })
                }
                onInitialValueChange={(value) =>
                  dispatch({
                    type: MatricNumberFormatBuilderActionType.SetInitialValue,
                    value,
                  })
                }
              />
            </Flex>

            <div style={{ flex: isMobile ? undefined : "0 0 280px" }}>
              <FormatPreviewPanel
                previewProgramId={builderState.previewProgramId}
                previewSessionId={builderState.previewSessionId}
                simulatedSequence={builderState.simulatedSequence}
                previewResult={builderState.previewResult}
                previewError={builderState.previewError}
                previewLoading={builderState.previewLoading}
                needsSession={needsSession}
                isLengthInvalid={isLengthInvalid}
                isSessionMissing={isSessionMissing}
                onProgramChange={(programId) =>
                  dispatch({
                    type: MatricNumberFormatBuilderActionType.SetPreviewProgramId,
                    value: programId,
                  })
                }
                onSessionChange={(sessionId) =>
                  dispatch({
                    type: MatricNumberFormatBuilderActionType.SetPreviewSessionId,
                    value: sessionId,
                  })
                }
                onSequenceChange={(sequence) =>
                  dispatch({
                    type: MatricNumberFormatBuilderActionType.SetSimulatedSequence,
                    value: sequence,
                  })
                }
              />
            </div>
          </Flex>
        </DataLoader>
      </Flex>
    </Drawer>
  );
}
