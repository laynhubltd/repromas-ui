// Feature: admission-config — Scoring Strategy
// Requirements: 10.1–10.8

import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { getScopeLabel } from "@/shared/constants/scoringStrategyOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeleteScoringStrategyModal } from "../../hooks/useScoringStrategyModal";
import type { AdmissionScoringStrategy } from "../../types/scoring-strategy";
import { resolveReferenceLabel } from "../../utils/resolveReferenceLabel";

export type DeleteScoringStrategyModalProps = {
  open: boolean;
  target: AdmissionScoringStrategy | null;
  onClose: () => void;
};

/**
 * DeleteScoringStrategyModal — confirmation modal for deleting a scoring strategy.
 *
 * Requirements: 10.1–10.8
 *
 * Props:
 * - open: Whether the modal is visible
 * - target: The strategy to delete (null when closed)
 * - onClose: Callback to close the modal
 *
 * Displays:
 * - Confirmation text with scope and referenceId
 * - Fallback warning paragraph
 * - Stronger warning if this is the only GLOBAL strategy
 * - Error alert if deletion fails
 * - Cancel and Delete buttons in footer
 */
export function DeleteScoringStrategyModal({
  open,
  target,
  onClose,
}: DeleteScoringStrategyModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteScoringStrategyModal(target, onClose);
  const { error, isDeleting, isOnlyGlobal } = state;
  const { handleConfirm, handleCancel } = actions;

  const scopeDisplay = target ? getScopeLabel(target.scope) : "Unknown";
  const referenceDisplay = target ? resolveReferenceLabel(target) : "this reference";

  return (
    <Modal
      title="Delete Scoring Strategy"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={480}
      closable
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: 24 }}>
        {/* Error alert (Req 10.6) */}
        <ErrorAlert error={error} />

        {/* Confirmation text (Req 10.1) */}
        <Typography.Text>
          Are you sure you want to delete the{" "}
          <Typography.Text strong>{scopeDisplay}</Typography.Text> strategy for{" "}
          <Typography.Text strong>{referenceDisplay}</Typography.Text>?
        </Typography.Text>

        {/* Fallback warning paragraph (Req 10.2) */}
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <Typography.Paragraph
            type="secondary"
            style={{ fontSize: token.fontSizeSM, lineHeight: 1.5 }}
          >
            Candidates currently covered by this rule will fall back to the next
            level (department, faculty, or global) on their next scoring run.
          </Typography.Paragraph>
        </div>

        {/* Stronger warning for only GLOBAL strategy (Req 10.3) */}
        <ConditionalRenderer when={isOnlyGlobal}>
          <Alert
            type="error"
            showIcon
            message="No fallback will exist for uncovered programs after deletion."
            style={{ marginBottom: 16 }}
          />
        </ConditionalRenderer>
      </div>

      {/* Footer with Cancel and Delete buttons (Req 10.7–10.8) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <PermissionGuard permission={Permission.AdmissionScoringStrategiesDelete}>
          <Button
            type="primary"
            danger
            loading={isDeleting}
            disabled={isDeleting}
            onClick={handleConfirm}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            Delete
          </Button>
        </PermissionGuard>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isDeleting}
          style={{
            height: 40,
            color: token.colorTextSecondary,
            fontWeight: 500,
            fontSize: token.fontSizeSM,
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
