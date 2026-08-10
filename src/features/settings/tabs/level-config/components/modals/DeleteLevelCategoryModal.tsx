// Feature: level-config
import { ExplainerCallout } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import { Button, Modal, Typography } from "antd";
import { useDeleteLevelCategoryModal } from "../../hooks/useLevelCategoryModal";
import type { LevelCategory } from "../../types/levelCategory";

export type DeleteLevelCategoryModalProps = {
  open: boolean;
  target: LevelCategory | null;
  onClose: () => void;
};

export function DeleteLevelCategoryModal({
  open,
  target,
  onClose,
}: DeleteLevelCategoryModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteLevelCategoryModal(target, onClose);
  const { isLoading } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title={<span style={{ color: token.colorError }}>Delete Level Category</span>}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={400}
      closable={!isLoading}
      maskClosable={!isLoading}
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <Typography.Text>
          Are you sure you want to delete the level category{" "}
          <Typography.Text strong>{target?.name}</Typography.Text>?
        </Typography.Text>

        <ExplainerCallout
          intent="warning"
          title="Important"
          body="A level category cannot be deleted if it has any levels assigned to it. You must delete or reassign its levels first."
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <Button
          onClick={handleCancel}
          disabled={isLoading}
          style={{ flex: 1, height: 40, fontWeight: 500 }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          danger
          loading={isLoading}
          disabled={isLoading}
          onClick={handleConfirm}
          style={{ flex: 1, height: 40, fontWeight: 600 }}
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
}
