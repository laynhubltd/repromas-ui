import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Modal, Spin, Typography } from "antd";
import type { ReactNode } from "react";
import { useDeleteAdmissionCycleModal } from "../../hooks/useAdmissionCycleModal";
import type { AdmissionCycle } from "../../types/admission-cycle";

type DeleteAdmissionCycleModalProps = {
  open: boolean;
  target: AdmissionCycle | null;
  onClose: () => void;
};

export function DeleteAdmissionCycleModal({
  open,
  target,
  onClose,
}: DeleteAdmissionCycleModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteAdmissionCycleModal(target, open, onClose);
  const { isDeleting, error, isCheckingCandidates, candidateCount, canDelete } =
    state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Delete Admission Cycle"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={480}
      destroyOnHidden
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
        <ErrorAlert variant="form" error={error} />

        <ConditionalRenderer when={target !== null}>
          <ConditionalRenderer when={isCheckingCandidates}>
            <FlexCentered>
              <Spin size="small" />
              <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                Checking linked candidates…
              </Typography.Text>
            </FlexCentered>
          </ConditionalRenderer>

          <ConditionalRenderer when={!isCheckingCandidates}>
            <Typography.Text>
              Delete cycle{" "}
              <Typography.Text strong>"{target?.name}"</Typography.Text>?
              This cannot be undone.
            </Typography.Text>

            <ConditionalRenderer when={!canDelete}>
              <Typography.Text
                type="danger"
                style={{ display: "block", marginTop: 12 }}
              >
                This cycle has {candidateCount} linked candidate
                {candidateCount === 1 ? "" : "s"}. Prefer closing the cycle
                instead of deleting it.
              </Typography.Text>
            </ConditionalRenderer>

            <ConditionalRenderer when={canDelete}>
              <Typography.Text
                type="secondary"
                style={{ display: "block", marginTop: 12, fontSize: token.fontSizeSM }}
              >
                Delete is only recommended for mistakenly created empty cycles.
              </Typography.Text>
            </ConditionalRenderer>
          </ConditionalRenderer>
        </ConditionalRenderer>
      </div>

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
        <PermissionGuard permission={Permission.AdmissionCyclesDelete}>
          <Button
            type="primary"
            danger
            loading={isDeleting}
            disabled={isDeleting || isCheckingCandidates || !canDelete}
            onClick={handleConfirm}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            Delete Cycle
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

function FlexCentered({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>{children}</div>
  );
}
